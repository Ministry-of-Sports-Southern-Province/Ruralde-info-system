import React, { useState, useEffect } from "react";
import "../loan/develop.css";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Develop = () => {
  const navigate = useNavigate();

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

  // other form fields
  const [registerNo, setRegisterNo] = useState("");
  const [registerDate, setRegisterDate] = useState("");
  const [societyName, setSocietyName] = useState("");
  const [societyAddress, setSocietyAddress] = useState("");
  const [reasonFileName, setReasonFileName] = useState(""); // just file name
  const [requestedAmount, setRequestedAmount] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [repayMethod, setRepayMethod] = useState("");

  const [societyContext, setSocietyContext] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    // load selected society context from Startup
    try {
      const raw = localStorage.getItem("selectedSocietyContext");
      if (raw) {
        const ctx = JSON.parse(raw);
        setSocietyContext(ctx);

        // auto-fill some fields if available
        setSelectedDistrict(ctx.district || "");
        setSelectedSecretary(ctx.divisionName || "");
        setSocietyName(ctx.societyName || "");
        setRegisterNo(ctx.registerNo || "");
      }
    } catch (e) {
      console.error("Error reading selectedSocietyContext:", e);
    }
  }, []);

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

  const handleFileChange = (file) => {
    setAttachedFile(file);
    setReasonFileName(file ? file.name : "");
  };

  const validateForm = () => {
    if (!selectedDistrict) return "දිස්ත්‍රික්කය තෝරන්න.";
    if (!selectedSecretary) return "ප්‍රාදේශීය ලේකම් කොට්ඨාසය තෝරන්න.";
    if (!registerNo.trim()) return "ලියාපදිංචි අංකය ඇතුළත් කරන්න.";
    if (!societyName.trim()) return "සමිතියේ නම ඇතුළත් කරන්න.";
    if (!societyAddress.trim()) return "ලිපිනය ඇතුළත් කරන්න.";
    if (!requestedAmount.trim()) return "අවශ්‍ය මුදල ඇතුළත් කරන්න.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const errorMsg = validateForm();
    if (errorMsg) {
      setSubmitError(errorMsg);
      return;
    }

    setSubmitting(true);

    try {
      // Filter out completely empty dynamic rows
      const cleanedBanks = bankDetails.filter(
        (b) => b.bankName || b.accountNumber || b.salary
      );
      const cleanedDebits = debitDetails.filter(
        (d) => d.amount || d.date || d.warika
      );

      const payload = {
        // location + society info
        district: selectedDistrict,
        divisionName: selectedSecretary,
        societyName,
        registerNo,
        registerDate: registerDate || null,
        societyAddress,

        // bank + debit tables
        bankDetails: cleanedBanks,
        previousDebits: cleanedDebits,

        reasonFileName,
        requestedAmount,
        meetingDate: meetingDate || null,
        repayMethod,

        attachedFilePath: null, // if later you use Storage, save URL here

        societyContext: societyContext || null,

        status: "SubmittedToSocietyOfficer",
        currentRole: "society_officer",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "fundReleaseApplications"), payload);

      setSubmitSuccess(
        "මුදල් නිදහස් කිරීම සඳහා අයදුම්පත සාර්ථකව සුරක්ෂිත කර Society Officer වෙත යොමු කරන ලදී."
      );

      // Optional: redirect after a short delay
      setTimeout(() => {
        navigate("/societyofficer");
      }, 900);

      // Optional: clear form
      setBankDetails([{ bankName: "", accountNumber: "", salary: "" }]);
      setDebitDetails([{ amount: "", date: "", warika: "" }]);
      setRegisterDate("");
      setSocietyAddress("");
      setAttachedFile(null);
      setReasonFileName("");
      setRequestedAmount("");
      setMeetingDate("");
      setRepayMethod("");
    } catch (err) {
      console.error("Error saving fund release form:", err);
      setSubmitError(
        "අයදුම්පත සුරක්ෂිත කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
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

        {submitError && (
          <p className="develop-error" style={{ marginBottom: 8 }}>
            {submitError}
          </p>
        )}
        {submitSuccess && (
          <p className="develop-success" style={{ marginBottom: 8 }}>
            {submitSuccess}
          </p>
        )}

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
              <input
                type="text"
                placeholder="Enter Register No"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>ලියාපදිංචි දිනය:</label>
              <input
                type="date"
                value={registerDate}
                onChange={(e) => setRegisterDate(e.target.value)}
              />
            </div>
          </div>

          {/* Society Name & Address */}
          <div className="form-group">
            <label>04. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
            <input
              type="text"
              placeholder="Enter Society Name"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>05. ලිපිනය:</label>
            <input
              type="text"
              placeholder="Enter Address"
              value={societyAddress}
              onChange={(e) => setSocietyAddress(e.target.value)}
            />
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
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
            {reasonFileName && (
              <p className="muted-text">Attached: {reasonFileName}</p>
            )}
          </div>

          {/* Want Money */}
          <div className="form-group">
            <label>08. අවශ්‍ය මුදල රුපියල්:</label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
            />
          </div>

          {/* Date of Function */}
          <div className="form-group">
            <label>09. මීට අදාල මහා සභාව පැවැත්වු දිනය:</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
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
            <label>
              11. ඉල්ලුම් කරන මුදල නැවත සමිති ගිණුමට බැර කරන ආකාරය:
            </label>
            <select
              value={repayMethod}
              onChange={(e) => setRepayMethod(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Submit Button ONLY */}
          <div className="submit-btn-container">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Develop;