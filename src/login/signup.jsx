import React, { useState, useEffect } from "react";
import "../login/signup.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

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
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState("");
  const [error, setError] = useState("");

  // Sinhala district & division data (unchanged)
  const districtData = {
    Galle: [
      "හික්කඩුව", "හබරාදුව", "ඇල්පිටිය", "යක්කලමුල්ල", "තවලම", "නාගොඩ",
      "නෙමිනැව", "අක්මීමණ", "නියාගම", "ගාල්ල කඩවත්සතර", "බද්දේගම",
      "බෙන්තොට", "බෝපේ පෝද්දල", "බලපිටිය", "අම්බලන්ගොඩ", "ඉමදුව",
      "කරන්දෙනිය", "වැලිවිටිය දිවිතුර", "ගෝනාපිනුවල", "රත්ගම", "මාදම්පාගම", "වඳුරඔ"
    ],
    Matara: [
      "තිහගොඩ", "අකුරැස්ස", "හක්මණ", "වැලිගම", "මාලිම්බඩ", "දික්වැල්ල",
      "අතුරලිය", "දෙවිනුවර", "පිටබැද්දර", "මුලටියන", "වැලිපිටිය",
      "පස්ගොඩ", "කඔරුපිටිය", "කිරින්ද පුහුල්වැල්ල", "කොටපොළ", "මාතර"
    ],
    Hambantota: [
      "අඟුණකොලපැලැස්ස", "අම්බලන්තොට", "බෙලිඅත්ත", "හම්බන්තොට", "කටුවන",
      "ලුණුගම්වෙහෙර", "ඕකෙවෙල", "සූරියවැව", "තංගල්ල", "තිස්සමහාරාමය",
      "වලස්මුල්ල", "වීරකැටිය"
    ],
  };

  const divisionMap = {
    "හික්කඩුව": "hikkaduwa",
    "හබරාදුව": "habaraduwa",
    "ඇල්පිටිය": "elptiya",
    "යක්කලමුල්ල": "yakkalamulla",
    "තවලම": "thawalama",
    "නාගොඩ": "nagoda",
    "නෙමිනැව": "neminawa",
    "අක්මීමණ": "akmeemana",
    "නියාගම": "niyagama",
    "ගාල්ල කඩවත්සතර": "galle",
    "බද්දේගම": "baddegama",
    "බෙන්තොට": "bentota",
    "බෝපේ පෝද්දල": "bopepoddala",
    "බලපිටිය": "balapitiya",
    "අම්බලන්ගොඩ": "ambalangoda",
    "ඉමදුව": "imaduwa",
    "කරන්දෙනිය": "karandeniya",
    "වැලිවිටිය දිවිතුර": "walivitiya-divitura",
    "ගෝනාපිනුවල": "gonapinuwala",
    "රත්ගම": "rathgama",
    "මාදම්පාගම": "madampagama",
    "වඳුරඔ": "wanduraba",
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
    setSocieties([]);
    setSelectedSociety("");
  };

  const handleChange = (e) => {
    let { name, value, files } = e.target;

    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      return;
    }

    if (name === "contactnumber") {
      value = value.replace(/[^0-9]/g, "");
      if (value.length > 10) value = value.slice(0, 10);
    }

    if (name === "identitynumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    if (name === "position") {
      setSelectedDistrict("");
      setSelectedSecretary("");
      setSocieties([]);
      setSelectedSociety("");
    }

    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const fetchVillages = async () => {
      if (!selectedDistrict || !selectedSecretary) {
        setSocieties([]);
        return;
      }

      try {
        const divisionId = divisionMap[selectedSecretary] || selectedSecretary;

        const villagesRef = collection(
          db,
          "districts",
          selectedDistrict,
          "divisions",
          divisionId,
          "villages"
        );

        const snapshot = await getDocs(villagesRef);

        if (snapshot.empty) {
          setSocieties([]);
          return;
        }

        const villageNames = snapshot.docs.map((doc) => {
          const data = doc.data();
          return (
            data["සමිතියේ නම"] ||
            data["ග්‍රාම සංවර්ධන සමිතිය"] ||
            data["ග්‍රාම නිලධාරී වසම"] ||
            doc.id
          );
        });

        setSocieties(villageNames);
      } catch (err) {
        setSocieties([]);
      }
    };

    fetchVillages();
  }, [selectedDistrict, selectedSecretary]);

  // Positions that require district + division + society
  const societyPositions = [
    "village_officer",
    "society_chairman",
    "society_treasurer",
    "society_secretary",
  ];

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

    if (
      societyPositions.includes(formData.position) &&
      (!selectedDistrict || !selectedSecretary || !selectedSociety)
    ) {
      setError("Please select district, division, and society.");
      return;
    }

    if (!/^0\d{9}$/.test(formData.contactnumber)) {
      setError("Invalid Sri Lankan contact number.");
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

    alert(`Account created for ${formData.username}!`);
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

            {/* FIXED UNIQUE VALUES */}
            <option value="village_officer">ග්‍රාම සංවර්ධන නිලධාරී</option>
            <option value="society_chairman">සමිති සභාපති</option>
            <option value="society_treasurer">සමිති භාණ්ඩාගාරික</option>
            <option value="society_secretary">සමිති ලේකම්</option>
          </select>

          {(formData.position === "secretary" || societyPositions.includes(formData.position)) && (
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

          {societyPositions.includes(formData.position) && (
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

          {societyPositions.includes(formData.position) && selectedSecretary && (
            <>
              <label>Society Name</label>
              <select
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
                required
              >
                <option value="">Select Society</option>
                {societies.map((soc, idx) => (
                  <option key={idx} value={soc}>
                    {soc}
                  </option>
                ))}
              </select>
            </>
          )}

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

          <label>Upload NIC Front Side</label>
          <input type="file" name="idFront" accept="image/*" onChange={handleChange} required />
          {formData.idFront && (
            <img src={URL.createObjectURL(formData.idFront)} alt="NIC Front" className="id-preview" />
          )}

          <label>Upload NIC Back Side</label>
          <input type="file" name="idBack" accept="image/*" onChange={handleChange} required />
          {formData.idBack && (
            <img src={URL.createObjectURL(formData.idBack)} alt="NIC Back" className="id-preview" />
          )}

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
