import React, { useState } from "react";
import "../student/student.css";

export default function GamisaethaScholarshipForm() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...formData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setFormData((prev) => ({ ...prev, results: newResults }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("අයදුම් පත්‍රය යොමු කරන ලදි!");
  };

  return (
    <section className="student-wrapper">
      <div className="student-container">
        {/* Header */}
        <div className="develop-header">
          <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
          <h3>MS-SP/RD/FO/05</h3>
        </div>

        <h1 className="student-title">"ගැමිසෙත" ශිෂ්‍යත්ව අයදුම් පත්‍රය</h1>
        <p className="student-intro">
          මෙම අයදුම් පත්‍රය <strong>අ.පො.ස. (සා.පෙ)</strong> විභාගයේ
          දක්ෂතා හෙබෙවූ සහ ආර්ථික දුර්වල පවුල්වලින් පසුවන ශිෂ්‍යයා/ශිෂ්‍යාවන්
          සඳහා වන{" "}
          <strong>"ගැමිසෙත" ශ්‍රීමත් දක්ෂතා ශිෂ්‍යත්වය</strong> සඳහා ය.
          කරුණාකර සියලුම කොටස් නිවැරදිව පුරවන්න.
        </p>

        <form className="student-form" onSubmit={handleSubmit}>
          {/* 1. Name */}
          <div className="form-group">
            <label>1. ශිෂ්‍යයා / ශිෂ්‍යාවගේ සම්පූර්ණ නම:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name in Sinhala"
            />
          </div>

          {/* 2. Address */}
          <div className="form-group">
            <label>2. පෞද්ගලික ලිපිනය:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House No, Street, Village, GN Division"
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
                placeholder="e.g. 2024"
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
              placeholder="Name of school"
            />
          </div>

          {/* 5. Results */}
          <div className="section-block">
            <label>5. අ.පො.ස. (සා.පෙ) ප්‍රතිඵල:</label>
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
              placeholder="Enter recommendation / අදාළ නිර්දේශ සටහන් කරන්න"
            />
          </div>

          {/* 7. A/L school principal certification */}
          <div className="form-group">
            <label>7. උසස් පෙළ පාසලේ විදුහල්පති සහතිකය:</label>
            <textarea
              name="currentSchoolCert"
              value={formData.currentSchoolCert}
              onChange={handleChange}
              placeholder="Current school certificate content"
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
              placeholder="Certified by GN / ග්‍රාම නිලධාරී විසින් සනාථ කරනු ලැබේ."
            />
          </div>

          <div className="submit-btn-container">
            <button type="submit" className="submit-btn">
              Submit / යවන්න
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}