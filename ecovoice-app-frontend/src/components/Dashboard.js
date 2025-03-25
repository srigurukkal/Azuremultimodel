

// File: src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FaLeaf, FaCamera, FaMicrophone, FaKeyboard, FaTrophy } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { accounts } = useMsal();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityStats, setActivityStats] = useState({
        text: 0,
        image: 0,
        voice: 0
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (accounts.length > 0) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/users/${accounts[0].localAccountId}`,
                        {
                            headers: {
                                'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
                            }
                        }
                    );
                    setUserProfile(response.data);

                    // Calculate activity type stats
                    const stats = {
                        text: 0,
                        image: 0,
                        voice: 0
                    };

                    response.data.recentActivities.forEach(activity => {
                        stats[activity.activityType]++;
                    });

                    setActivityStats(stats);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setLoading(false);
                }
            }
        };

        fetchUserProfile();
    }, [accounts]);

    if (loading) {
        return <div className="loading">Loading your eco dashboard...</div>;
    }

    if (!userProfile) {
        return <div className="no-data">No profile data available. Start your eco journey!</div>;
    }

    const activityData = [
        { name: 'Text', value: activityStats.text },
        { name: 'Image', value: activityStats.image },
        { name: 'Voice', value: activityStats.voice }
    ];

    // Create points over time data (last 7 activities)
    const pointsData = userProfile.recentActivities
        .slice(0, 7)
        .map(activity => ({
            date: new Date(activity.timestamp).toLocaleDateString(),
            points: activity.ecoPoints
        }))
        .reverse();

    return (
        <div className="dashboard">
            <div className="welcome-banner">
                <h1>Welcome to Your EcoVoice Dashboard</h1>
                <p>Track your sustainability journey and make a positive impact!</p>
            </div>

            <div className="eco-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FaLeaf /></div>
                    <div className="stat-value">{userProfile.user.totalEcoPoints}</div>
                    <div className="stat-label">Eco Points</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaTrophy /></div>
                    <div className="stat-value">{userProfile.user.level}</div>
                    <div className="stat-label">Eco Level</div>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-container">
                    <h3>Activity Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={activityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {activityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Recent Eco Points</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={pointsData}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="points" stroke="#00C49F" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="quick-actions">
                <h3>Log Your Eco Activities</h3>
                <div className="action-buttons">
                    <Link to="/input?type=text" className="action-button">
                        <FaKeyboard />
                        <span>Text</span>
                    </Link>
                    <Link to="/input?type=image" className="action-button">
                        <FaCamera />
                        <span>Image</span>
                    </Link>
                    <Link to="/input?type=voice" className="action-button">
                        <FaMicrophone />
                        <span>Voice</span>
                    </Link>
                </div>
            </div>

            <div className="recent-activities">
                <h3>Recent Activities</h3>
                {userProfile.recentActivities.length > 0 ? (
                    <div className="activity-list">
                        {userProfile.recentActivities.map((activity) => (
                            <div key={activity.id} className="activity-card">
                                <div className="activity-header">
                                    <span className="activity-type">
                                        {activity.activityType === 'text' && <FaKeyboard />}
                                        {activity.activityType === 'image' && <FaCamera />}
                                        {activity.activityType === 'voice' && <FaMicrophone />}
                                        {activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)}
                                    </span>
                                    <span className="activity-points">+{activity.ecoPoints} points</span>
                                </div>
                                <div className="activity-content">
                                    {activity.activityType === 'text' && <p>{activity.content}</p>}
                                    {activity.activityType === 'image' && <img src={activity.content} alt="User upload" />}
                                    {activity.activityType === 'voice' && <audio controls src={activity.content}></audio>}
                                </div>
                                <div className="activity-advice">
                                    <h4>Eco Advice:</h4>
                                    <p>{activity.advice}</p>
                                </div>
                                <div className="activity-timestamp">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-activities">No activities recorded yet. Start logging your eco actions!</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;