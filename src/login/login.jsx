import React, { useState } from "react";
import "../login/login.css";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
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
          case "chairman":              // පලාත් සංවර්ධන අධ්‍යක්ශක
            navigate("/chairmanprofile");
            break;

          case "districtOfficer":       // දිස්ත්‍රික් නිලධාරී
            navigate("/districtOfficer");
            break;

          case "subjectOfficer":        // විෂය භාර නිලධාරී
            navigate("/subject");
            break;

          case "village_officer":       // ග්‍රාම සංවර්ධන නිලධාරී
            navigate("/ruraldevofficer");
            break;

          case "society_chairman":      // සමිති සභාපති
          case "society_treasurer":     // සමිති භාණ්ඩාගාරික
          case "society_secretary":     // සමිති ලේකම්
            navigate("/societyofficer");
            break;

          default:
            setError("Unknown position. Contact admin.");
        }

        setLoading(false);
        return;
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
