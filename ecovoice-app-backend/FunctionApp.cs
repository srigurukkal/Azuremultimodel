using Azure;
using Azure.AI.OpenAI;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision;
using Microsoft.Azure.CognitiveServices.Vision.ComputerVision.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using OpenAI.Chat;
using System.Text.Json;
using AuthorizationLevel = Microsoft.Azure.Functions.Worker.AuthorizationLevel;
using Container = Microsoft.Azure.Cosmos.Container;
using HttpTriggerAttribute = Microsoft.Azure.Functions.Worker.HttpTriggerAttribute;

namespace EcoVoiceFunctionApp
{
    public class FunctionApp(ILogger<FunctionApp> logger)
    {
        private readonly ILogger<FunctionApp> _logger = logger;
        private static readonly string CosmosEndpoint = Environment.GetEnvironmentVariable("CosmosDbEndpoint");
        private static readonly string CosmosKey = Environment.GetEnvironmentVariable("CosmosDbKey");
        private static readonly string AzureOpenAIEndpoint = Environment.GetEnvironmentVariable("AzureOpenAIEndpoint");
        private static readonly string AzureOpenAIKey = Environment.GetEnvironmentVariable("AzureOpenAIKey");
        private static readonly string CognitiveServicesKey = Environment.GetEnvironmentVariable("CognitiveServicesKey");
        private static readonly string CognitiveServicesEndpoint = Environment.GetEnvironmentVariable("CognitiveServicesEndpoint");
        private static readonly string SpeechServiceKey = Environment.GetEnvironmentVariable("SpeechServiceKey");
        private static readonly string SpeechServiceRegion = Environment.GetEnvironmentVariable("SpeechServiceRegion");
        private static readonly string StorageConnectionString = Environment.GetEnvironmentVariable("StorageConnectionString");
        private static readonly string StorageAccountKey = Environment.GetEnvironmentVariable("StorageAccountKey");

        private static readonly CosmosClient CosmosClient = new CosmosClient(CosmosEndpoint, CosmosKey);
        private static readonly Container UserContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("users");
        private static readonly Container ActivitiesContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("activities");
        private static string OpenAiDeploymentName = "sri2025-gpt40mini";


