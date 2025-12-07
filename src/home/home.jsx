import React from "react";
import { Link } from "react-router-dom";
import "../home/home.css";
import backgroundImage from "../assets/dp 05.jpg";
import About from "../about/about";
import Contact from "../contact/contact";
import Footer from "../footer/footer";
import Project from "../projects/project";

export default function Home() {
  return (
    <div className="home-page">
      {/* ========= HERO SECTION ========= */}
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="home-hero-overlay" />

        <div className="home-hero-inner">
          {/* Left: text content */}
          <div className="home-hero-text">
            <div className="hero-badge">
              දක්ෂිණ පළාත – ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
            </div>

            <h1 className="hero-title">
              Grama Samurdhi
              <span> Rural Development Management System</span>
            </h1>

            <p className="hero-subtitle">
              A unified platform to coordinate <strong>provincial, district,</strong>{" "}
              and <strong>village‑level</strong> rural development activities in
              the Southern Province, improving transparency and service delivery
              to rural communities.
            </p>

            <div className="hero-actions">
              <Link to="/startup" className="primary-btn">
                Get Started
              </Link>

              <Link to="/login" className="login-btn">
                Login to Your Account
              </Link>
            </div>

            <p className="hero-note">
              සේවා වින්දීමට සහ ඔබගේ ග්‍රාම සංවර්ධන යෝජනා ඉදිරිපත් කිරීමට{" "}
              <strong>ඔබගේ ගිණුමෙන් පිවිසෙන්න.</strong>
            </p>
          </div>

          {/* Right: subtle image panel (optional, can be hidden on mobile) */}
          <div className="home-hero-image-panel">
            <div className="image-glass-card">
              <h3>Southern Province Focus</h3>
              <p>
                Covering <strong>Galle</strong>, <strong>Matara</strong>, and{" "}
                <strong>Hambantota</strong> districts with district officers,
                subject officers, and village‑level societies connected through
                one system.
              </p>
              <ul>
                <li>Streamlined project approvals</li>
                <li>Centralized society records</li>
                <li>Improved monitoring & reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========= MAIN SECTIONS ========= */}
      <main className="home-main">
        <section id="about-section" className="home-section">
          <About />
        </section>

<section id="project-section" className="home-section">
          <Project />
        </section>

        <section id="contact-section" className="home-section">
          <Contact />
        </section>
      </main>

      <footer id="footer-section">
        <Footer />
      </footer>
    </div>
  );
}