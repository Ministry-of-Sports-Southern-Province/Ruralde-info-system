// List of files changed: src/login/signup.jsx
// Agnet change: Added file list and refined auto-fill/loading logic.
import React, { useState, useEffect } from "react";
import "../login/signup.css";
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    position: "",
    district: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    contactnumber: "",
    identitynumber: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");
  const [societies, setSocieties] = useState([]); // [{id, name, regNo}]
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [selectedSocietyName, setSelectedSocietyName] = useState("");
  const [selectedSocietyRegNo, setSelectedSocietyRegNo] = useState("");
  const [error, setError] = useState("");

  // District → Divisions (Sinhala)
  const districtData = {
    Galle: [
      "හික්කඩුව",
      "හබරාදුව",
      "ඇල්පිටිය",
      "යටකලමුල්ල",
      "තවලම",
      "නාගොඩ",
      "නෙළුව",
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
      "කැබුරුපිටිය",
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

  // Mapping Sinhala → divisionId for Firestore "villages" path
  const divisionMap = {
    "හික්කඩුව": "hikkaduwa",
    "හබරාදුව": "habaraduwa",
    "ඇල්පිටිය": "elptiya",
    "යටකලමුල්ල": "yakkalamulla",
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

    "තිහගොඩ": "thihagoda", // Agnet change: corrected from thiagoda
    "අකුරැස්ස": "akuressa",
    "හක්මණ": "hakmana",
    "වැලිගම": "weligama",
    "මාලිම්බඩ": "malimbada",
    "දික්වැල්ල": "dikwella",
    "අතුරලිය": "athuraliya",
    "දෙවිනුවර": "devinuwara",
    "පිටබැද්දර": "pitabeddara",
    "මුලටියන": "Mulatiyana", // Agnet change: corrected from mulatiyana to match filename
    "වැලිපිටිය": "welipitiya",
    "පස්ගොඩ": "pasgoda",
    "කැබුරුපිටිය": "kaburupitiya",
    "කිරින්ද පුහුල්වැල්ල": "kirinda puhulwella", // Agnet change: corrected from kirinda_puhulwella
    "කොටපොළ": "kotapola",
    "මාතර": "matara",

    "අඟුණකොලපැලැස්ස": "angunukolapelassa",
    "අම්බලන්තොට": "ambalantota",
    "බෙලිඅත්ත": "beliaththa",
    "හම්බන්තොට": "hambantota",
    "කටුවන": "katuwana",
    "ලුණුගම්වෙහෙර": "lunugamwehera",
    "ඕකෙවෙල": "okawela", // Agnet change: corrected from okewela
    "සූරියවැව": "suriyawewa",
    "තංගල්ල": "tangalle",
    "තිස්සමහාරාමය": "thissamaharamaya", // Agnet change: corrected from tissamaharamaya
    "වලස්මුල්ල": "walasmulla",
    "වීරකැටිය": "wiraketiya",
  };

  const societyPositions = [
    "society_chairman",
    "society_treasurer",
    "society_secretary",
  ];

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
    setSocieties([]);
    setSelectedSocietyId("");
    setSelectedSocietyName("");
    setSelectedSocietyRegNo("");
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "contactnumber") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    if (name === "identitynumber") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    setFormData({ ...formData, [name]: value });
  };

  // Fetch Societies for selected district + division (for society_* positions)
  useEffect(() => {
    const fetchVillages = async () => {
      if (!selectedDistrict || !selectedSecretary) {
        setSocieties([]);
        return;
      }

      try {
        const divisionId = divisionMap[selectedSecretary];
        if (!divisionId) {
          setSocieties([]);
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
          setSocieties([]);
          return;
        }

        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          console.log("Village doc:", docSnap.id, data);

          const name =
            data["සමිතියේ නම"] ||
            data["ග්‍රාම සංවර්ධන සමිතිය"] ||
            data["ග්‍රාම නිලධාරී වසම"] ||
            docSnap.id;

          // EXACT Sinhala key for reg no – adjust to match your Firestore.
          // From your screenshot it looks like "ලි.ප.අ"
          const regNo =
            data["ලි.ප.අ"] || // change this key if your log shows different
            data["ලි.ප අ"] || // small fallback if space used
            data["ලි.පඅ"] ||
            data["registerNo"] ||
            data["ලියා පදිංචි අංකය"] ||
            data["ලියාපදිංචි අංකය"] ||
            "";

          return { id: docSnap.id, name, regNo };
        });

        console.log("Loaded societies list:", list);
        setSocieties(list);
      } catch (err) {
        console.log(err);
        setSocieties([]);
      }
    };

    fetchVillages();
  }, [selectedDistrict, selectedSecretary]);

  // Agnet change: Function to handle society selection and automatically fill the registration number
  const handleSocietyChange = (id) => {
    setSelectedSocietyId(id);
    const s = societies.find((x) => x.id === id);
    setSelectedSocietyName(s?.name || "");
    // Agnet change: Automatically set the registration number (regNo) for the selected society
    setSelectedSocietyRegNo(s?.regNo || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    try {
      const usersRef = collection(db, "users");

      // === 1) CHECK UNIQUENESS RULES ===

      // 1a) District Officer -> one per district
      if (formData.position === "districtOfficer") {
        if (!selectedDistrict) {
          setError("කරුණාකර දිස්ත්‍රික්කය තෝරන්න.");
          return;
        }
        const qDO = query(
          usersRef,
          where("position", "==", "districtOfficer"),
          where("district", "==", selectedDistrict)
        );
        const existingDO = await getDocs(qDO);
        if (!existingDO.empty) {
          setError(
            "මෙම දිස්ත්‍රික්කය සඳහා District Officer හරෙකු දැනටමත් ලියාපදිංචි වී ඇත."
          );
          return;
        }
      }

      // 1b) Village Officer -> one per (district + division)
      else if (formData.position === "village_officer") {
        if (!selectedDistrict || !selectedSecretary) {
          setError("කරුණාකර දිස්ත්‍රික්කය සහ ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න.");
          return;
        }

        const qVO = query(
          usersRef,
          where("position", "==", "village_officer"),
          where("district", "==", selectedDistrict),
          where("division", "==", selectedSecretary)
        );

        const existingVO = await getDocs(qVO);
        if (!existingVO.empty) {
          setError(
            "මෙම ප්‍රාදේශීය ලේකම් කොට්ඨාසය සඳහා ග්‍රාම සංවර්ධන නිලධාරීවරයෙකු දැනටමත් ලියාපදිංචි වී ඇත."
          );
          return;
        }
      }

      // 1c) Divisional Secretary -> one per (district + division)
      else if (formData.position === "divisional_secretary") {
        if (!selectedDistrict || !selectedSecretary) {
          setError("කරුණාකර දිස්ත්‍රික්කය සහ ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න.");
          return;
        }

        const qDS = query(
          usersRef,
          where("position", "==", "divisional_secretary"),
          where("district", "==", selectedDistrict),
          where("division", "==", selectedSecretary)
        );

        const existingDS = await getDocs(qDS);
        if (!existingDS.empty) {
          setError(
            "මෙම ප්‍රාදේශීය ලේකම් කොට්ඨාසයට වූ Divisional Secretary දැනටමත් ලියාපදිංචි වී ඇත."
          );
          return;
        }
      }

      // 1d) Society positions -> one per (district + division + society + position)
      else if (societyPositions.includes(formData.position)) {
        if (!selectedDistrict || !selectedSecretary || !selectedSocietyId) {
          setError(
            "කරුණාකර දිස්ත්‍රික්කය, ප්‍රාදේශීය ලේකම් කොට්ඨාසය සහ Society තෝරන්න."
          );
          return;
        }

        const qSoc = query(
          usersRef,
          where("position", "==", formData.position),
          where("district", "==", selectedDistrict),
          where("division", "==", selectedSecretary),
          where("societyId", "==", selectedSocietyId)
        );
        const existingSoc = await getDocs(qSoc);
        if (!existingSoc.empty) {
          setError(
            "මෙම Society සඳහා මෙම තනතුර (සභාපති/ලේකම්/භාණ්ඩාගාරික) සඳහා පරිශීලකයෙකු දැනටමත් ලියාපදිංචි වී ඇත."
          );
          return;
        }
      }

      // 1e) Director (chairman) & Subject Officer -> single globally
      else if (
        formData.position === "chairman" ||
        formData.position === "subjectOfficer"
      ) {
        const qGlobal = query(
          usersRef,
          where("position", "==", formData.position)
        );
        const existing = await getDocs(qGlobal);
        if (!existing.empty) {
          setError("මෙම තනතුර සඳහා පරිශීලකයෙකු දැනටමත් ලියාපදිංචි වී ඇත.");
          return;
        }
      }

      // === 2) SAVE NEW USER ===
      await addDoc(collection(db, "users"), {
        position: formData.position,
        district: selectedDistrict || null,
        division: selectedSecretary || null,
        society: selectedSocietyName || null,
        societyId: selectedSocietyId || null,
        societyRegisterNo: selectedSocietyRegNo || null,

        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        contactnumber: formData.contactnumber,
        identitynumber: formData.identitynumber,
        password: formData.password,
        createdAt: new Date(),
      });

      alert("User Registered Successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Error saving data!");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* ===== SECTION: ROLE & AREA ===== */}
          <div className="signup-section">
            <p className="signup-section-title">Role & Area</p>

            {/* POSITION */}
            <label>Position</label>
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value="">තනතුර තෝරන්න</option>

              <option value="chairman">පලාත් සංවර්ධන අධ්‍යක්ශක</option>
              <option value="districtOfficer">දිස්ත්‍රික් නිලධාරී</option>
              <option value="subjectOfficer">විෂය භාර නිලධාරී</option>
              <option value="village_officer">ග්‍රාම සංවර්ධන නිලධාරී</option>
              <option value="divisional_secretary">ප්‍රාදේශීය ලේකම්</option>
              <option value="society_chairman">සමිති සභාපති</option>
              <option value="society_treasurer">සමිති භාණ්ඩාගාරික</option>
              <option value="society_secretary">සමිති ලේකම්</option>
            </select>

            {/* DISTRICT OFFICER – ONLY DISTRICT */}
            {formData.position === "districtOfficer" && (
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

            {/* VILLAGE OFFICER – DISTRICT + SECRETARY DIVISION */}
            {formData.position === "village_officer" && (
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

                <label>Secretary Division</label>
                <select
                  value={selectedSecretary}
                  onChange={(e) => setSelectedSecretary(e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {selectedDistrict &&
                    districtData[selectedDistrict].map((div, idx) => (
                      <option value={div} key={idx}>
                        {div}
                      </option>
                    ))}
                </select>
              </>
            )}

            {/* DIVISIONAL SECRETARY – DISTRICT + SECRETARY DIVISION */}
            {formData.position === "divisional_secretary" && (
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

                <label>Secretary Division</label>
                <select
                  value={selectedSecretary}
                  onChange={(e) => setSelectedSecretary(e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {selectedDistrict &&
                    districtData[selectedDistrict].map((div, idx) => (
                      <option value={div} key={idx}>
                        {div}
                      </option>
                    ))}
                </select>
              </>
            )}

            {/* SOCIETY POSITIONS – DISTRICT + SECRETARY + SOCIETY */}
            {societyPositions.includes(formData.position) && (
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

                <label>Secretary Division</label>
                <select
                  value={selectedSecretary}
                  onChange={(e) => setSelectedSecretary(e.target.value)}
                  required
                >
                  <option value="">Select Division</option>
                  {selectedDistrict &&
                    districtData[selectedDistrict].map((div, idx) => (
                      <option value={div} key={idx}>
                        {div}
                      </option>
                    ))}
                </select>

                <label>Society Name</label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => handleSocietyChange(e.target.value)}
                  required
                >
                  <option value="">Select Society</option>
                  {societies.map((soc) => (
                    <option key={soc.id} value={soc.id}>
                      {soc.name}
                    </option>
                  ))}
                </select>

                {/* Agnet change: Auto-filled Society Reg No (regNo) field */}
                <label>Society Reg No</label>
                <input
                  type="text"
                  value={selectedSocietyRegNo} // Agnet change: Automatically filled when a society is selected
                  readOnly
                  placeholder="Auto filled from database"
                />
              </>
            )}
          </div>

          {/* ===== SECTION: PERSONAL INFORMATION ===== */}
          <div className="signup-section">
            <p className="signup-section-title">Personal Information</p>

            <div className="signup-row">
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* ===== SECTION: CONTACT & SECURITY ===== */}
          <div className="signup-section">
            <p className="signup-section-title">Contact & Security</p>

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Contact Number</label>
            <input
              type="tel"
              name="contactnumber"
              value={formData.contactnumber}
              onChange={handleChange}
              required
            />

            <label>Identity Number</label>
            <input
              type="text"
              name="identitynumber"
              value={formData.identitynumber}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="signup-submit-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}