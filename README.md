# EcoVoice: Personal Sustainability Coach

## Overview

EcoVoice is an interactive, multi-modal web app that acts as a personal sustainability coach. It uses Azure AI to analyze your environmental impact through:

- **Text**: Daily activities you input
- **Voice**: Spoken reflections
- **Images**: Photos of items like groceries or waste

The app provides tailored, actionable eco-friendly advice in real time. Think of it as a green lifestyle assistant with a gamified twist—users earn "Eco Points" for sustainable choices, tracked via Azure services.

## Demo

Watch our YouTube demo: [https://www.youtube.com/watch?v=tkSTtQM2XGE](https://www.youtube.com/watch?v=tkSTtQM2XGE)

## Technology Stack

- React
- .NET Function Apps
- Azure Services

## Free Developer Resources

- Azure free credit available
- GitHub Copilot (extremely useful for beginners from coding to deployment)
- Take advantage of free trials for both Azure and GitHub Copilot

## Runtime Versions

- Node: 22.12.0
- .NET: 9.0

## Setup Instructions

### Local Development

1. Update `.env.development` with your values in the frontend
2. Update `local.settings.json` with your values in the backend
   - You may need to generate a function key locally:
   ```bash
   # Install Azure Functions Core Tools
   npm install -g azure-functions-core-tools@4
   
   # Start your Azure Function locally
   func start
   
   # Generate a function-specific key
   func keys set -n YourKeyName --function YourFunctionName
   
   # Or generate a host key (works across all functions)
   func keys set -n YourKeyName --host
   
   # View existing keys
   func keys list
   # or for a specific function
   func keys list --function YourFunctionName
   ```

### Production Deployment

1. Fork this repository
2. Create an Azure account
3. Create the required Azure resources (listed below)
4. Get the values for the below secrets from Azure portal and update it into GitHub secrets:

   ![GitHub Secrets](https://github.com/user-attachments/assets/6ab227b4-df48-428e-8719-1de436a43b95)

   These will be passed to ReactApp through GitHub workflow:
   ```yaml
   env:
     REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
     REACT_APP_FUNCTION_KEY: ${{ secrets.REACT_APP_FUNCTION_KEY }}
     REACT_APP_AZURE_AD_CLIENT_ID: ${{ secrets.REACT_APP_AZURE_AD_CLIENT_ID }}
     REACT_APP_AZURE_AD_TENANT_ID: ${{ secrets.REACT_APP_AZURE_AD_TENANT_ID }}
     REACT_APP_CONTENT_SAFETY_ENDPOINT: ${{ secrets.REACT_APP_CONTENT_SAFETY_ENDPOINT }}
     REACT_APP_CONTENT_SAFETY_KEY: ${{ secrets.REACT_APP_CONTENT_SAFETY_KEY }}
   ```

## Required Azure Resources

- Azure AI services – text, speech and image analysis
- Azure OpenAI services – chat completion to get personalized inputs
- Azure Content Safety service
- Azure Static Web Apps
- Azure Function App
- Azure Cosmos DB
- Azure AD integration – to manage user identities
- Azure Storage – to store image and voice blobs

## Implementation Details

### OpenAI Chat Completion

```csharp
// Create a list of chat messages
var messages = new List<ChatMessage>
{
    new SystemChatMessage("You are an eco-friendly assistant that analyzes user activities, provides specific impact and specific sustainability advice. Also rate how sustainable the activity is on a scale of -10 to +15, where -10 is very harmful to the environment and +15 is very beneficial. Give me response in Json with fields impact, advice and ecopoints."),
    new UserChatMessage(text)
};
```

### Local Testing

Local testing is possible by pointing your local React app to the local function app.
Environment variables can be retrieved from the Azure portal as they are created from the corresponding resource setting pages.

### Function App Environment Variables

```csharp
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
```

### CosmosDB Setup

CosmosDB requires additional setup to match these container names:

```csharp
private static readonly CosmosClient CosmosClient = new CosmosClient(CosmosEndpoint, CosmosKey);
private static readonly Container UserContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("users");
private static readonly Container ActivitiesContainer = CosmosClient.GetDatabase("eco-voice-db").GetContainer("activities");
```

## Technical Architecture

### Core Services

- Azure AI services – text, speech and image analysis
- Azure OpenAI services – chat completion to get personalized inputs
- Azure Content Safety service (One of Microsoft Azure's Responsible AI tools)
- Azure Static Web Apps
- Azure Function App
- Azure Cosmos DB
- Azure AD integration – to manage user identities
- Azure Storage – to store image and voice blobs

### Azure Resource Types

![Azure Resources](https://github.com/user-attachments/assets/827014c3-eca9-4efb-8cd7-3e0f3beece78)

![More Azure Resources](https://github.com/user-attachments/assets/8b2f26ae-b4bb-48fd-a9f8-9e1c012143cc)

![Additional Azure Resources](https://github.com/user-attachments/assets/e35a338f-b3fb-4dfa-b9be-f1f01f9ea9d3)

### Azure Content Safety Experience

![Content Safety](https://github.com/user-attachments/assets/6ed36165-2c91-4a26-8c4c-9c132d670a89)
