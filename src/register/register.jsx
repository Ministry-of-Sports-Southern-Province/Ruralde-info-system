import React, { useState } from "react";
import "../register/register.css";
import { Link } from "react-router-dom";

const Register = () => {
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

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSecretary, setSelectedSecretary] = useState("");

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedSecretary("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("සමිතිය ලියාපදිංචි කිරීම සාර්ථකයි!");
  };

  return (
    <section className="register-wrapper">
      <div className="register-container">
        <div className="register-header">
          <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
          <h3>සමිතිය ලියාපදිංචි කිරීම</h3>
        </div>

        <h2 className="register-title">සමිති ලියාපදිංචිය</h2>
        <p className="register-intro">
          මෙම අයදුම් පත්‍රය <strong>ග්‍රාම සංවර්ධන සමිතියක් ලියාපදිංචි කිරීම</strong>
          සදහාය. කරුණාකර දිස්ත්‍රික්කය, ප්‍රාදේශීය ලේකම් කොට්ඨාසය, ලියාපදිංචි තොරතුරු
          සහ සාමාජිකයින් ගණන නිවැරදිව සටහන් කරන්න.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* 01. District & 02. Division */}
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

          {/* 03. Register No + Date */}
          <div className="form-row">
            <div className="form-group">
              <label>03. ලියාපදිංචි අංකය:</label>
              <input type="text" placeholder="Enter Register No" required />
            </div>
            <div className="form-group">
              <label>ලියාපදිංචි දිනය:</label>
              <input type="date" required />
            </div>
          </div>

          {/* 04. Society name */}
          <div className="form-group">
            <label>04. ග්‍රාම සංවර්ධන සමිතියේ නම:</label>
            <input type="text" placeholder="Enter Society Name" required />
          </div>

          {/* 05. Address */}
          <div className="form-group">
            <label>05. ලිපිනය:</label>
            <input type="text" placeholder="Enter Address" required />
          </div>

          {/* 06. Phone */}
          <div className="form-group">
            <label>06. දුරකථන අංකය:</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter Mobile No"
              required
            />
          </div>

          {/* 07. Email */}
          <div className="form-group">
            <label>07. ඊමේල් ලිපිනය:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              required
            />
          </div>

          {/* 08. Members count */}
          <div className="form-group">
            <label>08. සාමාජිකයින් ගණන:</label>
            <input
              type="number"
              name="memberCount"
              min="0"
              placeholder="Total number of members"
              required
            />
          </div>

          {/* Position info links */}
          <div className="form-group">
            <label>09. තනතුරු තොරතුරු ඇතුලත් කිරීම:</label>
            <div className="btn-container">
              <Link to="/chairman" className="role-btn">
                සභාපති
              </Link>
              <Link to="/secretary" className="role-btn">
                ලේකම්
              </Link>
              <Link to="/treasurer" className="role-btn">
                භාණ්ඩාගාරික
              </Link>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-btn-container">
            <button type="submit" className="submit-btn">
              ලියාපදිංචි වන්න
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Register;