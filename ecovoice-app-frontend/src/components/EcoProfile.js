// File: src/components/EcoProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaLeaf, FaTrophy, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import '../styles/EcoProfile.css';

const EcoProfile = ({ userId }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/users/${userId}`,
                    {
                        headers: {
                            'x-functions-key': process.env.REACT_APP_FUNCTION_KEY
                        }
                    }
                );
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return <div className="loading">Loading your eco profile...</div>;
    }

    if (!profile) {
        return <div className="no-data">Profile not found. Start your eco journey!</div>;
    }

    // Calculate activity counts by type
    const activityCounts = profile.recentActivities.reduce((counts, activity) => {
        counts[activity.activityType] = (counts[activity.activityType] || 0) + 1;
        return counts;
    }, {});

    // Calculate total activities
    const totalActivities = profile.recentActivities.length;

    // Calculate account age in days
    const accountAge = Math.ceil(
        (new Date() - new Date(profile.user.createdDate)) / (1000 * 60 * 60 * 24)
    );

    // Calculate points per day
    const pointsPerDay = totalActivities > 0
        ? Math.round((profile.user.totalEcoPoints / accountAge) * 10) / 10
        : 0;

    return (
        <div className="eco-profile">
            <div className="profile-header">
                <div className="profile-level">
                    <div className="level-badge">Level {profile.user.level}</div>
                </div>
                <h1>Your Eco Profile</h1>
                <div className="profile-points">
                    <FaLeaf className="points-icon" />
                    <span>{profile.user.totalEcoPoints}</span> points
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FaCalendarAlt /></div>
                    <div className="stat-value">{accountAge}</div>
                    <div className="stat-label">Days Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaChartLine /></div>
                    <div className="stat-value">{pointsPerDay}</div>
                    <div className="stat-label">Points/Day</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaTrophy /></div>
                    <div className="stat-value">{totalActivities}</div>
                    <div className="stat-label">Activities</div>
                </div>
            </div>

            <div className="level-progress">
                <h3>Level Progress</h3>
                <div className="progress-container">
                    {/* Determine next level threshold based on current level */}
                    {(() => {
                        const currentPoints = profile.user.totalEcoPoints;
                        let nextLevelPoints;
                        let progressPercentage;

                        switch (profile.user.level) {
                            case 1:
                                nextLevelPoints = 50;
                                progressPercentage = Math.min(100, (currentPoints / 50) * 100);
                                break;
                            case 2:
                                nextLevelPoints = 100;
                                progressPercentage = Math.min(100, ((currentPoints - 50) / 50) * 100);
                                break;
                            case 3:
                                nextLevelPoints = 250;
                                progressPercentage = Math.min(100, ((currentPoints - 100) / 150) * 100);
                                break;
                            case 4:
                                nextLevelPoints = 500;
                                progressPercentage = Math.min(100, ((currentPoints - 250) / 250) * 100);
                                break;
                            case 5:
                                nextLevelPoints = null;
                                progressPercentage = 100;
                                break;
                            default:
                                nextLevelPoints = 0;
                                progressPercentage = 0;
                        }

                        return (
                            <>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="progress-label">
                                    {profile.user.level < 5 ? (
                                        <>
                                            <span>{currentPoints} / {nextLevelPoints} points to level {profile.user.level + 1}</span>
                                            <span>{Math.round(progressPercentage)}%</span>
                                        </>
                                    ) : (
                                        <span>Maximum level reached! Keep going for more points!</span>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            <div className="activity-breakdown">
                <h3>Activity Breakdown</h3>
                <div className="activity-stats">
                    <div className="activity-stat">
                        <div className="activity-count">{activityCounts.text || 0}</div>
                        <div className="activity-type">Text Entries</div>
                    </div>
                    <div className="activity-stat">
                        <div className="activity-count">{activityCounts.image || 0}</div>
                        <div className="activity-type">Image Uploads</div>
                    </div>
                    <div className="activity-stat">
                        <div className="activity-count">{activityCounts.voice || 0}</div>
                        <div className="activity-type">Voice Recordings</div>
                    </div>
                </div>
            </div>

            <div className="achievement-section">
                <h3>Eco Achievements</h3>
                <div className="achievements">
                    {/* Dynamic achievements based on user's activities */}
                    {[
                        {
                            id: 'first-activity',
                            title: 'First Steps',
                            description: 'Logged your first eco activity',
                            unlocked: totalActivities > 0,
                            icon: '🌱'
                        },
                        {
                            id: 'level-2',
                            title: 'Growing Green',
                            description: 'Reached Level 2',
                            unlocked: profile.user.level >= 2,
                            icon: '🌿'
                        },
                        {
                            id: 'multi-modal',
                            title: 'Multi-Modal Eco Warrior',
                            description: 'Used all three input methods',
                            unlocked: activityCounts.text > 0 && activityCounts.image > 0 && activityCounts.voice > 0,
                            icon: '🎯'
                        },
                        {
                            id: 'consistent',
                            title: 'Consistency Champion',
                            description: 'Logged activities for 5+ days',
                            unlocked: totalActivities >= 5,
                            icon: '📅'
                        },
                        {
                            id: 'eco-expert',
                            title: 'Eco Expert',
                            description: 'Reached Level 4',
                            unlocked: profile.user.level >= 4,
                            icon: '🏆'
                        },
                        {
                            id: 'master',
                            title: 'Sustainability Master',
                            description: 'Reached Level 5',
                            unlocked: profile.user.level >= 5,
                            icon: '🌍'
                        }
                    ].map(achievement => (
                        <div
                            key={achievement.id}
                            className={`achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                        >
                            <div className="achievement-icon">{achievement.icon}</div>
                            <div className="achievement-content">
                                <div className="achievement-title">{achievement.title}</div>
                                <div className="achievement-description">{achievement.description}</div>
                            </div>
                            <div className="achievement-status">
                                {achievement.unlocked ? 'Unlocked' : 'Locked'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EcoProfile;
