// Authentication related helper functions

// Get current user from MSAL 
export const getCurrentUser = (instance) => {
  const accounts = instance.getAllAccounts();
  
  if (accounts.length > 0) {
    return accounts[0];
  }
  
  return null;
};

// Get authentication token (useful if your API requires token-based auth)
export const getAuthToken = async (instance) => {
  try {
    const accounts = instance.getAllAccounts();
    
    if (accounts.length === 0) {
      return null;
    }
    
    const silentRequest = {
      scopes: ["User.Read"],
      account: accounts[0]
    };
    
    const response = await instance.acquireTokenSilent(silentRequest);
    return response.accessToken;
  } catch (error) {
    console.error("Error acquiring token silently", error);
    
    if (error.name === "InteractionRequiredAuthError") {
      try {
        const response = await instance.acquireTokenPopup({
          scopes: ["User.Read"]
        });
        return response.accessToken;
      } catch (err) {
        console.error("Error acquiring token interactively", err);
        return null;
      }
    }
    
    return null;
  }
};

const authService = {
  getCurrentUser,
  getAuthToken
};

export default authService;
