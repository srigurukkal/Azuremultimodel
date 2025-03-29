**What is this app about?**

EcoVoice is an interactive, multi-modal web app that acts as a personal sustainability coach. It uses Azure AI to analyze your environmental impact through text (daily activities you input), voice (spoken reflections), and images (photos of items like groceries or waste), then provides tailored, actionable eco-friendly advice in real time. Think of it as a green lifestyle assistant with a playful, gamified twist—users earn "Eco Points" for sustainable choices, tracked via Azure services.
It is built on Azure AI services 

**Youtube demo at:** https://www.youtube.com/watch?v=tkSTtQM2XGE

**Technology stack:**

React

.NET Function apps

Azure

**Free developer resources:**

Azure free credit available.

GitHub copilot was extremely useful for beginners since from coding to deployment.

So take the advantage of free trial of Azure and GitHub Copilot.

**Runtime of these apps at the time of my development :**

Node 22.12.0,

.NET 9.0


**Azure resources needed:**

Azure AI services – text, speech and image analysis

Azure Open AI services – chat completion  to get personalized inputs

Azure content safety service

Azure static web apps 

Azure function app

Azure Cosmos DB

Azure AD integration – to manage user identities

Azure storage – to store image and voice blob


**Chat completion request:**

                // Create a list of chat messages
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("You are an eco-friendly assistant that analyzes user activities , provides specific impact and specific sustainability advice. Also rate how sustainable the activity is on a scale of -10 to +15, where -10 is very harmful to the environment and +15 is very beneficial.Give me response in Json with fields impact, advice and ecopoints."),
                    new UserChatMessage(text)
                };



**Make sure all the resources created beforehand.**

Local testing is possible by pointing your local react app to local function app.
Below environment variables can be retrieved from Azure portal as they created from the corresponding resource setting pages.

**Environment variables needed-frontend-reactapp:**
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

**Environment variables-backend needed -functionapp:**

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

**CosmosDB requires additional setup to match below container names:**
        private static readonly CosmosClient CosmosClient = new CosmosClient(CosmosEndpoint, CosmosKey);
        private static readonly Container UserContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("users");
        private static readonly Container ActivitiesContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("activities");


**Tehnical backbone:**

Azure AI services – text, speech and image analysis 

Azure Open AI services – chat completion  to get personalized inputs

Azure content safety service(One of Microsoft Azure’s Responsible AI tools)

Azure static web apps 

Azure function app

Azure Cosmos DB

Azure AD integration – to manage user identities

Azure storage – to store image and voice blob


**Azure resource types:**

![image](https://github.com/user-attachments/assets/827014c3-eca9-4efb-8cd7-3e0f3beece78)



![image](https://github.com/user-attachments/assets/8b2f26ae-b4bb-48fd-a9f8-9e1c012143cc)

![image](https://github.com/user-attachments/assets/e35a338f-b3fb-4dfa-b9be-f1f01f9ea9d3)

**Azure content safety experience:**

![image](https://github.com/user-attachments/assets/6ed36165-2c91-4a26-8c4c-9c132d670a89)

