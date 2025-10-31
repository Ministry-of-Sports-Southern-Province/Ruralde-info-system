import React from "react";
import { Link } from "react-router-dom";
import "../home/home.css";
import backgroundImage from "../assets/dp01.jpg";
import About from "../about/about";
import Contact from "../contact/contact";
import Footer from "../footer/footer";

export default function Home() {
  return (
    <div className="page container">
      {/* Hero Section */}
      <div className="home-container">
        {/* Left: Image */}
        <img src={backgroundImage} alt="Background" />

        {/* Right: Text Section */}
        <div className="right-container">
          <h1 className="page-title">ආරම්භක පිටුව / Home</h1>
          <p>
            Welcome to the <strong>Grama Samurdhi Portal</strong>. Discover services,
            community resources, and forms that help you take action easily.
          </p>

          <div className="button-group">
            <Link to="/startup" className="primary-btn">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* About and Contact Sections */}
      <section id="about-section">
        <About />
      </section>

      <section id="contact-section">
        <Contact />
      </section>

      <section id="footer-section">
        <Footer/>
      </section>
    </div>
  );
}
