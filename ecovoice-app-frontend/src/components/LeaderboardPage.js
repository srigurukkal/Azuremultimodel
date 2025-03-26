// File: src/components/LeaderboardPage.js
import React, { useState, useEffect } from 'react';
import { FaLeaf, FaTrophy, FaMedal } from 'react-icons/fa';
import '../styles/LeaderboardPage.css';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    // In a real app, we would fetch from a leaderboard API endpoint
    // For this demo, we'll create a simulated leaderboard
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // This would be a real API call in production
                // const response = await axios.get(
                //   `${process.env.REACT_APP_API_URL}/leaderboard`,
                //   { headers: { 'x-functions-key': process.env.REACT_APP_FUNCTION_KEY } }
                // );

                // Simulate a leaderboard for the demo
                const simulatedLeaderboard = [
                    { id: 'user1', username: 'EcoWarrior', points: 782, level: 5 },
                    { id: 'user2', username: 'GreenThumb', points: 645, level: 5 },
                    { id: 'user3', username: 'SustainableLife', points: 520, level: 5 },
                    { id: 'user4', username: 'EarthProtector', points: 489, level: 4 },
                    { id: 'user5', username: 'RecycleKing', points: 456, level: 4 },
                    { id: 'user6', username: 'BikeCommuter', points: 378, level: 4 },
                    { id: 'user7', username: 'ZeroWaster', points: 315, level: 4 },
                    { id: 'user8', username: 'PlantBased', points: 267, level: 3 },
                    { id: 'user9', username: 'SolarPowered', points: 198, level: 3 },
                    { id: 'user10', username: 'RainwaterCollector', points: 142, level: 3 }
                ];

                setLeaderboard(simulatedLeaderboard);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="loading">Loading leaderboard...</div>;
    }

    return (
        <div className="leaderboard-page">
            <h1>Eco Champions Leaderboard</h1>
            <p className="leaderboard-description">
                The most active eco-warriors making a difference for our planet.
                Earn more eco points by logging your sustainable activities!
            </p>

            <div className="leaderboard-container">
                <div className="top-users">
                    {leaderboard.slice(0, 3).map((user, index) => (
                        <div key={user.id} className={`top-user position-${index + 1}`}>
                            <div className="top-user-medal">
                                {index === 0 && <FaMedal className="gold-medal" />}
                                {index === 1 && <FaMedal className="silver-medal" />}
                                {index === 2 && <FaMedal className="bronze-medal" />}
                            </div>
                            <div className="top-user-avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="top-user-info">
                                <div className="top-user-name">{user.username}</div>
                                <div className="top-user-points">
                                    <FaLeaf className="points-icon" />
                                    {user.points} points
                                </div>
                                <div className="top-user-level">
                                    <FaTrophy className="level-icon" />
                                    Level {user.level}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="leaderboard-table">
                    <div className="table-header">
                        <div className="rank-column">Rank</div>
                        <div className="user-column">User</div>
                        <div className="points-column">Points</div>
                        <div className="level-column">Level</div>
                    </div>

                    {leaderboard.map((user, index) => (
                        <div key={user.id} className="table-row">
                            <div className="rank-column">{index + 1}</div>
                            <div className="user-column">
                                <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                                <div className="username">{user.username}</div>
                            </div>
                            <div className="points-column">
                                <FaLeaf className="points-icon" />
                                {user.points}
                            </div>
                            <div className="level-column">
                                <div className={`level-badge level-${user.level}`}>
                                    {user.level}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="leaderboard-tips">
                <h3>How to Climb the Leaderboard</h3>
                <ul>
                    <li>Log your eco-friendly activities daily</li>
                    <li>Use all input methods (text, image, voice) for variety</li>
                    <li>Focus on high-impact sustainable actions</li>
                    <li>Be consistent with your eco-friendly habits</li>
                    <li>Challenge friends to join and compare progress</li>
                </ul>
            </div>
        </div>
    );
};

export default LeaderboardPage;