        [Function("AnalyzeUserInput")]
        public async Task<IActionResult> AnalyzeUserInput(
           [HttpTrigger(AuthorizationLevel.Function, "post", Route = "analyze")] HttpRequest req)
        {
            try
            {
                _logger.LogInformation("Analyzing user input");

                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var data = JsonConvert.DeserializeObject<UserInputRequest>(requestBody);

                var result = new AnalysisResult();

                // Based on input type, call the appropriate analysis function
                switch (data.InputType)
                {
                    case "text":
                        result = await AnalyzeText(data.Text, data.UserId);
                        break;
                    case "image":
                        result = await AnalyzeImage(data.ImageUrl, data.UserId);
                        break;
                    case "voice":
                        result = await AnalyzeVoice(data.VoiceUrl, data.UserId);
                        break;
                    default:
                        return new BadRequestObjectResult("Invalid input type");
                }

                // Calculate and update eco points
                await UpdateEcoPoints(data.UserId, result.EcoPoints);

                return new OkObjectResult(result);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private static async Task<ChatClient> GetChatClientAsync()
        {
            var client = new AzureOpenAIClient(new Uri(AzureOpenAIEndpoint), new AzureKeyCredential(AzureOpenAIKey));
            var chatClient = client.GetChatClient(OpenAiDeploymentName);
            return chatClient;
        }
        private static async Task<AnalysisResult> AnalyzeText(string text, string userId)
        {
            try
            {

                var chatClient = await GetChatClientAsync();
                // Create a list of chat messages
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("You are an eco-friendly assistant that analyzes user activities , provides specific impact and specific sustainability advice. Also rate how sustainable the activity is on a scale of -10 to +15, where -10 is very harmful to the environment and +15 is very beneficial.Give me response in Json with fields impact, advice and ecopoints."),
                    new UserChatMessage(text)
                };


                // Create chat completion options

                var options = new ChatCompletionOptions
                {
                    Temperature = (float)0.7,
                    MaxOutputTokenCount = 400,
                    TopP = (float)0.95,
                    FrequencyPenalty = (float)0,
                    PresencePenalty = (float)0,
                    ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                };



                // Create the chat completion request
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);

                // Print the response
                if (completion != null && completion?.Content?.Any() == true)
                {
                    // Get completion response

                    // Parse the JSON response
                    var analysisResult = JsonConvert.DeserializeObject<ChatCompletionResponse>(completion.Content.First().Text);
                    string advice = analysisResult.Advice;
                    int ecoPoints = analysisResult.EcoPoints;

                    // Store activity
                    await StoreActivity(userId, "text", text, advice, ecoPoints);

                    return new AnalysisResult()
                    {
                        Advice = analysisResult.Advice,
                        EcoPoints = analysisResult.EcoPoints,
                        AnalysisDetails = $"**Environmental Impact:** {analysisResult.Impact}"
                    };
                }
                else
                {
                    Console.WriteLine("No response received.");
                    return new AnalysisResult
                    {
                        Advice = "No response received.",
                        EcoPoints = 0,
                        AnalysisDetails = "No response computed."
                    };


                }


            }
            catch (Exception ex)
            {
                throw;
            }
        }
        private static string GenerateSasToken(string containerName, string blobName)
        {
            var blobServiceClient = new BlobServiceClient(StorageConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = containerName,
                BlobName = blobName,
                Resource = "b",
                StartsOn = DateTimeOffset.UtcNow,
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var storageSharedKeyCredential = new StorageSharedKeyCredential(
                blobServiceClient.AccountName,
                StorageAccountKey);

            return blobClient.Uri + "?" + sasBuilder.ToSasQueryParameters(storageSharedKeyCredential);
        }

        private static async Task<AnalysisResult> AnalyzeImage(string blobName, string userId)
        {
            try
            {
                // Generate SAS URL for the image
                string imageUrlWithSas = GenerateSasToken("images", blobName);

                // First get image description using Computer Vision
                var computerVisionClient = new ComputerVisionClient(
                    new ApiKeyServiceClientCredentials(CognitiveServicesKey))
                {
                    Endpoint = CognitiveServicesEndpoint
                };

                var features = new List<VisualFeatureTypes?>()
                {
                    VisualFeatureTypes.Description,
                    VisualFeatureTypes.Tags
                };

                var imageAnalysis = await computerVisionClient.AnalyzeImageAsync(imageUrlWithSas, features);
                var imageDescription = imageAnalysis.Description.Captions.FirstOrDefault()?.Text ?? "";
                var tags = string.Join(", ", imageAnalysis.Tags.Select(t => t.Name));


                var chatClient = await GetChatClientAsync();
                // Create a list of chat messages
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("You are an eco-friendly assistant that analyzes image descriptions and provides important impact and specific sustainability advice. Also rate how sustainable the depicted activity is on a scale of -10 to +15.Give me response in Json with fields impact,advice and ecopoints."),
                    new UserChatMessage($"Image description: {imageDescription}. Image tags: {tags}")
                };


                // Create chat completion options

                var options = new ChatCompletionOptions
                {
                    Temperature = (float)0.7,
                    MaxOutputTokenCount = 200,

                    TopP = (float)0.95,
                    FrequencyPenalty = (float)0,
                    PresencePenalty = (float)0,
                    ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()

                };



                // Create the chat completion request
                ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);

                // Print the response
                if (completion != null && completion?.Content?.Any() == true)
                {

                    // Parse the JSON response
                    var analysisResult = JsonConvert.DeserializeObject<ChatCompletionResponse>(completion.Content.First().Text);
                    string advice = analysisResult.Advice;
                    int ecoPoints = analysisResult.EcoPoints;

                    // Store activity
                    // Store activity with original blob name, not SAS URL
                    await StoreActivity(userId, "image", blobName, advice, ecoPoints);
                    return new AnalysisResult()
                    {
                        Advice = analysisResult.Advice,
                        EcoPoints = analysisResult.EcoPoints,
                        AnalysisDetails = $"Analysis results based on:  \n" +
                     $"**Image Description:** {imageDescription}  \n" +
                     $"**Tags:** {string.Join(", ", tags)}  \n" +
                     $"**Environmental Impact:** {analysisResult.Impact}"
                    };
                }
                else
                {
                    return new AnalysisResult
                    {
                        Advice = "No response received."
                    };
                }


            }
            catch (Exception ex)
            {
                throw;
            }
        }


