import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../startup/startup.css";

const Startup = () => {
  // District and Secretary Divisions data
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

  // Form State
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");
  const [bankDetails, setBankDetails] = useState([{ bankName: "", accountNumber: "", salary: "" }]);
  const [debitDetails, setDebitDetails] = useState([{ amount: "", date: "", warika: "" }]);

  // Handlers
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
  };

  const handleBankChange = (index, field, value) => {
    const updated = [...bankDetails];
    updated[index][field] = value;
    setBankDetails(updated);
  };

  const handleDebitChange = (index, field, value) => {
    const updated = [...debitDetails];
    updated[index][field] = value;
    setDebitDetails(updated);
  };

  const addBankRow = () => setBankDetails([...bankDetails, { bankName: "", accountNumber: "", salary: "" }]);
  const deleteBankRow = (index) => setBankDetails(bankDetails.filter((_, i) => i !== index));

  const addDebitRow = () => setDebitDetails([...debitDetails, { amount: "", date: "", warika: "" }]);
  const deleteDebitRow = (index) => setDebitDetails(debitDetails.filter((_, i) => i !== index));

  return (
    <div className="develop-container">
      {/* Professional Title */}
      <h2 className="form-title">ග්‍රාම සංවර්ධන සමිතිය සඳහා අයදුම් කිරීම</h2>

      <form className="develop-form">
        {/* District Selection */}
        <div className="form-group">
          <label>01. දිස්ත්රික්කය:</label>
          <select value={selectedDistrict} onChange={(e) => handleDistrictChange(e.target.value)}>
            <option value="">තෝරන්න</option>
            {Object.keys(districtData).map((district) => (
              <option key={district} value={district}>
                {district === "Galle" ? "ගාල්ල" : district === "Matara" ? "මාතර" : "හම්බන්තොට"}
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

        {/* Registration Number */}
        <div className="form-group">
          <label>03. ලියාපදිංචි අංකය:</label>
          <input type="text" placeholder="Enter Register No" />
        </div>

        {/* Committee Name */}
        <div className="form-group">
          <label>04. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
          <input type="text" placeholder="Enter Name" />
        </div>

        {/* Services */}
        <h5>කරුණාකර පහත සඳහන් සේවාවන් අතරින් ඔබට අවශ්‍ය සේවාව තෝරා ගන්න:</h5>
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
