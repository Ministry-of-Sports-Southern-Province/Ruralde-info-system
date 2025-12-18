import React, { useState } from "react";
import "../register/register.css";

import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// === MAPPINGS FOR REGISTRATION CODE ===

// Sinhala short codes for districts
const districtCodeMap = {
  Galle: "ගා",
  Matara: "මා",
  Hambantota: "හබ",
};

// Sinhala short codes for divisions (you can adjust as per gov. standard)
const divisionCodeMap = {
  "අක්මීමණ": "අක්",
  "තිහගොඩ": "තිහ",
  "හික්කඩුව": "හික්",
  "හම්බන්තොට": "හම්",
  // TODO: add other divisions if needed
};

// Mapping Sinhala division → Firestore divisionId
// e.g. path: districts/Galle/divisions/akmeemana/villages
const divisionIdMap = {
  "අක්මීමණ": "akmeemana",
  "තිහගොඩ": "tihagoda",
  "හික්කඩුව": "hikkaduwa",
  "හම්බන්තොට": "hambantota",
  // TODO: add all actual division ids you use
};

// Build number like: දපස/ග්‍රාසං/ගා/අක්/23
const buildRegisterNo = (district, division, index) => {
  const dep = "දපස";
  const program = "ග්‍රාසං";

  const dCode = districtCodeMap[district] || "දිස්";
  const divCode = divisionCodeMap[division] || "කොට්";

  const num = String(index); // e.g. 23

  return `${dep}/${program}/${dCode}/${divCode}/${num}`;
};

