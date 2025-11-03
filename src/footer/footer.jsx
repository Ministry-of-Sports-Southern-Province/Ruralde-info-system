import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* === Left Section (About) === */}
        <div className="footer-left">
          <h3>Rural Department Management System</h3>
          <p>
            Empowering local communities through technology and efficient
            development management.
          </p>
        </div>

        {/* === Center Section (Contact Info) === */}
        <div className="footer-center">
          <h3>Contact Info</h3>
          <ul>
            <li>📍 Galle, Southern Province, Sri Lanka</li>
            <li>📞 +94 123 456 789</li>
            <li>
              📧{" "}
              <a href="mailto:min.ruraldev.sp@gmail.com" className="email-link">
                min.ruraldev.sp@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* === Right Section (Social Links) === */}
        <div className="footer-right">
          <h3>Follow Us</h3>
          <ul className="social-icons">
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                🌐 Facebook
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                🕊️ Twitter
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                📸 Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* === Bottom Bar === */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="highlight">
            Ministry of Sports - Southern Province
          </span>{" "}
          | Developed by{" "}
          <a
            href="https://dilutharushika.github.io/my-portfolio/"
            target="_blank"
            rel="noopener noreferrer"
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
