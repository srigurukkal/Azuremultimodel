import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
  }
});

// Helper to get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Helper to analyze user input
export const analyzeUserInput = async (inputData) => {
  try {
    const response = await api.post('/analyze', inputData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing user input:', error);
    throw error;
  }
};

// Helper to upload files
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Helper to get leaderboard data
export const getLeaderboard = async () => {
  try {
    const response = await api.get('/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
};

const apiService = {
  getUserProfile,
  analyzeUserInput,
  uploadFile,
  getLeaderboard
};

export default apiService;
