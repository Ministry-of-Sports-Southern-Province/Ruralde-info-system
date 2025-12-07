import React, { useState } from "react";
import "../loan/develop.css";

const Develop = () => {
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

  const [bankDetails, setBankDetails] = useState([
    { bankName: "", accountNumber: "", salary: "" },
  ]);
  const [debitDetails, setDebitDetails] = useState([
    { amount: "", date: "", warika: "" },
  ]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);

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
    setBankDetails([
      ...bankDetails,
      { bankName: "", accountNumber: "", salary: "" },
    ]);
  };

  const addDebitRow = () => {
    setDebitDetails([
      ...debitDetails,
      { amount: "", date: "", warika: "" },
    ]);
  };

  const deleteBankRow = (index) => {
    const newDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(newDetails);
  };

  const deleteDebitRow = (index) => {
    const newDetails = debitDetails.filter((_, i) => i !== index);
    setDebitDetails(newDetails);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send data to backend / Firestore
    alert("Form submitted!");
  };

  return (
    <section className="develop-wrapper">
      <div className="develop-container">
        <div className="develop-header">
          <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
          <h3>MS-SP/RD/FO/03</h3>
        </div>

        <h2 className="develop-title">
          ග්‍රාම සංවර්ධන සමිති ගිණුමෙන් මුදල් නිදහස් කර ගැනීම සඳහා ඉල්ලුම් පත්‍රය
        </h2>

        <p className="develop-intro">
          කරුණාකර මෙම පත්‍රය සම්පූර්ණ කරන විට{" "}
          <strong>සමිතිය පිළිබඳ නිවැරදි තොරතුරු</strong> සහ{" "}
          <strong>පෙර ලබාගත් ණයක්</strong> සත්‍ය ලෙස සටහන් කරන්න.
        </p>

        <form className="develop-form" onSubmit={handleSubmit}>
          {/* District + Secretary */}
          <div className="form-row">
            <div className="form-group">
              <label>01. දිස්ත්රික්කය:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
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

          {/* Registration & Date */}
          <div className="form-row">
            <div className="form-group">
              <label>03. ලියාපදිංචි අංකය:</label>
              <input type="text" placeholder="Enter Register No" />
            </div>

            <div className="form-group">
              <label>ලියාපදිංචි දිනය:</label>
              <input type="date" />
            </div>
          </div>

          {/* Society Name & Address */}
          <div className="form-group">
            <label>04. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
            <input type="text" placeholder="Enter Society Name" />
          </div>

          <div className="form-group">
            <label>05. ලිපිනය:</label>
            <input type="text" placeholder="Enter Address" />
          </div>

          {/* Bank Table */}
          <div className="section-block">
            <h4>06. සමිතිය සතු බැංකු ගිණුම්</h4>
            <table className="develop-table">
              <thead>
                <tr>
                  <th>බැංකුවේ නම</th>
                  <th>ගිණුම් අංකය</th>
                  <th>ශේෂය</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankDetails.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={row.bankName}
                        onChange={(e) =>
                          handleBankChange(index, "bankName", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.accountNumber}
                        onChange={(e) =>
                          handleBankChange(index, "accountNumber", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.salary}
                        onChange={(e) =>
                          handleBankChange(index, "salary", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete-row-btn"
                        onClick={() => deleteBankRow(index)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="add-row-btn"
              onClick={addBankRow}
            >
              ➕ Add Row
            </button>
          </div>

          {/* Why want finance */}
          <div className="form-group">
            <label>
              07. මුදල් අවශ්‍ය කාරණය (ඇස්තමේන්තු පිටපත් අමුණන්න):
            </label>
            <input
              type="file"
              onChange={(e) => setAttachedFile(e.target.files[0])}
            />
          </div>

          {/* Want Money */}
          <div className="form-group">
            <label>08. අවශ්‍ය මුදල රුපියල්:</label>
            <input type="number" placeholder="Enter Amount" />
          </div>

          {/* Date of Function */}
          <div className="form-group">
            <label>09. මීට අදාල මහා සභාව පැවැත්වු දිනය:</label>
            <input type="date" />
          </div>

          {/* Debit Money Table */}
          <div className="section-block">
            <h4>10. සමිති ගිණුමෙන් මීට පෙර ලබා ගත් ණය</h4>
            <table className="develop-table">
              <thead>
                <tr>
                  <th>ලබාගත් මුදල</th>
                  <th>ලබාගත් දිනය</th>
                  <th>දැනට ගෙවා ඇති වාරික ගණන ( මුදල )</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {debitDetails.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) =>
                          handleDebitChange(index, "amount", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) =>
                          handleDebitChange(index, "date", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.warika}
                        onChange={(e) =>
                          handleDebitChange(index, "warika", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="delete-row-btn"
                        onClick={() => deleteDebitRow(index)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="add-row-btn"
              onClick={addDebitRow}
            >
              ➕ Add Row
            </button>
          </div>

          {/* Type of Debit */}
          <div className="form-group">
            <label>11. ඉල්ලුම් කරන මුදල නැවත සමිති ගිණුමට බැර කරන ආකාරය:</label>
            <select>
              <option value="">Select Type</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Signatures */}
          <div className="section-block">
            <h4>12. ඉහත සඳහන් තොරතුරු නිවැරදි බැව් සහතික කරමි.</h4>
            <div className="signature-section">
              <div className="signature-field">
                <div className="signature-line" />
                <div>භාණ්ඩාගාරික</div>
              </div>
              <div className="signature-field">
                <div className="signature-line" />
                <div>සභාපති</div>
              </div>
              <div className="signature-field">
                <div className="signature-line" />
                <div>ලේකම්</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-btn-container">
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </div>

          {/* Verification Links */}
          <div className="verification-links">
            <a href="/ruralofficer" className="verification-link">
              Rural Officer Verification
            </a>
            <span className="verification-separator">|</span>
            <a href="/provincialofficer" className="verification-link">
              Provincial Officer Verification
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Develop;