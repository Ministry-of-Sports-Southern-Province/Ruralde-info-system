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
    setFormData({ ...formData, [name]: value });
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...formData.results];
    newResults[index] = { ...newResults[index], [field]: value };
    setFormData({ ...formData, results: newResults });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("අයදුම් පත්‍රය යොමු කරන ලදි!");
  };

  return (
    <div className="student-container">
      <div className="develop-header">
        <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
        <h3>MS-SP/RD/FO/03</h3>
      </div>
      <h1 className="student-title">ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය</h1>

      <form className="student-form" onSubmit={handleSubmit}>
        <div>
          <label>1. ශිෂ්‍යයා / ශිෂ්‍යාවගේ සම්පූර්ණ නම</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>2. පෞද්ගලික ලිපිනය</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>3. අ.පො.ස (සා.පෙ) විභාගයට පෙනී සිටි වර්ෂය</label>
          <input
            type="text"
            name="examYear"
            value={formData.examYear}
            onChange={handleChange}
          />
          <div>
            <label>
              <input
                type="radio"
                name="examAttempt"
                value="first"
                onChange={handleChange}
              />
              ප්‍රථම වරට
            </label>
            <label>
              <input
                type="radio"
                name="examAttempt"
                value="second"
                onChange={handleChange}
              />
              දෙවන වරට
            </label>
          </div>
        </div>

        <div>
          <label>4. ප්‍රථමවරට විභාගයට පෙනී සිටි පාසල</label>
          <input
            type="text"
            name="firstSchool"
            value={formData.firstSchool}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>5. අ.පො.ස. (සා.පෙ) ප්‍රතිඵල</label>
          <table className="student-table">
            <thead>
              <tr>
                <th>විෂයය</th>
                <th>සාමාර්ථය</th>
              </tr>
            </thead>
            <tbody>
              {formData.results.map((r, i) => (
                <tr key={i}>
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
                      placeholder="සාමාර්ථය"
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

        <div>
          <label>6. විභාග පාසලේ විදුහල්පති නිර්දේශය</label>
          <textarea
            name="principalCert"
            value={formData.principalCert}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>7. උසස් පෙළ පාසලේ විදුහල්පති සහතිකය</label>
          <textarea
            name="currentSchoolCert"
            value={formData.currentSchoolCert}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>8. ග්‍රාම සංවර්ධන සමිතියෙන් ලබාදෙන ශිෂ්‍යාධාරය</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="රු. / මසකට"
              name="monthlyAmount"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="රු. / වර්ෂයකට"
              name="yearlyAmount"
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="රු. / වර්ෂ දෙකකට"
              name="totalAmount"
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label>9. ග්‍රාම නිලධාරී සහතිකය</label>
          <textarea
            name="villageOfficerCert"
            value={formData.villageOfficerCert}
            onChange={handleChange}
          />
        </div>

        <div className="submit-btn-container">
          <button type="submit" className="submit-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
