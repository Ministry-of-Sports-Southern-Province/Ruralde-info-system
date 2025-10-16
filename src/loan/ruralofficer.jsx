import React, { useState } from "react";
import "../loan/ruralofficer.css";

const RuralOfficer = () => {
  const [debitDetails, setDebitDetails] = useState([
    { date: "", cost: "", details: "" },
  ]);

  const [date, setDate] = useState(""); // ✅ Added for the signature date field

  // ✅ Handle debit row value change
  const handleDebitChange = (index, field, value) => {
    const newDetails = [...debitDetails];
    newDetails[index][field] = value;
    setDebitDetails(newDetails);
  };

  // ✅ Add new debit row
  const addDebitRow = () => {
    setDebitDetails([...debitDetails, { date: "", cost: "", details: "" }]);
  };

  // ✅ Delete a debit row
  const deleteDebitRow = (index) => {
    const newDetails = debitDetails.filter((_, i) => i !== index);
    setDebitDetails(newDetails);
  };

  return (
    <div className="rural-container">
      <div className="develop-header">
        <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
        <h3>MS-SP/RD/FO/03</h3>
      </div>
      <h2 className="rural-title">
        ග්‍රාම සංවර්ධන නිලධාරීන් විසින් සම්පූර්ණ කළ යුතුයි.
      </h2>

      <form className="rural-form">
        {/* 01. End Date */}
        <div>
          <label>
            01. සමිතියේ නිල කාලය අවසන් වන දිනය:
            <input type="date" />
          </label>
        </div>

        {/* 02. Start Date / Savings / Count of Members */}
        <div className="multi-input">
          <label>
            02. සමිතියේ ඉතිරි කිරීම් වැඩපිළිවෙලක් තිබේද ?
            <input type="number" placeholder="Enter Savings Amount" />
          </label>

          <label>
            ආරම්භ කල දිනය :
            <input type="date" />
          </label>

          <label>
            සාමාජික සංඛ්‍යාව
            <input type="number" placeholder="Enter Count" />
          </label>
        </div>

        {/* 03. Count of Societies */}
        <div>
          <label>
            03. ලබා දී ඇති ගැමිසෙත ශිෂ්‍යත්ව ගණන:
            <input type="number" placeholder="Enter Count" />
          </label>
        </div>

        {/* 04. Debit Details */}
        <div>
          <h4>
            04. සමිති ගිණුමෙන් මීට පෙර මුදල් නිදහස් කර තිබේනම් එම විස්තර හා
            ආපසු බැර කිරීම් විස්තර
          </h4>
          <table className="rural-table">
            <thead>
              <tr>
                <th>දිනය</th>
                <th>මුදල රු.</th>
                <th>මුදල් නිදහස් කළ කාරණය</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {debitDetails.map((row, index) => (
                <tr key={index}>
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
                      type="number"
                      value={row.cost}
                      onChange={(e) =>
                        handleDebitChange(index, "cost", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.details}
                      onChange={(e) =>
                        handleDebitChange(index, "details", e.target.value)
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
          <button type="button" className="add-row-btn" onClick={addDebitRow}>
            ➕ Add Row
          </button>
        </div>

        {/* 05. Want to Join? */}
        <div>
          <label>
            05. පළාත් අරමුදලට දායක වී තිබේද ?
            <select>
              <option value="">තෝරන්න</option>
              <option value="Yes">ඔව්</option>
              <option value="No">නැත</option>
            </select>
          </label>
        </div>

        {/* 06. Count of Salary */}
        <div>
          <label>
            06. ප්‍රාදේශීය බල මණ්ඩලයට දායක මුදල රු.
            <input type="number" placeholder="Enter Count" />
          </label>
        </div>

        {/* 07. Officer Signature & Date */}
        <div>
          <h4>07. ඉල්ලීමට අදාලව ග්‍රාම සංවර්ධන නිලධාරී නිර්දේශය : </h4>

          <div className="signature-section">
            <div className="signature-field">
              <div className="signature-line"></div>
              <div>අත්සන / නිල මුද්‍රාව</div>
            </div>

            <div className="signature-field">
              <input
                type="text"
                placeholder="YYYY/MM/DD"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="date-input"
              />
              <div>Date</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-btn-container">
          <button
            type="submit"
            className="submit-btn"
            onClick={(e) => {
              e.preventDefault();
              alert("Form submitted!");
            }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RuralOfficer;
