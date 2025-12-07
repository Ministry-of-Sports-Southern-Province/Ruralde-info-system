import React, { useState } from "react";
import "../society/society.css";

export default function Society() {
  const [formData, setFormData] = useState({
    borrowerName: "",
    loanAmount: "",
    projectType: "",
    loanPurpose: "",
    memberDeposit: "",
    previousLoan: "",
    previousLoanStatus: "",
    usageDetails: [{ purpose: "", qty: "", unitPrice: "", total: "" }],
    deficitFunding: "",
    incomeDetails: [{ product: "", qty: "", unitPrice: "", income: "" }],
    monthlyProfit: "",
    repaymentMonths: "",
    recommendLoan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUsageChange = (index, field, value) => {
    const newUsage = [...formData.usageDetails];
    newUsage[index][field] = value;
    setFormData((prev) => ({ ...prev, usageDetails: newUsage }));
  };

  const handleIncomeChange = (index, field, value) => {
    const newIncome = [...formData.incomeDetails];
    newIncome[index][field] = value;
    setFormData((prev) => ({ ...prev, incomeDetails: newIncome }));
  };

  const addUsageRow = () => {
    setFormData((prev) => ({
      ...prev,
      usageDetails: [
        ...prev.usageDetails,
        { purpose: "", qty: "", unitPrice: "", total: "" },
      ],
    }));
  };

  const addIncomeRow = () => {
    setFormData((prev) => ({
      ...prev,
      incomeDetails: [
        ...prev.incomeDetails,
        { product: "", qty: "", unitPrice: "", income: "" },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("ණය වාර්තාව යොමු කරන ලදි!");
  };

  return (
    <section className="society-wrapper">
      <div className="society-container">
        <div className="develop-header">
          <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
          <h3>MS-SP/RD/FO/06</h3>
        </div>

        <h2 className="society-title">සමිති ගිණුම - ණය යෙදවුම් වාර්තාව</h2>
        <p className="society-intro">
          මෙම පත්‍රය <strong>සමිතියෙන් ලබාදෙන ණය</strong> වාර්තා කිරීම සඳහායි.
          ණය යොදවීමේ විස්තර, ආදායම් ගණනය සහ ග්‍රාම සංවර්ධන නිලධාරී නිර්දේශ
          නිවැරදිව සටහන් කරන්න.
        </p>

        <form className="society-form" onSubmit={handleSubmit}>
          {/* 1–3 basic info */}
          <div className="form-group">
            <label>1. ණය ඉල්ලුම්කරුගේ නම :</label>
            <input
              type="text"
              name="borrowerName"
              value={formData.borrowerName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>2. ඉල්ලුම් කරන ණය මුදල (රු.) :</label>
            <input
              type="text"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>3. ව්‍යාපෘතිය / කර්මාන්තය :</label>
            <input
              type="text"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              placeholder="e.g. කුඩා කෘෂිකාර්මික ව්‍යාපෘතිය, වෙළෙඳසැල"
            />
          </div>

          {/* 4. Loan purpose */}
          <div className="form-group">
            <label>
              4. ණය අවශ්‍යතාවය :{" "}
              <small>
                (වගා කටයුතු නම් අදාල භූමි ප්‍රමාණය / කාලය දැක්විය යුතුය)
              </small>
            </label>
            <textarea
              name="loanPurpose"
              value={formData.loanPurpose}
              onChange={handleChange}
            />
          </div>

          {/* 5. Member deposit */}
          <div className="form-group">
            <label>5. ගැමිසෙත වැඩසටහන යටතේ සාමාජික තැන්පත් මුදල (රු.) :</label>
            <input
              type="text"
              name="memberDeposit"
              value={formData.memberDeposit}
              onChange={handleChange}
            />
          </div>

          {/* 6. Previous loan */}
          <div className="form-row">
            <div className="form-group">
              <label>6. මීට පෙර ලබා ගත් ණය මුදල (රු.) :</label>
              <input
                type="text"
                name="previousLoan"
                value={formData.previousLoan}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>ණය ගෙවා අවසන්ද?</label>
              <select
                name="previousLoanStatus"
                value={formData.previousLoanStatus}
                onChange={handleChange}
              >
                <option value="">තෝරන්න</option>
                <option value="yes">ඔව්</option>
                <option value="no">නැහැ</option>
              </select>
            </div>
          </div>

          {/* 7. Loan usage */}
          <div className="section-block">
            <label>
              7. ණය යෙදවුම් හා ආදායම් විස්තරය:{" "}
              <small>(කොපමණ කාලයකටද සඳහන් කරන්න – මාස / අවුරුදු)</small>
            </label>
            <div className="society-table-wrapper">
              <table className="society-table">
                <thead>
                  <tr>
                    <th>ණය යොදවන කාරණය</th>
                    <th>ප්‍රමාණය (ඒකක)</th>
                    <th>එක් ඒකකයක මිල (රු.)</th>
                    <th>වැයවන මුදල (රු.)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.usageDetails.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="text"
                          value={row.purpose}
                          onChange={(e) =>
                            handleUsageChange(i, "purpose", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.qty}
                          onChange={(e) =>
                            handleUsageChange(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleUsageChange(i, "unitPrice", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.total}
                          onChange={(e) =>
                            handleUsageChange(i, "total", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="add-row-btn"
              onClick={addUsageRow}
            >
              ➕ Add Row
            </button>
          </div>

          {/* 8. Deficit funding */}
          <div className="form-group">
            <label>8. හිඟ මුදල පියවා ගන්නා ආකාරය :</label>
            <textarea
              name="deficitFunding"
              value={formData.deficitFunding}
              onChange={handleChange}
            />
          </div>

          {/* 9. Income details */}
          <div className="section-block">
            <label>9. ආදායම් විස්තරය : (මාසයක් සඳහා)</label>
            <div className="society-table-wrapper">
              <table className="society-table">
                <thead>
                  <tr>
                    <th>නිෂ්පාදනය</th>
                    <th>ප්‍රමාණය</th>
                    <th>එක් ඒකකයක මිල (රු.)</th>
                    <th>ආදායම (රු.)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.incomeDetails.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="text"
                          value={row.product}
                          onChange={(e) =>
                            handleIncomeChange(i, "product", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.qty}
                          onChange={(e) =>
                            handleIncomeChange(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleIncomeChange(i, "unitPrice", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.income}
                          onChange={(e) =>
                            handleIncomeChange(i, "income", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="add-row-btn"
              onClick={addIncomeRow}
            >
              ➕ Add Row
            </button>
          </div>

          {/* 10. Profit & repayment */}
          <div className="form-group">
            <label>
              10. මාසික ලාභය :
              <input
                type="text"
                name="monthlyProfit"
                value={formData.monthlyProfit}
                onChange={handleChange}
                placeholder="(මාසික ආදායම - මාසික වියදම්)"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              11. මෙම ණය මුදල සමාන මාසික වාරික{" "}
              <input
                type="text"
                name="repaymentMonths"
                value={formData.repaymentMonths}
                onChange={handleChange}
                placeholder="වාரික ගණන"
              />{" "}
              ගෙවීමට එකඟ වෙමි.
            </label>
          </div>

          {/* Signatures */}
          <div className="signature-section">
            <div className="signature-field">
              <div className="signature-line" />
              <div>ණයලාභියාගේ අත්සන</div>
            </div>
          </div>

          <h4 className="section-heading">
            ග්‍රාම සංවර්ධන නිලධාරී නිර්දේශය :
          </h4>
          <p className="section-text">
            ණය යෙදවුම් වාර්තාව පරීක්ෂා කලෙමි. මෙහි සඳහන් තොරතුරු ණයලාභියා
            හා සාකච්ඡා කර නිවැරදි කලෙමි.
          </p>

          <div className="form-group">
            <label>12. නිර්දේශ කරන ණය මුදල (රු.) :</label>
            <input
              type="text"
              name="recommendLoan"
              value={formData.recommendLoan}
              onChange={handleChange}
            />
          </div>

          <div className="signature-section">
            <div className="signature-field">
              <div className="signature-line" />
              <div>ග්‍රාම සංවර්ධන නිලධාරී අත්සන</div>
            </div>
          </div>

          <div className="submit-btn-container">
            <button type="submit" className="submit-btn">
              යොමු කරන්න
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}