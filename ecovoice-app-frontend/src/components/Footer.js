// File: src/components/Footer.js
import React from 'react';
import { FaLeaf, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <FaLeaf className="footer-logo-icon" />
                    <span>EcoVoice</span>
                </div>

                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">About</a>
                    <a href="#">Contact</a>
                </div>

                <div className="footer-social">
                    <a href="#" className="social-icon"><FaGithub /></a>
                    <a href="#" className="social-icon"><FaLinkedin /></a>
                    <a href="#" className="social-icon"><FaEnvelope /></a>
                </div>
            </div>

            <div className="footer-copyright">
                <p>© 2025 EcoVoice. All rights reserved. Built with sustainable code 💚</p>
            </div>
        </footer>
    );
};

export default Footer;