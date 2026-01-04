import React, { useState, useEffect } from "react";
import "../student/student.css";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function GamisaethaScholarshipForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    examYear: "",
    examAttempt: "",
    firstSchool: "",
    results: Array(10).fill({ subject: "", grade: "" }),
    principalCert: "",
    currentSchoolCert: "",
    monthlyAmount: "",
    yearlyAmount: "",
    totalAmount: "",
    villageOfficerCert: "",
  });

  const [societyContext, setSocietyContext] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Load selected society context from localStorage (set in Startup.jsx)
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      if (type === "radio") {
        return { ...prev, [name]: value };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...formData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setFormData((prev) => ({ ...prev, results: newResults }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "ශිෂ්‍යයා / ශිෂ්‍යාවගේ නම අවශ්‍යයි.";
    if (!formData.address.trim()) return "පෞද්ගලික ලිපිනය අවශ්‍යයි.";
    if (!formData.examYear.trim()) return "විභාග වර්ෂය සටහන් කරන්න.";
    if (!formData.examAttempt) return "විභාගයට පෙනී සිටීම (ප්‍රථම / දෙවන) තෝරන්න.";
    if (!formData.firstSchool.trim())
      return "ප්‍රථමවරට විභාගයට පෙනී සිටි පාසල සටහන් කරන්න.";

    // At least one result row with subject
    const hasAnySubject = formData.results.some(
      (r) => r.subject.trim() || r.grade.trim()
    );
    if (!hasAnySubject) return "අවම වශයෙන් එක් විෂයක් වත් ප්‍රතිඵලයෙන් ඇතුළත් කරන්න.";

    if (!formData.principalCert.trim())
      return "විභාග පාසලේ විදුහල්පති නිර්දේශය සටහන් කරන්න.";
    if (!formData.currentSchoolCert.trim())
      return "උසස් පෙළ පාසලේ විදුහල්පති සහතිකය සටහන් කරන්න.";
    if (!formData.monthlyAmount.trim())
      return "මසකට ලබාදෙන ශිෂ්‍යත්ව මුදල සටහන් කරන්න.";
    if (!formData.villageOfficerCert.trim())
      return "ග්‍රාම නිලධාරී සහතිකය සටහන් කරන්න.";

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
      const payload = {
        ...formData,
        // remove empty results rows
        results: formData.results.filter(
          (r) => r.subject.trim() || r.grade.trim()
        ),
        // attach society context if available
        societyContext: societyContext || null,
        status: "SubmittedToSocietyOfficer",
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "scholarshipApplications"), payload);

      setSubmitSuccess(
        '"ගැමිසෙත" ශිෂ්‍යත්ව අයදුම් පත්‍රය සාර්ථකව සුරක්ෂිත කර Society Officer වෙත යොමු කරන ලදී.'
      );

      // If you want to clear the form after submit, keep this.
      // If you want to keep the filled data, you can remove this block.
      setFormData({
        fullName: "",
        address: "",
        examYear: "",
        examAttempt: "",
        firstSchool: "",
        results: Array(10).fill({ subject: "", grade: "" }),
        principalCert: "",
        currentSchoolCert: "",
        monthlyAmount: "",
        yearlyAmount: "",
        totalAmount: "",
        villageOfficerCert: "",
      });

      // NOTE: redirect removed as requested.
      // User will stay on this page and only see the success message.
      // setTimeout(() => {
      //   navigate("/societyofficer");
      // }, 800);
    } catch (err) {
      console.error("Error saving scholarship application:", err);
      setSubmitError(
        "අයදුම් පත්‍රය සුරක්ෂිත කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="student-wrapper">
      <div className="student-container">
        {/* Header */}
        <div className="develop-header">
          <div>
            <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
            <h3>MS-SP/RD/FO/05</h3>
          </div>
          {societyContext && (
            <div className="society-context-chip">
              {societyContext.district} / {societyContext.divisionName} –{" "}
              {societyContext.societyName} ({societyContext.registerNo})
            </div>
          )}
        </div>

        <h1 className="student-title">"ගැමිසෙත" ශිෂ්‍යත්ව අයදුම් පත්‍රය</h1>
        <p className="student-intro">
          මෙම අයදුම් පත්‍රය{" "}
          <strong>අ.පො.ස. (සා.පෙ)</strong> විභාගයේ දක්ෂතා හෙබෙවූ සහ ආර්ථික
          දුර්වල පවුල්වලින් පසුවන ශිෂ්‍යයා/ශිෂ්‍යාවන් සඳහා වන{" "}
          <strong>"ගැමිසෙත" ශ්‍රීමත් දක්ෂතා ශිෂ්‍යත්වය</strong> සඳහා ය.
          කරුණාකර සියලුම කොටස් නිවැරදිව, පැහැදිලිව පුරවන්න.
        </p>

        {submitError && (
          <p className="error-text" style={{ marginBottom: 8 }}>
            {submitError}
          </p>
        )}
        {submitSuccess && (
          <p className="success-text" style={{ marginBottom: 8 }}>
            {submitSuccess}
          </p>
        )}

        <form className="student-form" onSubmit={handleSubmit}>
          {/* 1. Name */}
          <div className="form-group">
            <label>1. ශිෂ්‍යයා / ශිෂ්‍යාවගේ සම්පූර්ණ නම:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="සිංහලට සම්පූර්ණ නම"
            />
          </div>

          {/* 2. Address */}
          <div className="form-group">
            <label>2. පෞද්ගලික ලිපිනය:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="නිවසේ අංකය, වීථිය, ග්‍රාමය, ග්‍රාම නිලධාරී වසම"
            />
          </div>

          {/* 3. Exam year + attempt */}
          <div className="form-row">
            <div className="form-group">
              <label>3. අ.පො.ස. (සා.පෙ) විභාගයට පෙනී සිටි වර්ෂය:</label>
              <input
                type="text"
                name="examYear"
                value={formData.examYear}
                onChange={handleChange}
                placeholder="උදා. 2024"
              />
            </div>

            <div className="form-group">
              <label>විභාගයට පෙනී සිටීම:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="examAttempt"
                    value="first"
                    checked={formData.examAttempt === "first"}
                    onChange={handleChange}
                  />
                  ප්‍රථම වරට
                </label>
                <label>
                  <input
                    type="radio"
                    name="examAttempt"
                    value="second"
                    checked={formData.examAttempt === "second"}
                    onChange={handleChange}
                  />
                  දෙවන වරට
                </label>
              </div>
            </div>
          </div>

          {/* 4. First School */}
          <div className="form-group">
            <label>4. ප්‍රථමවරට විභාගයට පෙනී සිටි පාසල:</label>
            <input
              type="text"
              name="firstSchool"
              value={formData.firstSchool}
              onChange={handleChange}
              placeholder="පාසලේ නම"
            />
          </div>

          {/* 5. Results */}
          <div className="section-block">
            <label>5. අ.පො.ස. (සා.පෙ) ප්‍රතිඵල:</label>
            <p className="muted-text">
              විෂය නාමය හා ලබාගත් සාමාර්ථය (A / B / C / S / W) සටහන් කරන්න.
            </p>
            <div className="student-table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>අ/අ</th>
                    <th>විෂය</th>
                    <th>සාමාර්ථය</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.results.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <input
                          type="text"
                          placeholder={`විෂයය ${i + 1}`}
                          value={r.subject}
                          onChange={(e) =>
                            handleResultChange(i, "subject", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="A / B / C / S / W"
                          value={r.grade}
                          onChange={(e) =>
                            handleResultChange(i, "grade", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Principal recommendation (O/L school) */}
          <div className="form-group">
            <label>6. විභාග පාසලේ විදුහල්පති නිර්දේශය:</label>
            <textarea
              name="principalCert"
              value={formData.principalCert}
              onChange={handleChange}
              placeholder="අදාළ නිර්දේශ සටහන් කරන්න"
            />
          </div>

          {/* 7. A/L school principal certification */}
          <div className="form-group">
            <label>7. උසස් පෙළ පාසලේ විදුහල්පති සහතිකය:</label>
            <textarea
              name="currentSchoolCert"
              value={formData.currentSchoolCert}
              onChange={handleChange}
              placeholder="වර්තමාන පාසලේ විදුහල්පතිගේ සහතිකය / නිර්දේශය"
            />
          </div>

          {/* 8. Scholarship amount */}
          <div className="form-group">
            <label>8. ග්‍රාම සංවර්ධන සමිතියෙන් ලබාදෙන ශිෂ්‍යාධාරය:</label>
            <div className="scholarship-amount-row">
              <input
                type="text"
                placeholder="රු. / මසකට"
                name="monthlyAmount"
                value={formData.monthlyAmount}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="රු. / වර්ෂයකට"
                name="yearlyAmount"
                value={formData.yearlyAmount}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="රු. / වර්ෂ දෙකකට"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 9. Village Officer certification */}
          <div className="form-group">
            <label>9. ග්‍රාම නිලධාරී සහතිකය:</label>
            <textarea
              name="villageOfficerCert"
              value={formData.villageOfficerCert}
              onChange={handleChange}
              placeholder="ග්‍රාම නිලධාරී විසින් සනාථ කරන ලද තොරතුරු සටහන් කරන්න."
            />
          </div>

          <div className="submit-btn-container">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Submit / යවන්න"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}