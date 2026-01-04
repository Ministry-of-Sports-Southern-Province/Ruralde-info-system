import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../startup/startup.css";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

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
    "නෙඵව": "neluwa",
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

  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");

  // [{id, name, regNo}]
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  const [step, setStep] = useState(1); // 1: select society, 2: choose application
  const [savedContext, setSavedContext] = useState(null);

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
    setSocieties([]);
    setSelectedSocietyId("");
    setRegistrationNumber("");
    setSaveError("");
    setSaveSuccess("");
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

        const list = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          const name =
            data["ග්‍රාම නිලධාරී වසම"] || // GN division
            data["ග්‍රාම සංවර්ධන සමිතිය"] ||
            data["සමිතියේ නම"] ||
            data["name"] ||
            docSnap.id;

          // Try multiple possible keys for reg no
          const regNo =
            data["ලි. ප. අ"] || // as seen in your screenshot
            data["ලි.ප.අ"] ||
            data["regNo"] ||
            "";

          return { id: docSnap.id, name, regNo };
        });

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
    setRegistrationNumber(found?.regNo || "");
    setSaveError("");
    setSaveSuccess("");
  };

  // STEP 1: SAVE + NEXT
  const handleSaveAndNext = async () => {
    setSaveError("");
    setSaveSuccess("");

    if (
      !selectedDistrict ||
      !selectedSecretary ||
      !selectedSocietyId ||
      !registrationNumber
    ) {
      setSaveError(
        "කරුණාකර දිස්ත්‍රික්කය, ප්‍රා.ලේ. කොට්ඨාසය, සමිතිය නාමය හා ලියාපදිංචි අංකය තෝරන්න."
      );
      return;
    }

    setSaving(true);
    try {
      const divisionId = divisionMap[selectedSecretary] || "";
      const selectedSociety =
        societies.find((s) => s.id === selectedSocietyId) || {};

      const payload = {
        district: selectedDistrict,
        divisionName: selectedSecretary,
        divisionId,
        societyDocId: selectedSocietyId,
        societyName: selectedSociety.name || "",
        registerNo: registrationNumber, // from Firestore, not typed
        createdAt: Timestamp.now(),
      };

      // Save one record of this selection
      await addDoc(collection(db, "startupSelections"), payload);

      // Save in localStorage – used by all forms
      localStorage.setItem(
        "selectedSocietyContext",
        JSON.stringify(payload)
      );

      // Update current user doc so SocietyOfficer sees this
      const userId = localStorage.getItem("userId");
      if (userId) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          district: selectedDistrict,
          division: selectedSecretary,
          society: selectedSociety.name || "",
          societyRegisterNo: registrationNumber,
        });
      } else {
        console.warn("No userId in localStorage, cannot update user profile.");
      }

      setSavedContext(payload);
      setSaveSuccess("සමිතියේ විස්තර සාර්ථකව තහවුරු කර සුරක්ෂිත කරන ලදී.");
      setStep(2); // move to choose-application step
    } catch (err) {
      console.error("Error saving selection:", err);
      setSaveError("තොරතුරු සුරක්ෂිත කිරීමේදී දෝෂයක් සිදු විය.");
    } finally {
      setSaving(false);
    }
  };

  // STEP 2: Navigate to relevant application
  const handleGoToApp = (path) => {
    navigate(path);
  };

  return (
    <section className="develop-wrapper">
      <div className="develop-container">
        <h2 className="form-title">
          ග්‍රාම සංවර්ධන සමිතිය සඳහා අයදුම් කිරීම
          <span className="form-subtitle">
            / Application for Rural Development Society
          </span>
        </h2>

        {step === 1 && (
          <>
            <p className="form-intro">
              පළමුව{" "}
              <strong>දිස්ත්‍රික්කය, ප්‍රාදේශීය ලේකම් කොට්ඨාසය</strong> සහ{" "}
              <strong>ග්‍රාම සංවර්ධන සමිතිය</strong> තෝරන්න.{" "}
              <strong>"Confirm Society & Continue"</strong> ඔබන විට තෝරාගත්
              සමිතිය Firebase DB එකට සුරක්ෂිත වන අතර අදාළ අයදුම්පත් තෝරා
              ගැනීමට හැකිය.
            </p>

            {saveError && (
              <p className="error-text" style={{ marginBottom: 8 }}>
                {saveError}
              </p>
            )}
            {saveSuccess && (
              <p className="success-text" style={{ marginBottom: 8 }}>
                {saveSuccess}
              </p>
            )}

            <form className="develop-form" onSubmit={(e) => e.preventDefault()}>
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

              {/* Registration Number (auto from DB) */}
              <div className="form-group">
                <label>04. ලියාපදිංචි අංකය:</label>
                <input
                  type="text"
                  placeholder="Automatic from database"
                  value={registrationNumber}
                  readOnly
                />
              </div>

              {/* Professional Next button */}
              <div className="submit-btn-container" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="submit-btn primary"
                  onClick={handleSaveAndNext}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Confirm Society & Continue"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 2 && savedContext && (
          <div className="step-two-container">
            <div className="society-summary-card">
              <h3>තෝරාගත් ග්‍රාම සංවර්ධන සමිතිය</h3>
              <div className="summary-row">
                <span>දිස්ත්‍රික්කය:</span>
                <strong>{savedContext.district}</strong>
              </div>
              <div className="summary-row">
                <span>ප්‍රා.ලේ. කොට්ඨාසය:</span>
                <strong>{savedContext.divisionName}</strong>
              </div>
              <div className="summary-row">
                <span>සමිතියේ නම:</span>
                <strong>{savedContext.societyName}</strong>
              </div>
              <div className="summary-row">
                <span>ලියාපදිංචි අංකය:</span>
                <strong>{savedContext.registerNo}</strong>
              </div>
              <button
                type="button"
                className="link-btn small"
                onClick={() => setStep(1)}
              >
                ← Edit Society Selection
              </button>
            </div>

            <div className="services-block">
              <h5 className="services-title">
                දැන් මෙහි සඳහන් සේවාවන්ගෙන් ඔබට අවශ්‍ය අයදුම්පත තෝරන්න:
              </h5>
              <div className="service-links vertical">
                <button
                  type="button"
                  className="service-button"
                  onClick={() => handleGoToApp("/student")}
                >
                  1. "ගැමිසෙත" ශිෂ්‍යත්ව අයදුම්පත
                </button>
                <button
                  type="button"
                  className="service-button"
                  onClick={() => handleGoToApp("/develop")}
                >
                  2. මුදල් නිදහස් කිරීමේ අයදුම්පත
                </button>
                <button
                  type="button"
                  className="service-button"
                  onClick={() => handleGoToApp("/society")}
                >
                  3. ණය යෙදවුම් අයදුම්පත
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Startup;