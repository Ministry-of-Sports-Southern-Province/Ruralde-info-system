import React, { useState } from "react";
import "../login/signup.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    position: "",
    district: "",
    username: "",
    email: "",
    contactnumber: "",
    identitynumber: "",
    idFront: null,
    idBack: null,
    password: "",
    confirmPassword: "",
  });

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");
  const [error, setError] = useState("");

  const districtData = {
    Galle: [
      "හික්කඩුව", "හබරාදුව", "ඇල්පිටිය", "යක්කලමුල්ල", "තවලම", "නාගොඩ", "නෙඵව",
      "අක්මීමණ", "නියාගම", "ගාල්ල කඩවත්සතර", "බද්දේගම", "බෙන්තොට", "බෝපේ පෝද්දල",
      "බලපිටිය", "අම්බලන්ගොඩ", "ඉමදුව", "කරන්දෙනිය", "වැලිවිටිය දිවිතුර", "ගෝනාපිනුවල",
      "රත්ගම", "මාදම්පාගම", "වඳුරඔ"
    ],
    Matara: [
      "තිහගොඩ", "අකුරැස්ස", "හක්මණ", "වැලිගම", "මාලිම්බඩ", "දික්වැල්ල", "අතුරලිය",
      "දෙවිනුවර", "පිටබැද්දර", "මුලටියන", "වැලිපිටිය", "පස්ගොඩ", "කඔරුපිටිය",
      "කිරින්ද පුහුල්වැල්ල", "කොටපොළ", "මාතර"
    ],
    Hambantota: [
      "අඟුණකොලපැලැස්ස", "අම්බලන්තොට", "බෙලිඅත්ත", "හම්බන්තොට", "කටුවන", "ලුණුගම්වෙහෙර",
      "ඕකෙවෙල", "සූරියවැව", "තංගල්ල", "තිස්සමහාරාමය", "වලස්මුල්ල", "වීරකැටිය"
    ],
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
  };

  const handleChange = (e) => {
    let { name, value, files } = e.target;

    // Handle image upload
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
      return;
    }

    // Validate phone
    if (name === "contactnumber") {
      value = value.replace(/[^0-9]/g, "");
      if (value.length > 10) value = value.slice(0, 10);
    }

    // Validate NIC
    if (name === "identitynumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    // Reset location fields if position changes
    if (name === "position") {
      setSelectedDistrict("");
      setSelectedSecretary("");
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.position ||
      !formData.username ||
      !formData.email ||
      !formData.contactnumber ||
      !formData.identitynumber ||
      !formData.idFront ||
      !formData.idBack ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required, including ID photos.");
      return;
    }

    if (formData.position === "secretary" && !selectedDistrict) {
      setError("Please select a district.");
      return;
    }

    if (formData.position === "village_officer" && (!selectedDistrict || !selectedSecretary)) {
      setError("Please select both district and secretary division.");
      return;
    }

    if (!/^0\d{9}$/.test(formData.contactnumber)) {
      setError("Please enter a valid Sri Lankan contact number (e.g., 0771234567).");
      return;
    }

    if (formData.identitynumber.length < 10 || formData.identitynumber.length > 12) {
      setError("Identity number must be 10 or 12 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    alert(`✅ Account created for ${formData.username}!`);

    // Reset
    setFormData({
      position: "",
      district: "",
      username: "",
      email: "",
      contactnumber: "",
      identitynumber: "",
      idFront: null,
      idBack: null,
      password: "",
      confirmPassword: "",
    });
    setSelectedDistrict("");
    setSelectedSecretary("");
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">

          {/* Position */}
          <label>Position</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          >
            <option value="">තනතුර තෝරන්න</option>
            <option value="chairman">පලාත් සංවර්ධන අධ්‍යක්ශක</option>
            <option value="secretary">දිස්ත්‍රික් නිලධාරී</option>
            <option value="officer">විෂය භාර නිලධාරී</option>
            <option value="village_officer">ග්‍රාම සංවර්ධන නිලධාරී</option>
            <option value="village_officer">සමිති සභාපති</option>
            <option value="village_officer">සමිති භාණ්ඩාගාරික</option>
            <option value="village_officer">සමිති ලේකම්</option>
          </select>

          {/* District */}
          {(formData.position === "secretary" || formData.position === "village_officer") && (
            <>
              <label>District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                required
              >
                <option value="">තෝරන්න</option>
                <option value="Galle">ගාල්ල</option>
                <option value="Matara">මාතර</option>
                <option value="Hambantota">හම්බන්තොට</option>
              </select>
            </>
          )}

          {/* Secretary Division */}
          {formData.position === "village_officer" && (
            <>
              <label>Secretary Division</label>
              <select
                value={selectedSecretary}
                onChange={(e) => setSelectedSecretary(e.target.value)}
                disabled={!selectedDistrict}
                required
              >
                <option value="">Select Division</option>
                {selectedDistrict &&
                  districtData[selectedDistrict].map((sec, idx) => (
                    <option key={idx} value={sec}>
                      {sec}
                    </option>
                  ))}
              </select>
            </>
          )}

          {formData.position === "village_officer" && (
            <>
              <label>Society</label>
              <select
                value={selectedSecretary}
                onChange={(e) => setSelectedSecretary(e.target.value)}
                disabled={!selectedDistrict}
                required
              >
                <option value="">Select Division</option>
                {selectedDistrict &&
                  districtData[selectedDistrict].map((sec, idx) => (
                    <option key={idx} value={sec}>
                      {sec}
                    </option>
                  ))}
              </select>
            </>
          )}


          {/* Username */}
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />

          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          {/* Contact Number */}
          <label>Contact Number</label>
          <input
            type="tel"
            name="contactnumber"
            value={formData.contactnumber}
            onChange={handleChange}
            placeholder="0771234567"
            maxLength={10}
          />

          {/* Identity Number */}
          <label>Identity Number</label>
          <input
            type="text"
            name="identitynumber"
            value={formData.identitynumber}
            onChange={handleChange}
            placeholder="Enter your identity number"
            maxLength={12}
          />

          {/* ✅ ID Photo Uploads */}
          <label>Upload NIC Front Side</label>
          <input
            type="file"
            name="idFront"
            accept="image/*"
            onChange={handleChange}
            required
          />
          {formData.idFront && (
            <img
              src={URL.createObjectURL(formData.idFront)}
              alt="NIC Front Preview"
              className="id-preview"
            />
          )}

          <label>Upload NIC Back Side</label>
          <input
            type="file"
            name="idBack"
            accept="image/*"
            onChange={handleChange}
            required
          />
          {formData.idBack && (
            <img
              src={URL.createObjectURL(formData.idBack)}
              alt="NIC Back Preview"
              className="id-preview"
            />
          )}

          {/* Password */}
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          {/* Confirm Password */}
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
          />

          {/* Error */}
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="signup-submit-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
