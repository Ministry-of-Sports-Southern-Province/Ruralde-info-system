import React, { useState } from "react";
import "../society/society.css"; // <-- make sure to create this file (style similar to rural.css)

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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUsageChange = (index, field, value) => {
    const newUsage = [...formData.usageDetails];
    newUsage[index][field] = value;
    setFormData({ ...formData, usageDetails: newUsage });
  };

  const handleIncomeChange = (index, field, value) => {
    const newIncome = [...formData.incomeDetails];
    newIncome[index][field] = value;
    setFormData({ ...formData, incomeDetails: newIncome });
  };

  const addUsageRow = () => {
    setFormData({
      ...formData,
      usageDetails: [
        ...formData.usageDetails,
        { purpose: "", qty: "", unitPrice: "", total: "" },
      ],
    });
  };

  const addIncomeRow = () => {
    setFormData({
      ...formData,
      incomeDetails: [
        ...formData.incomeDetails,
        { product: "", qty: "", unitPrice: "", income: "" },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("ණය වාර්තාව යොමු කරන ලදි!");
  };

  return (
    <div className="society-container">
      <div className="develop-header">
        <h3>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</h3>
        <h3>MS-SP/RD/FO/03</h3>
      </div>
      <h2 className="society-title">සමිති ගිණුම - ණය යෙදවුම් වාර්තාව</h2>

      <form className="society-form" onSubmit={handleSubmit}>
        <div>
          <label>1. ණය ඉල්ලුම්කරුගේ නම :</label>
          <input
            type="text"
            name="borrowerName"
            value={formData.borrowerName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>2. ඉල්ලුම් කරන ණය මුදල :</label>
          <input
            type="text"
            name="loanAmount"
            value={formData.loanAmount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>3. ව්‍යාපෘතිය / කර්මාන්තය :</label>
          <input
            type="text"
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>
            4. ණය අවශ්‍යතාවය :{" "}
            <small>(වගා කටයුතු නම් අදාල භූමි ප්‍රමාණය සඳහන් කරන්න.)</small>
          </label>
          <textarea
            name="loanPurpose"
            value={formData.loanPurpose}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>5. ගැමිසෙත වැඩසටහන යටතේ සාමාජික තැන්පත් මුදල :</label>
          <input
            type="text"
            name="memberDeposit"
            value={formData.memberDeposit}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>6. මීට පෙර ලබා ගත් ණය මුදල :</label>
          <input
            type="text"
            name="previousLoan"
            value={formData.previousLoan}
            onChange={handleChange}
          />
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

        <div>
          <label>
            7. ණය යෙදවුම් හා ආදායම් විස්තරය:{" "}
            <small>(කොපමණ කාලයකටද සඳහන් කරන්න – මාස / අවුරුදු)</small>
          </label>
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
          <button type="button" className="add-row-btn" onClick={addUsageRow}>
            ➕ Add Row
          </button>
        </div>

        <div>
          <label>8. හිඟ මුදල පියවා ගන්නා ආකාරය :</label>
          <textarea
            name="deficitFunding"
            value={formData.deficitFunding}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>9. ආදායම් විස්තරය : (මාසයක් සඳහා)</label>
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
          <button type="button" className="add-row-btn" onClick={addIncomeRow}>
            ➕ Add Row
          </button>
        </div>

        <div>
          <label>
            මාසික ලාභය :{" "}
            <input
              type="text"
              name="monthlyProfit"
              value={formData.monthlyProfit}
              onChange={handleChange}
              placeholder="(මාසික ආදායම - මාසික වියදම)"
            />
          </label>
        </div>

        <div>
          <label>
            මෙම ණය මුදල සමාන මාසික වාරික{" "}
            <input
              type="text"
              name="repaymentMonths"
              value={formData.repaymentMonths}
              onChange={handleChange}
              placeholder="වාරික ගණන"
            />{" "}
            ගෙවීමට එකඟ වෙමි.
          </label>
        </div>

        <div className="signature-section">
          <div className="signature-field">
            <div className="signature-line"></div>
            <div>ණයලාභියාගේ අත්සන</div>
          </div>
        </div>

        <h4>ග්‍රාම සංවර්ධන නිලධාරී නිර්දේශය :</h4>
        <p>
          ණය යෙදවුම් වාර්තාව පරීක්ෂා කලෙමි. මෙහි සඳහන් තොරතුරු ණයලාභියා
          හා සාකච්ඡා කර නිවැරදි කලෙමි.
        </p>

        <div>
          <label>නිර්දේශ කරන ණය මුදල :</label>
          <input type="text" name="recommendLoan" onChange={handleChange} />
        </div>

        <div className="signature-section">
          <div className="signature-field">
            <div className="signature-line"></div>
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
  );
}
