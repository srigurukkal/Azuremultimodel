import React, { createContext, useContext, useState } from 'react';
import AIContentSafety from '../services/AIContentSafety';

const SafetyContext = createContext();

export function SafetyProvider({ children }) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState(null);

  const checkContent = async (content) => {
    setIsChecking(true);
    setLastError(null);

    try {
      const result = await AIContentSafety.analyzeSafetyRisks(content);
      return result.isSafe;
    } catch (error) {
      setLastError(error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <SafetyContext.Provider value={{ isChecking, checkContent, lastError }}>
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within SafetyProvider');
  }
  return context;
}