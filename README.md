# Azuremultimodel
Azure multi model(text,voice,image) with Active directory

**Free developer resources:**

Azure free credit available.
GitHub copilot was extremely useful for beginners since from coding to deployment.

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


![image](https://github.com/user-attachments/assets/48c7ed01-9457-433b-8af3-07df449f08e1)



![image](https://github.com/user-attachments/assets/8b2f26ae-b4bb-48fd-a9f8-9e1c012143cc)

![image](https://github.com/user-attachments/assets/e35a338f-b3fb-4dfa-b9be-f1f01f9ea9d3)
