import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../navbar/navbar.css"; // make sure to create this CSS file

export default function Navbar() {
  const [showForms, setShowForms] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">
          ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          {/* Forms Dropdown */}
          <div
            className="dropdown"
            onMouseEnter={() => setShowForms(true)}
            onMouseLeave={() => setShowForms(false)}
          >
            <span className="dropdown-title">Applications ▼</span>
            {showForms && (
              <div className="dropdown-content">
                <Link to="/register">සමිති ලියාපදින්චිය</Link>
                <Link to="/society">මූල්‍ය ඉල්ලුම් පත්‍රය</Link>
                <Link to="/member">සාමාජිකයින්ගේ තොරතුරු</Link>
                <Link to="/develop">ණය යෙදවුම් වාර්තාව</Link>
                <Link to="/student">ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය</Link>
              </div>
            )}
          </div>
          <Link to="/reports">Reports</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
      </div>
    </header>
  );
}
