// File: src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { FaLeaf, FaUser, FaSignOutAlt, FaChartBar, FaHome } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ user, setUser }) => {
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

    const handleLogout = () => {
        instance.logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="logo">
                <FaLeaf className="logo-icon" />
                <span className="logo-text">EcoVoice</span>
            </div>

            {user && (
                <nav className="nav-menu">
                    <Link to="/" className="nav-item">
                        <FaHome /> Home
                    </Link>
                    <Link to="/input" className="nav-item">
                        Log Activity
                    </Link>
                    <Link to="/leaderboard" className="nav-item">
                        <FaChartBar /> Leaderboard
                    </Link>
                </nav>
            )}

            <div className="user-section">
                {user ? (
                    <>
                        <Link to="/profile" className="profile-link">
                            <div className="user-avatar">{user.name?.charAt(0) || user.username?.charAt(0) || 'U'}</div>
                            <span className="username">{user.name || user.username}</span>
                        </Link>
                        <button onClick={handleLogout} className="logout-button">
                            <FaSignOutAlt />
                        </button>
                    </>
                ) : (
                    <button onClick={handleLogin} className="login-button">
                        <FaUser /> Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;