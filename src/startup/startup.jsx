import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../startup/startup.css";

import { db } from "../firebase"; // adjust path if needed
import { collection, getDocs } from "firebase/firestore";

const Startup = () => {
  // District and Secretary Divisions data
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

  // Must match Firestore division IDs
  const divisionMap = {
    "හික්කඩුව": "hikkaduwa",
    "හබරාදුව": "habaraduwa",
    "ඇල්පිටිය": "elptiya",
    "යක්කලමුල්ල": "yakkalamulla",
    "තවලම": "thawalama",
    "නාගොඩ": "nagoda",
    "නෙළුව": "neluwa",
    "අක්මීමණ": "akmeemana",
    "නියාගම": "niyagama",
    "ගාල්ල කඩවත්සතර": "galle",
    "බද්දේගම": "baddegama",
    "බෙන්තොට": "benthota",
    "බෝපේ පෝද්දල": "bopepoddala",
    "බලපිටිය": "balapitiya",
    "අම්බලන්ගොඩ": "ambalangoda",
    "ඉමදුව": "imaduwa",
    "කරන්දෙනිය": "karandeniya",
    "වැලිවිටිය දිවිතුර": "walivitiya_divithura",
    "ගෝනාපිනුවල": "gonapinuwala",
    "රත්ගම": "rathgama",
    "මාදම්පාගම": "madampagama",
    "වඳුරඔ": "wanduraba",

    "තිහගොඩ": "thiagoda",
    "අකුරැස්ස": "akuressa",
    "හක්මණ": "hakmana",
    "වැලිගම": "weligama",
    "මාලිම්බඩ": "malimbada",
    "දික්වැල්ල": "dikwella",
    "අතුරලිය": "athuraliya",
    "දෙවිනුවර": "devinuwara",
    "පිටබැද්දර": "pitabeddara",
    "මුලටියන": "mulatiyana",
    "වැලිපිටිය": "welipitiya",
    "පස්ගොඩ": "pasgoda",
    "කඔරුපිටිය": "kaburupitiya",
    "කිරින්ද පුහුල්වැල්ල": "kirinda_puhulwella",
    "කොටපොළ": "kotapola",
    "මාතර": "matara",

    "අඟුණකොලපැලැස්ස": "angunukolapelassa",
    "අම්බලන්තොට": "ambalantota",
    "බෙලිඅත්ත": "beliaththa",
    "හම්බන්තොට": "hambantota",
    "කටුවන": "katuwana",
    "ලුණුගම්වෙහෙර": "lunugamwehera",
    "ඕකෙවෙල": "okewela",
    "සූරියවැව": "suriyawewa",
    "තංගල්ල": "tangalle",
    "තිස්සමහාරාමය": "tissamaharamaya",
    "වලස්මුල්ල": "walasmulla",
    "වීරකැටිය": "wiraketiya",
  };

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");

  // [{id, name, regNo}]
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
    setSocieties([]);
    setSelectedSocietyId("");
    setRegistrationNumber("");
  };

  // Load societies whenever district + secretary change
  useEffect(() => {
    const fetchSocieties = async () => {
      if (!selectedDistrict || !selectedSecretary) {
        setSocieties([]);
        setSelectedSocietyId("");
        setRegistrationNumber("");
        return;
      }

      try {
        const divisionId = divisionMap[selectedSecretary];
        if (!divisionId) {
          console.warn("No divisionId for secretary:", selectedSecretary);
          setSocieties([]);
          setSelectedSocietyId("");
          setRegistrationNumber("");
          return;
        }

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
          console.warn("No villages for", selectedDistrict, divisionId);
          setSocieties([]);
          setSelectedSocietyId("");
          setRegistrationNumber("");
          return;
        }

        const list = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Try multiple keys for the society name
          const name =
            data["සමිතියේ නම"] ||
            data["ග්‍රාම සංවර්ධන සමිතිය"] ||
            data["ග්‍රාම නිලධාරී වසම"] ||
            data["name"] || // optional generic field
            doc.id; // last fallback

          // Registration number: key is exactly "ලි.ප.අ"
          const regNo = data["ලි.ප.අ"] || "";

          return { id: doc.id, name, regNo };
        });

        console.log("Loaded societies for", selectedDistrict, selectedSecretary, list);
        setSocieties(list);
        setSelectedSocietyId("");
        setRegistrationNumber("");
      } catch (err) {
        console.error("Error loading societies", err);
        setSocieties([]);
        setSelectedSocietyId("");
        setRegistrationNumber("");
      }
    };

    fetchSocieties();
  }, [selectedDistrict, selectedSecretary]);

  const handleSocietyChange = (id) => {
    setSelectedSocietyId(id);
    const found = societies.find((s) => s.id === id);
    console.log("Chosen society:", found);
    setRegistrationNumber(found?.regNo || "");
  };

  return (
    <div className="develop-container">
      <h2 className="form-title">ග්‍රාම සංවර්ධන සමිතිය සඳහා අයදුම් කිරීම</h2>

      <form className="develop-form">
        {/* District */}
        <div className="form-group">
          <label>01. දිස්ත්රික්කය:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            <option value="">තෝරන්න</option>
            {Object.keys(districtData).map((district) => (
              <option key={district} value={district}>
                {district === "Galle"
                  ? "ගාල්ල"
                  : district === "Matara"
                  ? "මාතර"
                  : "හම්බන්තොට"}
              </option>
            ))}
          </select>
        </div>

        {/* Secretary Division */}
        <div className="form-group">
          <label>02. ප්‍රාදේශීය ලේකම් කොට්ඨාසය:</label>
          <select
            value={selectedSecretary}
            onChange={(e) => setSelectedSecretary(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">තෝරන්න</option>
            {selectedDistrict &&
              districtData[selectedDistrict].map((sec, idx) => (
                <option key={idx} value={sec}>
                  {sec}
                </option>
              ))}
          </select>
        </div>

        {/* Society Name */}
        <div className="form-group">
          <label>03. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
          <select
            value={selectedSocietyId}
            onChange={(e) => handleSocietyChange(e.target.value)}
            disabled={
              !selectedDistrict ||
              !selectedSecretary ||
              societies.length === 0
            }
          >
            <option value="">තෝරන්න</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Registration Number */}
        <div className="form-group">
          <label>04. ලියාපදිංචි අංකය:</label>
          <input
            type="text"
            placeholder="Registration Number"
            value={registrationNumber}
            readOnly
          />
        </div>

        {/* Services */}
        <h5>
          කරුණාකර පහත සඳහන් සේවාවන් අතරින් ඔබට අවශ්‍ය සේවාව තෝරා ගන්න:
        </h5>
        <div className="service-links">
          <Link to="/student" className="service-button">
            1. "ගැමිසෙත" ශිෂ්‍යත්වය සඳහා අයදුම් කිරීම
          </Link>
          <Link to="/develop" className="service-button">
            2. මුදල් නිදහස් කර ගැනීමට අයදුම් කිරීම
          </Link>
          <Link to="/society" className="service-button">
            3. ණය සඳහා අයදුම් කිරීම
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Startup;