import React, { useState, useEffect } from "react";
import "../student/student.css";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function GamisaethaScholarshipForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    examYear: "",
    examAttempt: "first", // default tab: ප්‍රථම වරට
    firstSchool: "",
    resultsFirstAttempt: Array(10).fill({ subject: "", grade: "" }),
    resultsSecondAttempt: Array(10).fill({ subject: "", grade: "" }),
    principalCert: "",
    currentSchoolCert: "",
    monthlyAmount: "",
    yearlyAmount: "",
    totalAmount: "",
    villageOfficerCert: "",
  });

  const [activeAttemptTab, setActiveAttemptTab] = useState("first");
  const [societyContext, setSocietyContext] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Load society context (district/division/society/registerNo) from localStorage
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttemptTabChange = (attempt) => {
    setActiveAttemptTab(attempt);
    setFormData((prev) => ({
      ...prev,
      examAttempt: attempt,
    }));
  };

  const handleResultChange = (attemptKey, index, field, value) => {
    const resultsKey =
      attemptKey === "first" ? "resultsFirstAttempt" : "resultsSecondAttempt";
    const currentResults = [...formData[resultsKey]];
    currentResults[index] = { ...currentResults[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      [resultsKey]: currentResults,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim())
      return "ශිෂ්‍යයා / ශිෂ්‍යාවගේ සම්පූර්ණ නම අවශ්‍යයි.";
    if (!formData.address.trim()) return "පෞද්ගලික ලිපිනය අවශ්‍යයි.";
    if (!formData.examYear.trim())
      return "අ.පො.ස. (සා.පෙ) විභාග වර්ෂය සටහන් කරන්න.";
    if (!formData.firstSchool.trim())
      return "ප්‍රථමවරට විභාගයට පෙනී සිටි පාසල සටහන් කරන්න.";

    const activeResultsKey =
      formData.examAttempt === "first"
        ? "resultsFirstAttempt"
        : "resultsSecondAttempt";

    const hasAnySubject = formData[activeResultsKey].some(
      (r) => r.subject.trim() || r.grade.trim()
    );
    if (!hasAnySubject)
      return "අවම වශයෙන් එක් විෂයකවත් විෂය නාමයක් හෝ සාමාර්ථයක් සටහන් කරන්න.";

    if (!formData.principalCert.trim())
      return "විභාග පාසලේ විදුහල්පති නිර්දේශය සටහන් කරන්න.";
    if (!formData.currentSchoolCert.trim())
      return "උසස් පෙළ පාසලේ විදුහල්පති සහතිකය සටහන් කරන්න.";
    if (!formData.monthlyAmount.trim())
      return "මාසික ශිෂ්‍යත්ව මුදල (රු.) සටහන් කරන්න.";
    if (!formData.villageOfficerCert.trim())
      return "ග්‍රාම නිලධාරීගේ සහතිකය සටහන් කරන්න.";

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
      const cleanedFirstAttempt = formData.resultsFirstAttempt.filter(
        (r) => r.subject.trim() || r.grade.trim()
      );
      const cleanedSecondAttempt = formData.resultsSecondAttempt.filter(
        (r) => r.subject.trim() || r.grade.trim()
      );

      const now = Timestamp.now();

      const payload = {
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        examYear: formData.examYear.trim(),
        examAttempt: formData.examAttempt,
        firstSchool: formData.firstSchool.trim(),
        resultsFirstAttempt: cleanedFirstAttempt,
        resultsSecondAttempt: cleanedSecondAttempt,
        principalCert: formData.principalCert.trim(),
        currentSchoolCert: formData.currentSchoolCert.trim(),
        monthlyAmount: formData.monthlyAmount.trim(),
        yearlyAmount: formData.yearlyAmount.trim(),
        totalAmount: formData.totalAmount.trim(),
        villageOfficerCert: formData.villageOfficerCert.trim(),

        // IMPORTANT for society officer / chairman profile:
        societyContext: societyContext || null,         // so we can match societyRegisterNo
        status: "SubmittedToSocietyOfficer",
        currentRole: "society_officer",                 // first step in workflow
        history: [
          {
            role: "student",
            action: "submitted_scholarship_application",
            at: now,
          },
        ],
        createdAt: now,
      };

      await addDoc(collection(db, "scholarshipApplications"), payload);

      setSubmitSuccess(
        '"ගැමිසෙත" ශිෂ්‍යත්ව අයදුම්පත්‍රය සාර්ථකව සුරක්ෂිත කරන ලදී. ' +
          "මෙම අයදුම්පත සමාජ නිලධාරී / සභාපති / ලේකම් / භාණ්ඩාගාරික ප්‍රොෆයිල් වලින් දැක ගත හැක."
      );

      // Reset form
      setFormData({
        fullName: "",
        address: "",
        examYear: "",
        examAttempt: "first",
        firstSchool: "",
        resultsFirstAttempt: Array(10).fill({ subject: "", grade: "" }),
        resultsSecondAttempt: Array(10).fill({ subject: "", grade: "" }),
        principalCert: "",
        currentSchoolCert: "",
        monthlyAmount: "",
        yearlyAmount: "",
        totalAmount: "",
        villageOfficerCert: "",
      });
      setActiveAttemptTab("first");
    } catch (err) {
      console.error("Error saving scholarship application:", err);
      setSubmitError(
        "අයදුම්පත්‍රය සුරක්ෂිත කිරීමේදී දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderResultsTable = (attemptKey) => {
    const isFirst = attemptKey === "first";
    const resultsKey = isFirst ? "resultsFirstAttempt" : "resultsSecondAttempt";
    const results = formData[resultsKey];

    return (
      <div className="section-block">
        <div className="section-header">
          <span className="section-number">5.</span>
          <div className="section-text">
            <div className="section-title">
              අ.පො.ස. (සා.පෙ) ප්‍රතිඵල සටහන් කරන්න
            </div>
            <div className="section-subtitle">
              {isFirst
                ? "ප්‍රථම වරට විභාගයට පෙනී සිටීමේදී ලබාගත් ප්‍රතිඵල"
                : "දෙවන වරට විභාගයට පෙනී සිටීමේදී ලබාගත් ප්‍රතිඵල"}
            </div>
          </div>
        </div>

        <p className="muted-text">
          කරුණාකර විෂය නාමය සහ ලබාගත් සාමාර්ථය (A / B / C / S / W) සවිස්තරව
          සටහන් කරන්න.
        </p>

        <div className="student-table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>අ/අ</th>
                <th>විෂය නාමය</th>
                <th style={{ width: "20%" }}>සාමාර්ථය</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={`${attemptKey}-${i}`}>
                  <td>{i + 1}</td>
                  <td>
                    <input
                      type="text"
                      placeholder={`විෂයය ${i + 1}`}
                      value={r.subject}
                      onChange={(e) =>
                        handleResultChange(
                          attemptKey,
                          i,
                          "subject",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="උදා. A"
                      value={r.grade}
                      onChange={(e) =>
                        handleResultChange(
                          attemptKey,
                          i,
                          "grade",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section className="student-wrapper">
      <div className="student-container student-container--wide">
        {/* Header – WITHOUT top‑right society line */}
        <div className="develop-header">
          <div className="develop-header-left">
            <h3 className="dept-title">
              දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
            </h3>
            <h4 className="form-code">MS-SP/RD/FO/05</h4>
          </div>
        </div>

        <h1 className="student-title">“ගැමිසෙත” ශිෂ්‍යත්ව අයදුම්පත්‍රය</h1>
        <p className="student-intro">
          මෙම අයදුම්පත්‍රය <strong>අ.පො.ස. (සා.පෙ)</strong> විභාගයේදී දක්ෂතා
          හෙබි විදෙස් ආර්ථික දුර්වල පවුල්වලින් පැමිණෙන ශිෂ්‍යයන් සඳහා වන{" "}
          <strong>“ගැමිසෙත” ශිෂ්‍යත්වය</strong> ලබාගැනීමට යොදාගැනේ. කරුණාකර
          සියලු කොටස් නිවැරදිව සහ පැහැදිලිව පුරවන්න.
        </p>

        {submitError && (
          <div className="alert alert-error" style={{ marginBottom: 12 }}>
            {submitError}
          </div>
        )}
        {submitSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>
            {submitSuccess}
          </div>
        )}

        <form className="student-form" onSubmit={handleSubmit}>
          {/* 1. Name */}
          <div className="form-group">
            <label className="form-label">
              1. ශිෂ්‍යයා / ශිෂ්‍යාවගේ සම්පූර්ණ නම:
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="සිංහල භාෂාවෙන් සම්පූර්ණ නම ලියන්න"
            />
          </div>

          {/* 2. Address */}
          <div className="form-group">
            <label className="form-label">
              2. පෞද්ගලික ලිපිනය:
              <span className="required">*</span>
            </label>
            <textarea
              name="address"
              className="form-control textarea"
              value={formData.address}
              onChange={handleChange}
              placeholder="නිවසේ අංකය, වීථිය, ගම්මාන, ග්‍රාම නිලධාරී වසම වැනි සියලු විස්තර සටහන් කරන්න"
            />
          </div>

          {/* 3. Exam year */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                3. අ.පො.ස. (සා.පෙ) විභාගයට පෙනී සිටි වර්ෂය:
                <span className="required">*</span>
              </label>
              <input
                type="text"
                name="examYear"
                className="form-control"
                value={formData.examYear}
                onChange={handleChange}
                placeholder="උදාහරණය: 2024"
              />
            </div>
          </div>

          {/* 4. Attempt Tabs */}
          <div className="form-group">
            <label className="form-label">
              4. විභාගයට පෙනී සිටීම:
              <span className="required">*</span>
            </label>
            <div className="attempt-tabs">
              <button
                type="button"
                className={
                  activeAttemptTab === "first"
                    ? "attempt-tab attempt-tab--active"
                    : "attempt-tab"
                }
                onClick={() => handleAttemptTabChange("first")}
              >
                ප්‍රථම වරට
              </button>
              <button
                type="button"
                className={
                  activeAttemptTab === "second"
                    ? "attempt-tab attempt-tab--active"
                    : "attempt-tab"
                }
                onClick={() => handleAttemptTabChange("second")}
              >
                දෙවන වරට
              </button>
            </div>
            <p className="muted-text">
              ඔබට අදාල වාරය තෝරාගෙන, පහතින් එම වාරයට අදාල ප්‍රතිඵල සටහන්
              කරන්න.
            </p>
          </div>

          {/* 5. First School */}
          <div className="form-group">
            <label className="form-label">
              5. ප්‍රථමවරට අ.පො.ස. (සා.පෙ) විභාගයට පෙනී සිටි පාසල:
              <span className="required">*</span>
            </label>
            <input
              type="text"
              name="firstSchool"
              className="form-control"
              value={formData.firstSchool}
              onChange={handleChange}
              placeholder="ඔබ ප්‍රථම වරට විභාගයට පෙනී සිටි පාසලේ නම සටහන් කරන්න"
            />
          </div>

          {/* 6. Results */}
          {activeAttemptTab === "first"
            ? renderResultsTable("first")
            : renderResultsTable("second")}

          {/* 7. Principal recommendation (O/L school) */}
          <div className="form-group">
            <label className="form-label">
              6. අ.පො.ස. (සා.පෙ) විභාග පාසලේ විදුහල්පති නිර්දේශය:
              <span className="required">*</span>
            </label>
            <textarea
              name="principalCert"
              className="form-control textarea"
              value={formData.principalCert}
              onChange={handleChange}
              placeholder="විදුහල්පතිගේ නිර්දේශය/සහතිකය සවිස්තරව සටහන් කරන්න"
            />
          </div>

          {/* 8. A/L school principal certification */}
          <div className="form-group">
            <label className="form-label">
              7. වර්තමාන උසස් පෙළ පාසලේ විදුහල්පතිගේ සහතිකය:
              <span className="required">*</span>
            </label>
            <textarea
              name="currentSchoolCert"
              className="form-control textarea"
              value={formData.currentSchoolCert}
              onChange={handleChange}
              placeholder="වර්තමාන පාසලේ විදුහල්පතිගේ නිර්දේශය/සහතිකය සටහන් කරන්න"
            />
          </div>

          {/* 9. Scholarship amount */}
          <div className="form-group">
            <label className="form-label">
              8. ග්‍රාම සංවර්ධන සමිතියෙන් ලැබෙන ශිෂ්‍යත්ව මුදල්:
              <span className="required">*</span>
            </label>
            <p className="muted-text">
              මාසික, වාර්ෂික සහ වර්ෂ දෙකකට එන මුදල් වෙන්ව සටහන් කරන්න.
            </p>
            <div className="scholarship-amount-row">
              <div className="amount-field">
                <span className="amount-label">රු. (මාසික)</span>
                <input
                  type="text"
                  placeholder="උදා: 2,000"
                  name="monthlyAmount"
                  className="form-control"
                  value={formData.monthlyAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="amount-field">
                <span className="amount-label">රු. (වර්ෂික)</span>
                <input
                  type="text"
                  placeholder="උදා: 24,000"
                  name="yearlyAmount"
                  className="form-control"
                  value={formData.yearlyAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="amount-field">
                <span className="amount-label">රු. (වර්ෂ දෙකකට)</span>
                <input
                  type="text"
                  placeholder="උදා: 48,000"
                  name="totalAmount"
                  className="form-control"
                  value={formData.totalAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 10. Village Officer certification */}
          <div className="form-group">
            <label className="form-label">
              9. ග්‍රාම නිලධාරීගේ සහතිකය:
              <span className="required">*</span>
            </label>
            <textarea
              name="villageOfficerCert"
              className="form-control textarea"
              value={formData.villageOfficerCert}
              onChange={handleChange}
              placeholder="ග්‍රාම නිලධාරීවරයා විසින් සනාථ කරන ලද පවුලේ ආර්ථික තත්ත්වය සහ වෙනත් අදාල කරුණු සටහන් කරන්න"
            />
          </div>

          <div className="submit-btn-container">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "සුරක්ෂිත කරමින්..." : "යවන්න / Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}