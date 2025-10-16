import React, { useState } from "react";
import "../loan/provincialofficer.css";

const ProvincialOfficer = () => {
  const [recommendation, setRecommendation] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="provincial-container">
      <div className="develop-header">
        <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
        <h3>MS-SP/RD/FO/03</h3>
      </div>
      <h2 className="provincial-title">
        දකුණු පළාත් ග්‍රාම සංවර්ධන අමාත්‍යාංශයේ ප්‍රයෝජනය සදහා පමණි
      </h2>

      <form className="provincial-form">
        
        {/* Instruction Section */}
        <div className="provincial-instruction">
          <span>දිස්ත්‍රික් නිලධාරී ( ග්‍රාම සංවර්ධන ) නිර්දේශය</span>
          <br />
          නිර්දේශ{" "}
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="dropdown"
          >
            <option value="">-- තෝරන්න --</option>
            <option value="කරමි">කරමි</option>
            <option value="නොකරමි">නොකරමි</option>
          </select>
          <br />
          <br />
          {" "}පළාත් අරමුදලට රු{" "}
          <input
            type="text"
            className="amount-input"
            placeholder="Enter amount"
          />{" "}
          තැන්පත් කිරීම නිර්දේශ කරමි.
        </div>

        {/* Signature & Date Section */}
        <div className="signature-section">
          <div className="signature-field">
            <div className="signature-line"></div>
            <div>අත්සන</div>
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

        <hr className="styled-hr" />

        {/* Director Approval Section */}
        <div className="provincial-instruction">
          <span>පළාත් ග්‍රාම සංවර්ධන අධ්‍යක්ෂ අනුමැතිය</span>
          <br />
          අනුමත{" "}
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="dropdown"
          >
            <option value="">-- තෝරන්න --</option>
            <option value="කරමි">කරමි</option>
            <option value="නොකරමි">නොකරමි</option>
          </select>
        </div>

        <div className="signature-section">
          <div className="signature-field">
            <div className="signature-line"></div>
            <div>
              පළාත් ග්‍රාම සංවර්ධන අධ්‍යක්ෂ
              <br />
              ග්‍රාම සංවර්ධන අමාත්‍යංශය
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-btn-container">
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProvincialOfficer;
