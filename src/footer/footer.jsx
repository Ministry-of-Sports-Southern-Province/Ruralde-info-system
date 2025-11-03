import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left Side - About */}
        <div className="footer-left">
          <h3>Rural Department Management System</h3>
          <p>
            Empowering local communities through technology and efficient
            development management.
          </p>
        </div>

        {/* Center - Contact Info */}
        <div className="footer-center">
          <h3>Contact Info</h3>
          <ul>
            <li>📍 Galle, Southern Province, Sri Lanka</li>
            <li>📞 +94 123 456 789</li>
            <li>📧 min.ruraldev.sp@gmail.com</li>
          </ul>
        </div>

        {/* Right Side - Social Links */}
        <div className="footer-right">
          <h3>Follow Us</h3>
          <ul className="social-icons">
            <li>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              🌐 Facebook
            </a>
            </li>
            <li>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              🕊️ Twitter
            </a>
            </li>
             <li>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              📸 Instagram
            </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} <span className="highlight">Ministry of Sports - Southern Province</span> | 
          Developed by{" "}
          <a
            href="https://dilutharushika.github.io/my-portfolio/"
            target="_blank"
            rel="noreferrer"
            className="highlight"
          >
            Dilu Tharushika
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
