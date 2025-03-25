
// File: src/components/Login.js
import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaSignInAlt, FaMicrophone, FaCamera, FaKeyboard } from 'react-icons/fa';
import '../styles/Login.css';

const Login = ({ setUser }) => {
    const { instance } = useMsal();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const loginResponse = await instance.loginPopup({
                scopes: ["User.Read"]
            });
            setUser(loginResponse.account);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-content">
                    <div className="app-branding">
                        <FaLeaf className="brand-icon" />
                        <h1>EcoVoice</h1>
                        <p className="tagline">Your Personal Sustainability Coach</p>
                    </div>

                    <div className="login-form">
                        <button onClick={handleLogin} className="login-button">
                            <FaSignInAlt /> Sign in with Microsoft
                        </button>
                        <p className="login-hint">
                            Sign in to track your eco-friendly habits and get personalized sustainability advice.
                        </p>
                    </div>
                </div>

                <div className="features-preview">
                    <h2>Track Your Environmental Impact</h2>

                    <div className="feature-cards">
                        <div className="feature-card">
                            <div className="feature-icon"><FaKeyboard /></div>
                            <h3>Text Entries</h3>
                            <p>Log your daily eco-friendly activities through simple text descriptions.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon"><FaCamera /></div>
                            <h3>Image Analysis</h3>
                            <p>Upload photos of your purchases, meals, or waste for personalized advice.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon"><FaMicrophone /></div>
                            <h3>Voice Logs</h3>
                            <p>Record your thoughts and receive sustainability tips based on your activities.</p>
                        </div>
                    </div>

                    <div className="eco-benefits">
                        <h3>Why Use EcoVoice?</h3>
                        <ul>
                            <li>Get personalized eco-friendly advice tailored to your lifestyle</li>
                            <li>Track your progress with Eco Points and achievement badges</li>
                            <li>Learn practical ways to reduce your environmental footprint</li>
                            <li>Join a community of sustainability-minded individuals</li>
                            <li>Make a positive impact on the planet, one action at a time</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

