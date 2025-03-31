# EcoVoice: Personal Sustainability Coach

## Overview

EcoVoice is an interactive, multi-modal web app that acts as a personal sustainability coach. It uses Azure AI to analyze your environmental impact through:

- **Text**: Daily activities you input
- **Voice**: Spoken reflections
- **Images**: Photos of items like groceries or waste

The app provides tailored, actionable eco-friendly advice in real time. Think of it as a green lifestyle assistant with a gamified twist—users earn "Eco Points" for sustainable choices, tracked via Azure services.

## Demo

Watch our YouTube demo: [https://www.youtube.com/watch?v=tkSTtQM2XGE](https://www.youtube.com/watch?v=tkSTtQM2XGE)

## Try it out
[gentle-pond-04f47f40f.6.azurestaticapps.net
](https://gentle-pond-04f47f40f.6.azurestaticapps.net/)

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


## End-to-end detailed flow

![e2e-detailed](https://github.com/user-attachments/assets/49620038-0103-41d2-b155-0cdf60ec26f2)


### Key Components

#### Frontend
- **React App** hosted on **Azure Static Web App**
- Integrates with **Azure AD** for user authentication
- Uses **Azure Content Safety** for content moderation

#### Backend
- **.NET Function App** with three main API endpoints:
  - `AnalyzeUserInput`: Processes text, image, and voice inputs
  - `GetUserProfile`: Retrieves user profile information
  - `UploadFile`: Handles file uploads to blob storage
- Independently scalable from the frontend

#### Data Flow
1. **Text Analysis Flow**:
   - User enters text in the React app
   - Frontend sends text directly to `AnalyzeUserInput` API
   - Backend processes text through Azure Cognitive Services and OpenAI
   - Results are stored in Cosmos DB and returned to the user

2. **Image Analysis Flow**:
   - User uploads an image in the React app
   - Frontend sends image to `UploadFile` API
   - Backend stores image in Azure Blob Storage (Images container)
   - Frontend requests analysis via `AnalyzeUserInput` with the blob reference
   - Backend processes image through Azure Cognitive Services and OpenAI
   - Results and blob reference are stored in Cosmos DB and returned to the user

3. **Voice Analysis Flow**:
   - User records audio in the React app
   - Frontend sends recording to `UploadFile` API
   - Backend stores audio in Azure Blob Storage (Audio container)
   - Frontend requests analysis via `AnalyzeUserInput` with the blob reference
   - Backend processes audio through Azure Cognitive Services and OpenAI
   - Results and blob reference are stored in Cosmos DB and returned to the user

#### Data Storage
- **Azure Cosmos DB** stores:
  - User profiles in the "users" container
  - Activity records in the "activities" container (including blob references)
- **Azure Blob Storage** stores:
  - Images in the "images" container
  - Audio recordings in the "audio" container

#### Security
- All API calls are secured with Function Keys
- User authentication is handled by Azure AD
- Content moderation is performed by Azure Content Safety

  
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
3. Navigate to frontend app root directory and run npm commands to build(npm run build) and start(npm start) the app that will launch app at http://localhost:3000/
4. Start backend app in release or debug mode that will lanuch the app at http://localhost:7071/
5. You are good to naviate http://localhost:3000/ front end by logging in with your microsoft domain login(either outlook/hotmail)

   
### Production Deployment

1. Fork this repository
2. Create an Azure account
3. Create the required Azure resources (listed below)
4. For front end: Get the values for the below secrets from Azure portal and update it into GitHub secrets:

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
5. For backend: Update function app environment variables into Azure portal as below,
      ![image](https://github.com/user-attachments/assets/210df688-37c6-4d36-9151-6958fad27425)


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
