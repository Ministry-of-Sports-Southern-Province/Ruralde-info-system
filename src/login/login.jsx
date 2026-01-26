import React, { useState } from "react";
import "../login/login.css";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", "==", formData.username),
        where("password", "==", formData.password)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0];
        const userData = docRef.data();
        const userId = docRef.id;

        // Save user ID for session/profile usage
        localStorage.setItem("userId", userId);

        const userPosition = userData.position;

        // Redirect based on position
        switch (userPosition) {
          case "chairman": // පලාත් සංවර්ධන අධ්‍යක්ශක
            navigate("/chairmanprofile");
            break;

          case "districtOfficer": // දිස්ත්‍රික් නිලධාරී
            navigate("/districtOfficer");
            break;

          case "subjectOfficer": // විෂය භාර නිලධාරී
            navigate("/subject");
            break;

          case "village_officer": // ග්‍රාම සංවර්ධන නිලධාරී
            navigate("/ruraldevofficer");
            break;

          case "divisional_secretary": // ප්‍රාදේශීය ලේකම්
            navigate("/divisionalSecretary");
            break;

          // *** NEW: separate routes for each society position ***
          case "society_chairman": // සමිති සභාපති
            navigate("/societychairman");
            break;

          case "society_secretary": // සමිති ලේකම්
            navigate("/societysecretary");
            break;

          case "society_treasurer": // සමිති භාණ්ඩාගාරික
            navigate("/societytreasurer");
            break;

          default:
            setError("Unknown position. Please contact the administrator.");
        }
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-animation" />
      <div className="login-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">
          Sign in to continue to the Rural Development Management System
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              className="animated-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="animated-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error animated-error">{error}</p>}

          <button
            type="submit"
            className="auth-button animated-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}