        private static async Task<AnalysisResult> AnalyzeVoice(string blobName, string userId)
        {
            string tempFile = null;
            try
            {
                // Generate SAS URL for voice file
                string voiceUrlWithSas = GenerateSasToken("voice-recordings", blobName);

                // Download voice file
                tempFile = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.wav");
                using (var httpClient = new HttpClient())
                using (var stream = await httpClient.GetStreamAsync(voiceUrlWithSas))
                using (var fileStream = File.Create(tempFile))
                {
                    await stream.CopyToAsync(fileStream);
                }

                // Directly use Speech service
                var speechConfig = SpeechConfig.FromSubscription(SpeechServiceKey, SpeechServiceRegion);
                string transcription = await TranscribeSpeech(speechConfig, tempFile);

                var textResult = await AnalyzeText(transcription, userId);
                await StoreActivity(userId, "voice", blobName, textResult.Advice, textResult.EcoPoints);
                textResult.Transcription = transcription;
                return textResult;
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                if (tempFile != null && File.Exists(tempFile))
                {
                    File.Delete(tempFile);
                }
            }
        }

        private static async Task<string> TranscribeSpeech(SpeechConfig speechConfig, string audioFilePath)
        {
            try
            {
                // Configure speech recognition
                speechConfig.SpeechRecognitionLanguage = "en-US";

                // Verify file exists and check format
                if (!File.Exists(audioFilePath))
                {
                    throw new FileNotFoundException("Audio file not found", audioFilePath);
                }

                // Log file details for debugging
                var fileInfo = new FileInfo(audioFilePath);
                Console.WriteLine($"Processing audio file: {audioFilePath}");
                Console.WriteLine($"File size: {fileInfo.Length} bytes");

                // Use direct file input for better compatibility
                using var audioInput = AudioConfig.FromWavFileInput(audioFilePath);
                using var recognizer = new SpeechRecognizer(speechConfig, audioInput);

                var recognitionResult = new TaskCompletionSource<string>();

                // Event handlers for detailed logging
                recognizer.Recognized += (s, e) =>
                {
                    if (e.Result.Reason == ResultReason.RecognizedSpeech)
                    {
                        Console.WriteLine($"Recognized text: {e.Result.Text}");
                        recognitionResult.TrySetResult(e.Result.Text);
                    }
                };

                recognizer.Canceled += (s, e) =>
                {
                    Console.WriteLine($"Recognition canceled: {e.Reason}");
                    Console.WriteLine($"Error details: {e.ErrorDetails}");
                    recognitionResult.TrySetException(new Exception(e.ErrorDetails));
                };

                // Start recognition
                await recognizer.StartContinuousRecognitionAsync();

                // Wait for result with timeout
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                string result;
                try
                {
                    result = await recognitionResult.Task.WaitAsync(cts.Token);
                }
                finally
                {
                    await recognizer.StopContinuousRecognitionAsync();
                }

                return string.IsNullOrEmpty(result) ? "No speech detected" : result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in speech recognition: {ex.Message}");
                throw;
            }
        }

        private static async Task StoreActivity(string userId, string activityType, string content, string advice, int ecoPoints)
        {
            var activity = new Activity
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                ActivityType = activityType,
                Content = content,
                Advice = advice,
                EcoPoints = ecoPoints,
                Timestamp = DateTime.UtcNow
            };