const Register = () => {
  const districtData = {
    Galle: [
      "හික්කඩුව",
      "හබරාදුව",
      "ඇල්පිටිය",
      "යක්කලමුල්ල",
      "තවලම",
      "නාගොඩ",
      "නෙඵව",
      "අක්මීමණ",
      "නියාගම",
      "ගාල්ල කඩවත්සතර",
      "බද්දේගම",
      "බෙන්තොට",
      "බෝපේ පෝද්දල",
      "බලපිටිය",
      "අම්බලන්ගොඩ",
      "ඉමදුව",
      "කරන්දෙනිය",
      "වැලිවිටිය දිවිතුර",
      "ගෝනාපිනුවල",
      "රත්ගම",
      "මාදම්පාගම",
      "වඳුරඔ",
    ],
    Matara: [
      "තිහගොඩ",
      "අකුරැස්ස",
      "හක්මණ",
      "වැලිගම",
      "මාලිම්බඩ",
      "දික්වැල්ල",
      "අතුරලිය",
      "දෙවිනුවර",
      "පිටබැද්දර",
      "මුලටියන",
      "වැලිපිටිය",
      "පස්ගොඩ",
      "කඔරුපිටිය",
      "කිරින්ද පුහුල්වැල්ල",
      "කොටපොළ",
      "මාතර",
    ],
    Hambantota: [
      "අඟුණකොලපැලැස්ස",
      "අම්බලන්තොට",
      "බෙලිඅත්ත",
      "හම්බන්තොට",
      "කටුවන",
      "ලුණුගම්වෙහෙර",
      "ඕකෙවෙල",
      "සූරියවැව",
      "තංගල්ල",
      "තිස්සමහාරාමය",
      "වලස්මුල්ල",
      "වීරකැටිය",
    ],
  };

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");

  const [societyData, setSocietyData] = useState({
    registerNo: "",
    registerDate: "",
    societyName: "",
    address: "",
    phone: "",
    email: "",
    memberCount: "",
  });

  const [chairman, setChairman] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    nic: "",
    dob: "",
  });

  const [secretaryPos, setSecretaryPos] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    nic: "",
    dob: "",
  });

  const [treasurer, setTreasurer] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    nic: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
    setSocietyData((prev) => ({ ...prev, registerNo: "" }));
  };

  const handleSocietyChange = (e) => {
    const { name, value } = e.target;
    setSocietyData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  // Get next index from villages collection, reading "ලි.ප.අ"
  const getNextIndexFromVillages = async (district, division) => {
    const divisionId = divisionIdMap[division];
    if (!divisionId) {
      console.error("No divisionId mapping for division:", division);
      return 1;
    }

    const villagesRef = collection(
      db,
      "districts",
      district,
      "divisions",
      divisionId,
      "villages"
    );

    const villagesSnap = await getDocs(villagesRef);

    if (villagesSnap.empty) return 1;

    let maxNum = 0;
    villagesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const code = data["ලි.ප.අ"]; // e.g. "දපස/ග්‍රාසං/ගා/අක්/32"
      if (typeof code === "string") {
        const parts = code.split("/");
        const lastPart = parts[parts.length - 1];
        const n = parseInt(lastPart, 10);
        if (!isNaN(n) && n > maxNum) {
          maxNum = n;
        }
      }
    });

    return maxNum + 1; // e.g. 32 -> 33
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDistrict || !selectedSecretary) {
      alert("කරුණාකර දිස්ත්‍රික්කය සහ ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න.");
      return;
    }

    setLoading(true);

    try {
      // 1) find next index from villages (existing societies)
      const nextIndex = await getNextIndexFromVillages(
        selectedDistrict,
        selectedSecretary
      );

      // 2) build new register number
      const autoRegisterNo = buildRegisterNo(
        selectedDistrict,
        selectedSecretary,
        nextIndex
      );

      // 3) save in your own "societies" collection
      const societiesRef = collection(db, "societies");
      await addDoc(societiesRef, {
        district: selectedDistrict,
        division: selectedSecretary,
        registerNo: autoRegisterNo,
        registerDate: societyData.registerDate || null,
        societyName: societyData.societyName,
        address: societyData.address,
        phone: societyData.phone,
        email: societyData.email,
        memberCount: Number(societyData.memberCount),
        positions: {
          chairman,
          secretary: secretaryPos,
          treasurer,
        },
        createdAt: serverTimestamp(),
        index: nextIndex,
      });

      setSocietyData((prev) => ({
        ...prev,
        registerNo: autoRegisterNo,
      }));

      alert(
        `සමිතිය ලියාපදිංචි කිරීම සාර්ථකයි!\nනව ලියාපදිංචි අංකය: ${autoRegisterNo}`
      );
    } catch (err) {
      console.error("Error saving society:", err);
      alert("Error saving society. Please try again.");
    }

    setLoading(false);
  };

  return (
    <section className="register-wrapper">
      <div className="register-container">
        <div className="register-header">
          <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
          <h3>සමිතිය ලියාපදිංචි කිරීම</h3>
        </div>

        <h2 className="register-title">සමිති ලියාපදිංචිය</h2>
        <p className="register-intro">
          මෙම අයදුම් පත්‍රය{" "}
          <strong>ග්‍රාම සංවර්ධන සමිතියක් ලියාපදිංචි කිරීම</strong> සදහාය.
          කරුණාකර පහත සියලුම කොටස් නිවැරදිව සටහන් කරන්න.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* 01. District & 02. Division */}
          <div className="form-row">
            <div className="form-group">
              <label>01. දිස්ත්රික්කය:</label>
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
            </div>

            <div className="form-group">
              <label>02. ප්‍රාදේශීය ලේකම් කොට්ඨාසය:</label>
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
            </div>
          </div>

          {/* 03. Register No + Date */}
          <div className="form-row">
            <div className="form-group">
              <label>03. ලියාපදිංචි අංකය:</label>
              <input
                type="text"
                name="registerNo"
                value={societyData.registerNo}
                placeholder="Auto from villages last ලි.ප.අ"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>ලියාපදිංචි දිනය:</label>
              <input
                type="date"
                name="registerDate"
                value={societyData.registerDate}
                onChange={handleSocietyChange}
              />
            </div>
          </div>

          {/* 04. Society Name */}
          <div className="form-group">
            <label>04. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
            <input
              type="text"
              name="societyName"
              value={societyData.societyName}
              onChange={handleSocietyChange}
              required
            />
          </div>

          {/* 05. Address */}
          <div className="form-group">
            <label>05. ලිපිනය:</label>
            <input
              type="text"
              name="address"
              value={societyData.address}
              onChange={handleSocietyChange}
              required
            />
          </div>

          {/* 06. Phone */}
          <div className="form-group">
            <label>06. දුරකථන අංකය:</label>
            <input
              type="tel"
              name="phone"
              value={societyData.phone}
              onChange={handleSocietyChange}
              placeholder="Enter Mobile No"
              required
            />
          </div>

          {/* 07. Email */}
          <div className="form-group">
            <label>07. ඊමේල් ලිපිනය:</label>
            <input
              type="email"
              name="email"
              value={societyData.email}
              onChange={handleSocietyChange}
              placeholder="Enter Email"
              required
            />
          </div>

          {/* 08. Members count */}
          <div className="form-group">
            <label>08. සාමාජිකයින් ගණන:</label>
            <input
              type="number"
              name="memberCount"
              min="0"
              value={societyData.memberCount}
              onChange={handleSocietyChange}
              required
            />
          </div>

          {/* POSITIONS */}
          <h3 className="positions-title">09. තනතුරු තොරතුරු</h3>

          {/* Chairman */}
          <div className="position-block">
            <h4>සභාපති (Chairman)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>සම්පූර්ණ නම:</label>
                <input
                  type="text"
                  name="fullName"
                  value={chairman.fullName}
                  onChange={handlePositionChange(setChairman)}
                />
              </div>
              <div className="form-group">
                <label>දුරකථන අංකය:</label>
                <input
                  type="tel"
                  name="phone"
                  value={chairman.phone}
                  onChange={handlePositionChange(setChairman)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ඊමේල්:</label>
                <input
                  type="email"
                  name="email"
                  value={chairman.email}
                  onChange={handlePositionChange(setChairman)}
                />
              </div>
              <div className="form-group">
                <label>ජාතික හැඳුනුම්පත් අංකය:</label>
                <input
                  type="text"
                  name="nic"
                  value={chairman.nic}
                  onChange={handlePositionChange(setChairman)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>ලිපිනය:</label>
              <input
                type="text"
                name="address"
                value={chairman.address}
                onChange={handlePositionChange(setChairman)}
              />
            </div>

            <div className="form-group">
              <label>උපන් දිනය:</label>
              <input
                type="date"
                name="dob"
                value={chairman.dob}
                onChange={handlePositionChange(setChairman)}
              />
            </div>
          </div>

          {/* Secretary */}
          <div className="position-block">
            <h4>ලේකම් (Secretary)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>සම්පූර්ණ නම:</label>
                <input
                  type="text"
                  name="fullName"
                  value={secretaryPos.fullName}
                  onChange={handlePositionChange(setSecretaryPos)}
                />
              </div>
              <div className="form-group">
                <label>දුරකථන අංකය:</label>
                <input
                  type="tel"
                  name="phone"
                  value={secretaryPos.phone}
                  onChange={handlePositionChange(setSecretaryPos)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ඊමේල්:</label>
                <input
                  type="email"
                  name="email"
                  value={secretaryPos.email}
                  onChange={handlePositionChange(setSecretaryPos)}
                />
              </div>
              <div className="form-group">
                <label>ජාතික හැඳුනුම්පත් අංකය:</label>
                <input
                  type="text"
                  name="nic"
                  value={secretaryPos.nic}
                  onChange={handlePositionChange(setSecretaryPos)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>ලිපිනය:</label>
              <input
                type="text"
                name="address"
                value={secretaryPos.address}
                onChange={handlePositionChange(setSecretaryPos)}
              />
            </div>

            <div className="form-group">
              <label>උපන් දිනය:</label>
              <input
                type="date"
                name="dob"
                value={secretaryPos.dob}
                onChange={handlePositionChange(setSecretaryPos)}
              />
            </div>
          </div>

          {/* Treasurer */}
          <div className="position-block">
            <h4>භාණ්ඩාගාරික (Treasurer)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>සම්පූර්ණ නම:</label>
                <input
                  type="text"
                  name="fullName"
                  value={treasurer.fullName}
                  onChange={handlePositionChange(setTreasurer)}
                />
              </div>
              <div className="form-group">
                <label>දුරකථන අංකය:</label>
                <input
                  type="tel"
                  name="phone"
                  value={treasurer.phone}
                  onChange={handlePositionChange(setTreasurer)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ඊමේල්:</label>
                <input
                  type="email"
                  name="email"
                  value={treasurer.email}
                  onChange={handlePositionChange(setTreasurer)}
                />
              </div>
              <div className="form-group">
                <label>ජාතික හැඳුනුම්පත් අංකය:</label>
                <input
                  type="text"
                  name="nic"
                  value={treasurer.nic}
                  onChange={handlePositionChange(setTreasurer)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>ලිපිනය:</label>
              <input
                type="text"
                name="address"
                value={treasurer.address}
                onChange={handlePositionChange(setTreasurer)}
              />
            </div>

            <div className="form-group">
              <label>උපන් දිනය:</label>
              <input
                type="date"
                name="dob"
                value={treasurer.dob}
                onChange={handlePositionChange(setTreasurer)}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="submit-btn-container">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving..." : "ලියාපදිංචි වන්න"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;