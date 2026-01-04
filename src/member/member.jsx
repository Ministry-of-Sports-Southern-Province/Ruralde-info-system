import React, { useState, useEffect } from "react";
import "../member/member.css";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

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

  const [societyContext, setSocietyContext] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load selected society context from Startup (same as other forms)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedSocietyContext");
      if (raw) {
        setSocietyContext(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error reading selectedSocietyContext:", e);
    }
  }, []);

  const handleInputChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const addRow = () => {
    setMembers((prev) => [
      ...prev,
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

  const deleteRow = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    // Basic validation: at least one member name
    const hasAnyName = members.some((m) => m.name.trim());
    if (!hasAnyName) {
      setSubmitError("අවම වශයෙන් එක් සාමාජිකයෙකුගේ නම වත් ඇතුළත් කරන්න.");
      return;
    }

    if (!societyContext) {
      setSubmitError(
        "කරුණාකර පළමුව Startup පිටුවේදී දිස්ත්‍රික්කය / සමිතිය තෝරා සුරක්ෂිත කරන්න."
      );
      return;
    }

    setSubmitting(true);
    try {
      // Remove completely empty rows
      const cleanedMembers = members.filter(
        (m) =>
          m.name.trim() ||
          m.address.trim() ||
          m.nic.trim() ||
          m.remainingBalance ||
          m.currentProjects.trim() ||
          m.loanPurpose.trim() ||
          m.requestedLoan ||
          m.signature.trim()
      );

      const payload = {
        members: cleanedMembers,
        societyContext: societyContext, // includes district, divisionName, societyName, registerNo...
        status: "SubmittedToSocietyOfficer",
        currentRole: "society_officer",
        createdAt: Timestamp.now(),
      };

      // Save to Firestore – adjust collection name if you want
      await addDoc(collection(db, "societyMemberLists"), payload);

      setSubmitSuccess(
        "සාමාජික තොරතුරු සාර්ථකව Firebase තුළ සුරක්ෂිත කර Society Officer වෙත යොමු කරන ලදී."
      );

      // Clear table after submit
      setMembers([
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
    } catch (err) {
      console.error("Error saving member list:", err);
      setSubmitError(
        "සාමාජික තොරතුරු සුරක්ෂිත කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="member-wrapper">
      <div className="member-container">
        <div className="member-header">
          <div>
            <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
            <h3>MS-SP/RD/FO/04</h3>
          </div>
          {societyContext && (
            <div className="society-context-chip">
              {societyContext.district} / {societyContext.divisionName} –{" "}
              {societyContext.societyName} ({societyContext.registerNo})
            </div>
          )}
        </div>

        <h2 className="member-title">
          ග්‍රාම සංවර්ධන සමිති ගිණුමෙන් ණය ඉල්ලුම් කරන සාමාජිකයින්ගේ තොරතුරු
        </h2>

        <p className="member-intro">
          මෙම වගුව තුළ <strong>ණය ඉල්ලුම් කරන</strong> සමිතියේ සාමාජිකයින්ගේ
          මුළු තොරතුරු සටහන් කරන්න. ජාතික හැඳුනුම්පත් අංක, ඉතිරි බාලන්ස්, ක්‍රියාත්මක
          ව්‍යාපෘති සහ ණය අවශ්‍ය කාරණය නිවැරදිව පුරවන්න.
        </p>

        {submitError && (
          <p className="member-error" style={{ marginBottom: 8 }}>
            {submitError}
          </p>
        )}
        {submitSuccess && (
          <p className="member-success" style={{ marginBottom: 8 }}>
            {submitSuccess}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="member-table-wrapper">
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
                    <td>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          handleInputChange(i, "name", e.target.value)
                        }
                        placeholder="Name"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.address}
                        onChange={(e) =>
                          handleInputChange(i, "address", e.target.value)
                        }
                        placeholder="Address"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.nic}
                        onChange={(e) =>
                          handleInputChange(i, "nic", e.target.value)
                        }
                        placeholder="NIC"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={member.remainingBalance}
                        onChange={(e) =>
                          handleInputChange(
                            i,
                            "remainingBalance",
                            e.target.value
                          )
                        }
                        placeholder="Rs."
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.currentProjects}
                        onChange={(e) =>
                          handleInputChange(
                            i,
                            "currentProjects",
                            e.target.value
                          )
                        }
                        placeholder="Current projects"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.loanPurpose}
                        onChange={(e) =>
                          handleInputChange(i, "loanPurpose", e.target.value)
                        }
                        placeholder="Loan purpose"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={member.requestedLoan}
                        onChange={(e) =>
                          handleInputChange(
                            i,
                            "requestedLoan",
                            e.target.value
                          )
                        }
                        placeholder="Amount"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={member.signature}
                        onChange={(e) =>
                          handleInputChange(i, "signature", e.target.value)
                        }
                        placeholder="Signature"
                      />
                    </td>
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
          </div>

          {/* Add Row Button */}
          <div className="table-actions">
            <button type="button" className="add-btn" onClick={addRow}>
              ➕ Add Row
            </button>
          </div>

          {/* Certification Section */}
          <div className="certification">
            <p>
              ඉහත නම් සඳහන් සාමාජිකයින් විසින් ඇතුලත් කර ඇති තොරතුරු නිවැරදි බව
              සහතික කරමි. සමිතියේ ගැමිසෙත වැඩසටහන තුළ මුදල් තැන්පත් කිරීම් හා ණය
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
                  <div className="signature-line" />
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
              <div className="signature-line" />
              <div>ග්‍රාම සංවර්ධන නිලධාරි</div>
              <input
                type="text"
                placeholder="YYYY/MM/DD"
                className="date-input"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="submit-btn-container">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}