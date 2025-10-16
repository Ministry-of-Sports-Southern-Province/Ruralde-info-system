import React, { useState } from "react";
import "../member/member.css";

export default function Member() {
  const [members, setMembers] = useState([
    {
      name: "",
      address: "",
      nic: "",
      remainingBalance: "",
      currentProjects: "",
      loanPurpose: "",
      requestedLoan: "",
      signature: "",
    },
  ]);

  // ✅ Handle input change
  const handleInputChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  // ✅ Add new row
  const addRow = () => {
    setMembers([
      ...members,
      {
        name: "",
        address: "",
        nic: "",
        remainingBalance: "",
        currentProjects: "",
        loanPurpose: "",
        requestedLoan: "",
        signature: "",
      },
    ]);
  };

  // ✅ Delete a specific row
  const deleteRow = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  return (
    <div className="member-container">
        <div className="develop-header">
        <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
        <h3>MS-SP/RD/FO/03</h3>
      </div>
      <h2 className="member-title">
        ග්‍රාම සංවර්ධන සමිති ගිණුමෙන් ණය ඉල්ලුම් කරන සාමාජිකයින්ගේ තොරතුරු
      </h2>

      <table className="member-table">
        <thead>
          <tr>
            <th>අ/අ</th>
            <th>නම</th>
            <th>ලිපිනය</th>
            <th>ජාතික හැඳුනුම්පත් අංකය</th>
            <th>ඉතිරි මුදල (රු)</th>
            <th>ක්‍රියාත්මක ව්‍යාපෘති</th>
            <th>ණය අවශ්‍ය කාරණය</th>
            <th>ඉල්ලුම්කළ ණය මුදල (රු)</th>
            <th>අත්සන</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              {Object.keys(member).map((field) => (
                <td key={field}>
                  <input
                    type="text"
                    value={member[field]}
                    onChange={(e) =>
                      handleInputChange(i, field, e.target.value)
                    }
                    placeholder={
                      field === "signature" ? "Enter signature" : "Enter value"
                    }
                  />
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => deleteRow(i)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Row Button */}
      <div className="table-actions">
        <button type="button" className="add-btn" onClick={addRow}>
          ➕ Add Row
        </button>
      </div>

      <div className="certification">
        <p>
          ඉහත නම් සඳහන් සාමාජිකයින් විසින් ඇතුලත් කර ඇති තොරතුරු නිවැරදි බව
          සහතික කරමි. සමිතියේ ගැමිසෙත වැඩසටහන තුල මුදල් තැන්පත් කිරීම් හා ණය
          ආපසු ගෙවීම් සතුටුදායක බැවින් ඉහත සාමාජිකයන්ට ණය ලබාදෙන මෙන් ඉල්ලා
          සිටිමු. ණය ආපසු අයකර ග්‍රාම සංවර්ධන සමිති ගිණුමට බැර කිරීමේ වගකීම
          සහතික කරන්නෙමු.
        </p>

        {/* Signature Section */}
        <div className="signature-section">
          {[
            "ගරු සභාපති",
            "ගරු ලේකම්",
            "ගරු භාණ්ඩාගාරික",
            "සමිතියේ නිල මුද්‍රාව",
          ].map((role, idx) => (
            <div className="signature-field" key={idx}>
              <div className="signature-line"></div>
              <div>{role}</div>
              {role !== "සමිතියේ නිල මුද්‍රාව" && (
                <input
                  type="text"
                  placeholder="YYYY/MM/DD"
                  className="date-input"
                />
              )}
            </div>
          ))}
        </div>

        <p>
          ඉහත නම් සඳහන් ණය අයදුම්කරුවන්ගේ ව්‍යාපෘති පෞද්ගලිකව පරික්ෂා කර
          බැලීමි. ආදායම් ලබන ව්‍යාපෘතින් බැවින් වැඩි දියුණු කර ගැනීම සඳහා
          ඉල්ලුම්කරන ණය මුදල ලබා දීම නිර්දේශ කරමි. ව්‍යාපෘති සඳහා අපේක්ෂිත
          ණය එම කාර්යය සඳහාම යොදවනු ලබන බවට මා සෑහීමට පත්වෙමි. ලේඛණයේ ඇතුලත්
          සංඛ්‍යාත්මක තොරතුරු මුදල් පොත් හා සැසදේ.
        </p>

        <div className="final-signature">
          <div className="signature-line"></div>
          <div>ග්‍රාම සංවර්ධන නිලධාරි</div>
          <input
            type="text"
            placeholder="YYYY/MM/DD"
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
}
