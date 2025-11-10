import React, { useState } from "react";
import "../login/signup.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    position: "",
    username: "",
    email: "",
    contactnumber: "",
    identitynumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Validate Sri Lankan contact number: only digits, max 10, starts with 0
    if (name === "contactnumber") {
      value = value.replace(/[^0-9]/g, ""); // allow only numbers
      if (value.length > 10) value = value.slice(0, 10); // limit to 10 digits
    }

    // Validate Identity Number: only A–Z and 0–9 (uppercase)
    if (name === "identitynumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (
      !formData.username ||
      !formData.email ||
      !formData.contactnumber ||
      !formData.identitynumber ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }

    // Contact number check (Sri Lankan format)
    if (!/^0\d{9}$/.test(formData.contactnumber)) {
      setError("Please enter a valid Sri Lankan contact number (e.g., 0771234567).");
      return;
    }

    // Identity number check (must have 10 or 12 characters)
    if (formData.identitynumber.length < 10 || formData.identitynumber.length > 12) {
      setError("Identity number must be 10 or 12 characters long.");
      return;
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    alert(`✅ Account created for ${formData.username}!`);

    // Reset form
    setFormData({
      position: "",
      username: "",
      email: "",
      contactnumber: "",
      identitynumber: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <label>Position</label>
          <select name="position" value={formData.position} onChange={handleChange} required>
            <option value="">තනතුර තෝරන්න</option>
            <option value="chairman">පලාත් සංවර්ධන අධ්‍යක්ශක</option>
            <option value="secretary">දිස්ත්‍රික් නිලධාරී</option>
            <option value="officer">විෂය භාර නිලධාරී</option>
            <option value="village_officer">ග්‍රාම සංවර්ධන නිලධාරී</option>
          </select>

          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label>Contact Number</label>
          <input
            type="tel"
            name="contactnumber"
            value={formData.contactnumber}
            onChange={handleChange}
            placeholder="0771234567"
            maxLength={10}
          />

          <label>Identity Number</label>
          <input
            type="text"
            name="identitynumber"
            value={formData.identitynumber}
            onChange={handleChange}
            placeholder="Enter your identity number"
            maxLength={12}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="signup-submit-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
