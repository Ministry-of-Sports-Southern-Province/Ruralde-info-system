import React, { useState } from "react";
import "../register/chairman.css";

const Treasurer = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    nic: "",
    dob: "",
    nicCopy: null,
    signature: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Treasurer form:", formData);
    alert("භාණ්ඩාගාරික තොරතුරු සම්පූර්ණ වාර්තාව යොමු කරන ලදි!");
  };

  return (
    <section className="chairman-wrapper">
      <div className="chairman-container">
        <h2 className="chairman-title">භාණ්ඩාගාරික තොරතුරු / Treasurer Details</h2>

        <p className="chairman-intro">
          මෙම අංශය <strong>ග්‍රාම සංවර්ධන සමිතියේ භාණ්ඩාගාරික</strong>ගේ
          පෞද්ගලික සහ සම්බන්ධතා තොරතුරු ලියාපදිංචි කිරීම සඳහා භාවිතා වේ.
        </p>

        <form className="chairman-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>1. සම්පූර්ණ නම:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>2. පෞද්ගලික ලිපිනය:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>3. දුරකථන අංකය:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07X XXXXXXX"
                required
              />
            </div>
            <div className="form-group">
              <label>4. ඊමේල් ලිපිනය:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>5. ජාතික හැඳුනුම්පත් අංකය:</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>6. උපන් දිනය:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>7. ජාතික හැදුනුම්පත පිටපත අමුණන්න:</label>
            <input
              type="file"
              name="nicCopy"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
            />
            <span className="field-note">
              (PDF / JPG / PNG – clear copy of both sides)
            </span>
          </div>

          <div className="form-group">
            <label>8. අත්සන පිටපත අමුණන්න:</label>
            <input
              type="file"
              name="signature"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
            />
            <span className="field-note">
              (Please upload a scanned signature sample)
            </span>
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
};

export default Treasurer;