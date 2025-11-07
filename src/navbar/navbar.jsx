import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../navbar/navbar.css";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [showForms, setShowForms] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleForms = () => {
    if (isMobile) setShowForms((prev) => !prev);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
        </Link>

        {/* ✅ Mobile Menu Icon */}
        <button
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* ✅ Navigation Links */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

          <div
            className="dropdown"
            onMouseEnter={!isMobile ? () => setShowForms(true) : undefined}
            onMouseLeave={!isMobile ? () => setShowForms(false) : undefined}
            onClick={toggleForms}
          >
            <span className="dropdown-title">Applications ▼</span>
            {showForms && (
              <div className="dropdown-content">
                <Link to="/register" onClick={() => setMenuOpen(false)}>සමිති ලියාපදින්චිය</Link>
                <Link to="/society" onClick={() => setMenuOpen(false)}>මූල්‍ය ඉල්ලුම් පත්‍රය</Link>
                <Link to="/member" onClick={() => setMenuOpen(false)}>සාමාජිකයින්ගේ තොරතුරු</Link>
                <Link to="/develop" onClick={() => setMenuOpen(false)}>ණය යෙදවුම් වාර්තාව</Link>
                <Link to="/student" onClick={() => setMenuOpen(false)}>ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය</Link>
              </div>
            )}
          </div>

          <Link to="/login" onClick={() => setMenuOpen(false)}>Reports</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/signup" className="signup-btn" onClick={() => setMenuOpen(false)}>Sign Up</Link>
        </nav>
      </div>
    </header>
  );
}
