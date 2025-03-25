// File: src/App.js (Enhanced with UserContext)
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { UserProvider } from './contexts/UserContext';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import EcoProfile from './components/EcoProfile';
import InputPage from './components/InputPage';
import LeaderboardPage from './components/LeaderboardPage';
import './App.css';

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_AD_TENANT_ID}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            setUser(accounts[0]);
        }
    }, []);

    return (
        <MsalProvider instance={msalInstance}>
            <UserProvider>
                    <div className="app-container">
                        <Header user={user} setUser={setUser} />
                        <main className="content">
                            <Routes>
                                <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                                <Route path="/login" element={<Login setUser={setUser} />} />
                                <Route path="/profile" element={user ? <EcoProfile userId={user.localAccountId} /> : <Navigate to="/login" />} />
                                <Route path="/input" element={user ? <InputPage /> : <Navigate to="/login" />} />
                                <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/login" />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
            </UserProvider>
        </MsalProvider>
    );
}

export default App;
