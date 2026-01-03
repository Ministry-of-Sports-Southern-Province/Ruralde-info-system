import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../navbar/navbar.css";
import { Menu, X, UserCircle2, ChevronDown } from "lucide-react";

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

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // close dropdown when layout changes
      setShowForms(false);
    };

    window.addEventListener("resize", handleResize);

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

    const handleStorage = () => {
      const id = localStorage.getItem("userId");
      setIsLoggedIn(!!id);
      if (!id) setUserPosition(null);
    };
    window.addEventListener("storage", handleStorage);

    // click‑outside to close dropdown
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowForms(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // CLICK‑ONLY TOGGLE (desktop + mobile)
  const handleDropdownToggle = () => {
    setShowForms((prev) => !prev);
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
    // whenever you toggle mobile menu, close dropdown
    setShowForms(false);
  };

  const handleProfileClick = () => {
    const userId = localStorage.getItem("userId");

    if (!userId || !isLoggedIn) {
      navigate("/login");
      setMenuOpen(false);
      return;
    }

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
        navigate("/login");
        break;
    }

    setMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setShowForms(false);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={closeAllMenus}>
          ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
        </Link>

        {/* Mobile Menu Icon */}
        <button
          className="menu-icon"
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Main Navigation */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={closeAllMenus}>
            Home
          </Link>
          <Link to="/about" onClick={closeAllMenus}>
            About
          </Link>
          <Link to="/project" onClick={closeAllMenus}>
            Our Projects
          </Link>

          {/* Applications dropdown – CLICK ONLY */}
          <div className="dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`dropdown-title ${showForms ? "dropdown-open" : ""}`}
              onClick={handleDropdownToggle}
            >
              <span>Applications</span>
              <ChevronDown
                size={16}
                className={showForms ? "dropdown-icon-rotated" : ""}
              />
            </button>

            {showForms && (
              <div className="dropdown-content">
                <Link to="/register" onClick={closeAllMenus}>
                  සමිති ලියාපදින්චිය
                </Link>
                <Link to="/society" onClick={closeAllMenus}>
                  මූල්‍ය ඉල්ලුම් පත්‍රය
                </Link>
                <Link to="/member" onClick={closeAllMenus}>
                  සාමාජිකයින්ගේ තොරතුරු
                </Link>
                <Link to="/develop" onClick={closeAllMenus}>
                  ණය යෙදවුම් වාර්තාව
                </Link>
                <Link to="/student" onClick={closeAllMenus}>
                  ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය
                </Link>
              </div>
            )}
          </div>

          <Link to="/contact" onClick={closeAllMenus}>
            Contact Us
          </Link>

          {/* Right side: Sign Up + Profile icon */}
          <div className="nav-right">
            <Link to="/signup" className="signup-btn" onClick={closeAllMenus}>
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