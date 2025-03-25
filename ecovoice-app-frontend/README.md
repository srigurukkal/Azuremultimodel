# EcoVoice - Sustainability Tracking App

EcoVoice is a React-based web application that helps users track their eco-friendly activities and get personalized sustainability advice. Users can log activities via text, image uploads, or voice recordings.

## Features

- User authentication with Microsoft Azure AD
- Multi-modal input: text, image, and voice recording
- Sustainability advice based on user activities
- Eco points and level system
- User profile and achievements
- Leaderboard to compare with other users
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Azure subscription (for deployment)
- Azure Function App (for backend APIs)
- Azure AD tenant (for authentication)

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create `.env.development.local` file with your local credentials
   - Update the Azure AD client ID and tenant ID
   - Set your Azure Function key and URL

4. Start the development server:
   ```
   npm start
   ```

### Local Development with Azure Functions

To test with Azure Functions locally:

1. Install the Azure Functions Core Tools
2. Clone your Function App repository
3. Run the Function App locally with:
   ```
   func start
   ```
4. Update the `.env.development.local` file to point to your local Function App endpoint

## Deployment

See the deployment section for instructions on how to deploy to Azure Static Web Apps.

## Built With

- React
- React Router
- MSAL (Microsoft Authentication Library)
- Azure Functions
- Recharts for data visualization
- React Icons
