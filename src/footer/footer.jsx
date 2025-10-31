import React from 'react'
import './footer.css'
const footer = () => {
    return (

        <footer className='footer'>
            <div className='footer-container'>
                {/*footer left side*/}
                <div className='footer-left'>
                    <h3>Rural Department Management System</h3>

                    <p>
                        Empowering local communities through technology and efficient
                        development management.
                    </p>
                </div>
                {/*footer center side*/}
                <div className='footer-center'>
                    <h4>Contact Info</h4>
                    <p>📍 Address: Galle, Southern Province, Sri Lanka</p>
                    <p>📞 Phone: +94 123 456 789</p>
                    <p>📧 Email: ruraldept@gmail.com</p>
                </div>
                {/*footer right side*/}
                <div className='footer-right'>
                    <h4>Follow Us</h4>
                    <div className='social-icons'></div>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer">
                        🌐 Facebook
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer">
                        🕊️ Twitter
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                        📸 Instagram
                    </a>
                </div>
            </div>

            <div className='footer-bottom'>
                <p>
                    © {new Date().getFullYear()} Ministry of Sports - Southern Province |
                    Developed by Dilu Tharushika
                </p>
            </div>
        </footer>

    );
}

export default footer
