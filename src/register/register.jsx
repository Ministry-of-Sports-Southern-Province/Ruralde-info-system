import React, { useState } from "react";
import "../register/register.css";
import { Link } from "react-router-dom";

const Register = () => {
    const districtData = {
        Galle: [
            "හික්කඩුව", "හබරාදුව", "ඇල්පිටිය", "යක්කලමුල්ල", "තවලම", "නාගොඩ", "නෙඵව",
            "අක්මීමණ", "නියාගම", "ගාල්ල කඩවත්සතර", "බද්දේගම", "බෙන්තොට", "බෝපේ පෝද්දල",
            "බලපිටිය", "අම්බලන්ගොඩ", "ඉමදුව", "කරන්දෙනිය", "වැලිවිටිය දිවිතුර", "ගෝනාපිනුවල",
            "රත්ගම", "මාදම්පාගම", "වඳුරඔ"
        ],
        Matara: [
            "තිහගොඩ", "අකුරැස්ස", "හක්මණ", "වැලිගම", "මාලිම්බඩ", "දික්වැල්ල", "අතුරලිය",
            "දෙවිනුවර", "පිටබැද්දර", "මුලටියන", "වැලිපිටිය", "පස්ගොඩ", "කඔරුපිටිය",
            "කිරින්ද පුහුල්වැල්ල", "කොටපොළ", "මාතර"
        ],
        Hambantota: [
            "අඟුණකොලපැලැස්ස", "අම්බලන්තොට", "බෙලිඅත්ත", "හම්බන්තොට", "කටුවන", "ලුණුගම්වෙහෙර",
            "ඕකෙවෙල", "සූරියවැව", "තංගල්ල", "තිස්සමහාරාමය", "වලස්මුල්ල", "වීරකැටිය"
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
        alert("Form submitted!");
    };

    return (
        <div className="register-container">
            <div className="title">
                <h2>සමිති ලියාපදින්චිය</h2>
                <p>මෙම පිටුව සමිති ලියාපදින්චිය සඳහා වන ආකෘතියක් වේ. කරුණාකර පහත දත්ත පුරවන්න:</p>

                <form className="register-form" onSubmit={handleSubmit}>
                    {/* 01. District */}
                    <div>
                        <label>
                            01.දිස්ත්රික්කය:
                            <select
                                value={selectedDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                            >
                                <option value="">තෝරන්න</option>
                                <option value="Galle">ගාල්ල</option>
                                <option value="Matara">මාතර</option>
                                <option value="Hambantota">හම්බන්තොට</option>
                            </select>
                        </label>
                    </div>

                    {/* 02. Secretary Division */}
                    <div>
                        <label>
                            02.ප්‍රාදේශීය ලේකම් කොට්ඨාසය:
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
                        </label>
                    </div>

                    {/* Other Form Fields */}
                    <div>
                        <label>
                            03.ලියාපදිංචි අංකය:
                            <input type="text" placeholder="Enter Register No" />
                        </label>

                        <label>ලියාපදිංචි දිනය:</label>
                        <input type="date" />
                    </div>

                    <div>
                        <label>
                            04.ග්‍රාම සංවර්ධන සමිතියේ නම:
                            <input type="text" placeholder="Enter Name" />
                        </label>
                    </div>

                    <div>
                        <label>
                            05.ලිපිනය:
                            <input type="text" placeholder="Enter Address" />
                        </label>
                    </div>

                    <label>06.දුරකථන අංකය:</label>
                    <input type="tel" name="phone" placeholder="Enter Mobile No:" required />

                    <label>07.ඊමේල් ලිපිනය:</label>
                    <input type="email" name="email" placeholder="Enter Eamil " required />

                    <label>08.සාමාජිකයින් ගණන:</label>
                    <input type="number" name="memberCount" required />


                    <label>10.තනතුරු තොරතුරු ඇතුලත් කිරීම</label>
                    <div className="btn-container">
                        <Link to="/chairman"><button>සභාපති</button></Link>
                        <Link to="/secretary"><button>ලේකම්</button></Link>
                        <Link to="/treasurer"><button>භාණ්ඩාගාරික</button></Link>
                    </div>
                    <button type="submit">ලියාපදිංචි වන්න</button>

                </form>
            </div>
        </div>
    );
};

export default Register;