            await ActivitiesContainer.CreateItemAsync(activity);
        }

        private static async Task UpdateEcoPoints(string userId, int pointsToAdd)
        {
            try
            {
                // Get user record
                var userResponse = await UserContainer.ReadItemAsync<User>(
                    userId, new PartitionKey(userId));
                var user = userResponse.Resource;

                // Update points
                user.TotalEcoPoints += pointsToAdd;

                // Update user level based on points
                if (user.TotalEcoPoints >= 500 && user.Level < 5)
                {
                    user.Level = 5;
                }
                else if (user.TotalEcoPoints >= 250 && user.Level < 4)
                {
                    user.Level = 4;
                }
                else if (user.TotalEcoPoints >= 100 && user.Level < 3)
                {
                    user.Level = 3;
                }
                else if (user.TotalEcoPoints >= 50 && user.Level < 2)
                {
                    user.Level = 2;
                }

                // Save updated user
                await UserContainer.ReplaceItemAsync(user, userId, new PartitionKey(userId));
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Create new user if not exists
                var user = new User
                {
                    Id = userId,
                    TotalEcoPoints = pointsToAdd,
                    Level = 1,
                    CreatedDate = DateTime.UtcNow
                };

                await UserContainer.CreateItemAsync(user, new PartitionKey(userId));
            }
        }

        [Function("GetUserProfile")]
        public async Task<IActionResult> GetUserProfile(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "users/{userId}")] HttpRequest req,
            string userId)
        {
            Console.WriteLine($"Getting profile for user {userId}");

            try
            {
                // Get user record
                var userResponse = await UserContainer.ReadItemAsync<User>(
                    userId, new PartitionKey(userId));

                // Get user's recent activities
                var queryDefinition = new QueryDefinition(
                    "SELECT TOP 10 * FROM c WHERE c.userId = @userId ORDER BY c.timestamp DESC")
                    .WithParameter("@userId", userId);

                var activities = new List<Activity>();
                var iterator = ActivitiesContainer.GetItemQueryIterator<Activity>(queryDefinition);

                while (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    activities.AddRange(response);
                }

                // Create response object
                var result = new
                {
                    user = userResponse.Resource,
                    recentActivities = activities
                };

                return new OkObjectResult(result);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult($"User with ID {userId} not found");
            }
        }

        [Function("UploadFile")]
        public async Task<IActionResult> UploadFile(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "upload")] HttpRequest req)
        {
            try
            {
                _logger.LogInformation("Processing file upload");

                var formData = await req.ReadFormAsync();
                var file = formData.Files["file"];
                var contentType = file.ContentType;
                var containerName = contentType.StartsWith("image") ? "images" : "voice-recordings";

                // Generate unique file name
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                // Upload to blob storage
                var blobClient = new BlobClient(
                    StorageConnectionString,
                    containerName,
                    fileName);

                using (var stream = file.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType });
                }

                // Return the URL
                return new OkObjectResult(new { url = fileName });
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        // Models
        public class UserInputRequest
        {
            public string UserId { get; set; }
            public string InputType { get; set; } // "text", "image", or "voice"
            public string Text { get; set; }
            public string ImageUrl { get; set; }
            public string VoiceUrl { get; set; }
        }

        public class ChatCompletionResponse
        {
            public string Advice { get; set; }
            public int EcoPoints { get; set; }
            public string Impact { get; set; }
        }
        public class AnalysisResult
        {
            public string Advice { get; set; }
            public int EcoPoints { get; set; }
            public string AnalysisDetails { get; set; }
            public string Transcription { get; set; }
        }

        public class User
        {
            [JsonProperty(PropertyName = "id")]

            public string Id { get; set; }
            public int TotalEcoPoints { get; set; }
            public int Level { get; set; }
            public DateTime CreatedDate { get; set; }
        }

        public class Activity
        {
            [JsonProperty(PropertyName = "id")]
            public string Id { get; set; }
            [JsonProperty(PropertyName = "userId")]

            public string UserId { get; set; }
            public string ActivityType { get; set; }
            public string Content { get; set; }
            public string Advice { get; set; }
            public int EcoPoints { get; set; }
            public DateTime Timestamp { get; set; }
        }
    }
}

