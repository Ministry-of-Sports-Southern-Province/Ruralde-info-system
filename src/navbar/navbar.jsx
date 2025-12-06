import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../navbar/navbar.css";
import { Menu, X, UserCircle2 } from "lucide-react";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const navigate = useNavigate();

  const [showForms, setShowForms] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    // On mount, try to load current user's position
    const loadUserPosition = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsLoggedIn(false);
        setUserPosition(null);
        return;
      }

      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setIsLoggedIn(true);
          setUserPosition(data.position || null);
        } else {
          setIsLoggedIn(false);
          setUserPosition(null);
        }
      } catch (err) {
        console.error("Navbar: failed to load user", err);
        setIsLoggedIn(false);
        setUserPosition(null);
      }
    };

    loadUserPosition();

    // Listen to localStorage changes in other tabs(optional)
    const handleStorage = () => {
      const id = localStorage.getItem("userId");
      setIsLoggedIn(!!id);
      if (!id) setUserPosition(null);
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleForms = () => {
    if (isMobile) setShowForms((prev) => !prev);
  };

  const handleProfileClick = () => {
    const userId = localStorage.getItem("userId");

    // Not logged in → go to login
    if (!userId || !isLoggedIn) {
      navigate("/login");
      setMenuOpen(false);
      return;
    }

    // Logged in → go to dashboard based on position
    switch (userPosition) {
      case "chairman":
        navigate("/chairmanprofile");
        break;
      case "districtOfficer":
        navigate("/districtOfficer");
        break;
      case "subjectOfficer":
        navigate("/subject");
        break;
      case "village_officer":
        navigate("/ruraldevofficer");
        break;
      case "society_chairman":
      case "society_treasurer":
      case "society_secretary":
        navigate("/societyofficer");
        break;
      default:
        // fallback if position is missing/unknown
        navigate("/login");
        break;
    }

    setMenuOpen(false);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
        </Link>

        {/* Mobile Menu Icon */}
        <button
          className="menu-icon"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Main Navigation */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            About
          </Link>

          {/* Applications dropdown */}
          <div
            className="dropdown"
            onMouseEnter={!isMobile ? () => setShowForms(true) : undefined}
            onMouseLeave={!isMobile ? () => setShowForms(false) : undefined}
            onClick={toggleForms}
          >
            <span className="dropdown-title">Applications ▼</span>
            {showForms && (
              <div className="dropdown-content">
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  සමිති ලියාපදින්චිය
                </Link>
                <Link to="/society" onClick={() => setMenuOpen(false)}>
                  මූල්‍ය ඉල්ලුම් පත්‍රය
                </Link>
                <Link to="/member" onClick={() => setMenuOpen(false)}>
                  සාමාජිකයින්ගේ තොරතුරු
                </Link>
                <Link to="/develop" onClick={() => setMenuOpen(false)}>
                  ණය යෙදවුම් වාර්තාව
                </Link>
                <Link to="/student" onClick={() => setMenuOpen(false)}>
                  ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය
                </Link>
              </div>
            )}
          </div>

          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            Contact Us
          </Link>

          {/* Right side: Sign Up + Profile icon */}
          <div className="nav-right">
            <Link
              to="/signup"
              className="signup-btn"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Link>

            <button
              type="button"
              className="profile-icon-btn"
              onClick={handleProfileClick}
              title={
                isLoggedIn
                  ? "Go to your dashboard"
                  : "Login to access your dashboard"
              }
            >
              <UserCircle2 size={24} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}