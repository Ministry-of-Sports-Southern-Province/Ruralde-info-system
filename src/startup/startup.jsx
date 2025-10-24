import React, { useState } from "react";
import "../startup/startup.css";
const Startup = () => {
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

  const [bankDetails, setBankDetails] = useState([
    { bankName: "", accountNumber: "", salary: "" },
  ]);
  const [debitDetails, setDebitDetails] = useState([
    { amount: "", date: "", warika: "" },
  ]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
  };

  const handleBankChange = (index, field, value) => {
    const newDetails = [...bankDetails];
    newDetails[index][field] = value;
    setBankDetails(newDetails);
  };

  const handleDebitChange = (index, field, value) => {
    const newDetails = [...debitDetails];
    newDetails[index][field] = value;
    setDebitDetails(newDetails);
  };

  const addBankRow = () => {
    setBankDetails([...bankDetails, { bankName: "", accountNumber: "", salary: "" }]);
  };

  const addDebitRow = () => {
    setDebitDetails([...debitDetails, { amount: "", date: "", warika: "" }]);
  };

  // ✅ Delete a bank row
  const deleteBankRow = (index) => {
    const newDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(newDetails);
  };

  // ✅ Delete a debit row
  const deleteDebitRow = (index) => {
    const newDetails = debitDetails.filter((_, i) => i !== index);
    setDebitDetails(newDetails);
  };

  return (
    <div className="develop-container">


      <form className="develop-form">
        {/* 01. District */}
        <div>
          <label>
            01.දිස්ත්රික්කය:
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              <option value="">තෝරන්න</option>
              <option value="Galle">ගාල්ල</option>
              <option value="Matara">මාතර</option>
              <option value="Hambantota">හම්බන්තොට</option>
            </select>
          </label>
        </div>

        {/* 02. Secretary Division */}
        <div>
          <label>
            02.ප්‍රාදේශීය ලේකම් කොට්ඨාසය :
            <select
              value={selectedSecretary}
              onChange={(e) => setSelectedSecretary(e.target.value)}
              disabled={!selectedDistrict}
            >
              <option value="">Select Division</option>
              {selectedDistrict &&
                districtData[selectedDistrict].map((sec, idx) => (
                  <option key={idx} value={sec}>
                    {sec}
                  </option>
                ))}
            </select>
          </label>
        </div>

        {/* Other Form Fields */}
        <div>
          <label>
            03.ලියාපදිංචි අංකය:
            <input type="text" placeholder="Enter Register No" />
          </label>


        </div>

        <div>
          <label>
            04.ග්‍රාම සංවර්ධන සමිතියේ නම :
            <input type="text" placeholder="Enter Name" />
          </label>
        </div>


        <h5>කරුණාකර පහත සඳහන් සේවාවන් අතරින් ඔබට අවශ්‍ය සේවාව තෝරා ගන්න.</h5>

        <button class="service-button">1.ගැමිසෙත ශිශ්‍යත්වය සදහා අයදුම් කිරීම.</button>
        <button class="service-button">2.මුදල් නිදහස් කර ගැනීමට අයදුම් කිරීම.</button>
        <button class="service-button">3.ණය සදහා අයදුම් කිරීම.</button>


      </form>
    </div>
  );
};

export default Startup;
