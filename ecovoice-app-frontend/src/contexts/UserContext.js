import React, { createContext, useState, useContext, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getUserProfile } from '../services/apiService';

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set user from MSAL
    if (accounts.length > 0) {
      setUser(accounts[0]);
      
      // Fetch user profile
      const fetchUserProfile = async () => {
        try {
          const profile = await getUserProfile(accounts[0].localAccountId);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [accounts]);

  const refreshUserProfile = async () => {
    if (user) {
      try {
        setLoading(true);
        const profile = await getUserProfile(user.localAccountId);
        setUserProfile(profile);
        setLoading(false);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        setLoading(false);
      }
    }
  };

  const login = async () => {
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ["User.Read"]
      });
      setUser(loginResponse.account);
      return loginResponse.account;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = () => {
    instance.logout();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    logout,
    refreshUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
