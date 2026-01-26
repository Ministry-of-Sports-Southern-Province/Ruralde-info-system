import React, { useEffect, useState } from "react";
import "./societyChairman.css"; // reuse same styles
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const positionLabels = {
  society_secretary: "ලේකම් / Society Secretary",
  society_chairman: "සභාපති / Society Chairman",
  society_treasurer: "භාණ්ඩාගාරික / Society Treasurer",
  society_officer: "Society Officer",
};

const SocietySecretary = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const [scholarshipApps, setScholarshipApps] = useState([]);
  const [loanApps, setLoanApps] = useState([]);
  const [fundApps, setFundApps] = useState([]);

  const [loadingApps, setLoadingApps] = useState(false);

  const [historyApps, setHistoryApps] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const [selectedHistoryApp, setSelectedHistoryApp] = useState(null);

  const [activeTab, setActiveTab] = useState("scholarship");
  const [profileTab, setProfileTab] = useState("profile");

  // ---------- LOAD SECRETARY HISTORY ----------
  const loadHistory = async (regNo) => {
    if (!regNo) return;

    try {
      const collections = [
        { name: "scholarshipApplications", type: "scholarship" },
        { name: "loanApplications", type: "loan" },
        { name: "fundReleaseApplications", type: "fund" },
      ];

      let historyList = [];

      for (const c of collections) {
        const colRef = collection(db, c.name);
        const snap = await getDocs(colRef);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: c.type,
        }));

        // only society's applications that secretary has approved or declined
        const filtered = data
          .filter(
            (app) =>
              app.societyContext?.registerNo === regNo &&
              typeof app.status === "string" &&
              (app.status.startsWith("ApprovedBy_society_secretary") ||
                app.status.startsWith("DeclinedBy_society_secretary"))
          )
          .map((app) => ({
            ...app,
            status: app.status.startsWith("ApprovedBy_")
              ? "Approved"
              : "Rejected",
            createdAt:
              app.createdAt && app.createdAt.toDate
                ? app.createdAt.toDate().toLocaleString()
                : "",
          }));

        historyList = historyList.concat(filtered);
      }

      // latest action first
      historyList.sort(
        (a, b) =>
          (b.lastActionAt?.seconds || 0) - (a.lastActionAt?.seconds || 0)
      );

      setHistoryApps(historyList);
    } catch (err) {
      console.error("Error loading secretary history:", err);
    }
  };

  // ---------- LOAD USER + PENDING APPS ----------
  useEffect(() => {
    const fetchUserAndApps = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingProfile(false);
        return;
      }

      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("User not found.");
          setLoadingProfile(false);
          return;
        }

        const u = snap.data();
        setUser(u);
        setLoadingProfile(false);

        const regNo = u.societyRegisterNo || null;
        const role = "society_secretary"; // this profile is for secretary

        setLoadingApps(true);

        if (!regNo) {
          setScholarshipApps([]);
          setLoanApps([]);
          setFundApps([]);
          setHistoryApps([]);
          setLoadingApps(false);
          return;
        }

        // ---------- SCHOLARSHIP PENDING FOR SECRETARY ----------
        const schRef = collection(db, "scholarshipApplications");
        const schSnap = await getDocs(schRef);
        const schListRaw = schSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const schList = schListRaw
          .filter((app) => app.societyContext?.registerNo === regNo)
          .filter((app) => app.currentRole === role) // ONLY those forwarded to secretary
          .map((data) => ({
            id: data.id,
            type: "scholarship",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        // ---------- LOAN PENDING FOR SECRETARY ----------
        const loanRef = collection(db, "loanApplications");
        const loanSnap = await getDocs(loanRef);
        const loanListRaw = loanSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const loanList = loanListRaw
          .filter((app) => app.societyContext?.registerNo === regNo)
          .filter((app) => app.currentRole === role)
          .map((data) => ({
            id: data.id,
            type: "loan",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        // ---------- FUND PENDING FOR SECRETARY ----------
        const fundRef = collection(db, "fundReleaseApplications");
        const fundSnap = await getDocs(fundRef);
        const fundListRaw = fundSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const fundList = fundListRaw
          .filter((app) => app.societyContext?.registerNo === regNo)
          .filter((app) => app.currentRole === role)
          .map((data) => ({
            id: data.id,
            type: "fund",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        setScholarshipApps(schList);
        setLoanApps(loanList);
        setFundApps(fundList);

        // load secretary history
        await loadHistory(regNo);
      } catch (err) {
        console.error("Error loading secretary or applications:", err);
        setError("Failed to load profile or applications.");
      } finally {
        setLoadingApps(false);
      }
    };

    fetchUserAndApps();
  }, []);

  // ---------- AUTH ----------
  const handleSignOut = () => {
    const ok = window.confirm("Do you really want to sign out?");
    if (!ok) return;
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // ---------- ACTIONS ----------
  // Approve at secretary -> forward to treasurer
  const handleAccept = async (collectionName, appId) => {
    if (!user) return;
    setActionError("");
    setActionSuccess("");

    try {
      const ref = doc(db, collectionName, appId);
      await updateDoc(ref, {
        status: "ApprovedBy_society_secretary",
        currentRole: "society_treasurer", // VERY IMPORTANT for treasurer profile
        lastActionBy: user.username || user.email || "SocietySecretary",
        lastActionAt: new Date(),
      });

      if (collectionName === "scholarshipApplications") {
        setScholarshipApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "loanApplications") {
        setLoanApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "fundReleaseApplications") {
        setFundApps((prev) => prev.filter((a) => a.id !== appId));
      }

      if (user.societyRegisterNo) {
        await loadHistory(user.societyRegisterNo);
      }

      setSelectedApp(null);
      setSelectedType(null);
      setActionSuccess(
        "අයදුම්පත ලේකම් විසින් අනුමෝදනය කර භාණ්ඩාගාරික (Treasurer) වෙත යොමු කරන ලදී."
      );
    } catch (err) {
      console.error("Error secretary approving application:", err);
      setActionError("අනුමෝදනය කිරීමේදී දෝෂයක් සිදු විය.");
    }
  };

  const handleDecline = async (collectionName, appId) => {
    if (!user) return;
    setActionError("");
    setActionSuccess("");

    try {
      const ref = doc(db, collectionName, appId);
      await updateDoc(ref, {
        status: "DeclinedBy_society_secretary",
        lastActionBy: user.username || user.email || "SocietySecretary",
        lastActionAt: new Date(),
      });

      if (collectionName === "scholarshipApplications") {
        setScholarshipApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "loanApplications") {
        setLoanApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "fundReleaseApplications") {
        setFundApps((prev) => prev.filter((a) => a.id !== appId));
      }

      if (user.societyRegisterNo) {
        await loadHistory(user.societyRegisterNo);
      }

      setSelectedApp(null);
      setSelectedType(null);
      setActionSuccess("අයදුම්පත ලේකම් මට්ටමින් අවලංගු කරන ලදී.");
    } catch (err) {
      console.error("Error secretary declining application:", err);
      setActionError("අවලංගු කිරීමේදී දෝෂයක් සිදු විය.");
    }
  };

  // ---------- UI HELPERS ----------
  const openDetails = (app, type) => {
    setSelectedApp(app);
    setSelectedType(type);
    setSelectedHistoryApp(null);
    setActionError("");
    setActionSuccess("");
  };

  const closeDetails = () => {
    setSelectedApp(null);
    setSelectedType(null);
  };

  const openHistoryDetails = (app) => {
    setSelectedHistoryApp(app);
    setSelectedApp(null);
    setSelectedType(null);
  };

  const closeHistoryDetails = () => {
    setSelectedHistoryApp(null);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSelectedApp(null);
    setSelectedType(null);
    setSelectedHistoryApp(null);
    setActionError("");
    setActionSuccess("");
  };

  const label = positionLabels[user?.position] || "Society Secretary";
  const created =
    user?.createdAt && user.createdAt.toDate
      ? user.createdAt.toDate().toLocaleDateString()
      : "";

  const totalPending =
    scholarshipApps.length + loanApps.length + fundApps.length;
  const totalHistory = historyApps.length;
  const approvedCount = historyApps.filter(
    (l) => l.status === "Approved"
  ).length;

  if (loadingProfile)
    return <p className="society-loading">Loading profile...</p>;
  if (error) return <p className="society-error">{error}</p>;
  if (!user) return null;

  const renderResultsTable = (title, results) => {
    if (!results || !Array.isArray(results) || results.length === 0) return null;
    const nonEmpty = results.filter(
      (r) => (r.subject || "").trim() || (r.grade || "").trim()
    );
    if (nonEmpty.length === 0) return null;

    return (
      <div className="detail-subsection">
        <h5 className="detail-subtitle">{title}</h5>
        <div className="detail-results-table-wrapper">
          <table className="detail-results-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>අ/අ</th>
                <th>විෂය</th>
                <th style={{ width: "20%" }}>සාමාර්ථය</th>
              </tr>
            </thead>
            <tbody>
              {nonEmpty.map((r, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{r.subject}</td>
                  <td>{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ---------- PENDING TABS (same as your code, but using currentRole filter above) ----------
  const renderScholarshipTab = () => (
    <>
      <section className="society-card">
        <h4 className="card-title">Pending Scholarship Applications</h4>
        {loadingApps ? (
          <p className="muted-text">අයදුම්පත් රදිමින්...</p>
        ) : scholarshipApps.length === 0 ? (
          <p className="muted-text">
            දැනට ලේකම් මට්ටමට යොමු වූ ශිෂ්‍යත්ව අයදුම්පත් නොමැත.
          </p>
        ) : (
          <ul className="letter-list">
            {scholarshipApps.map((app) => (
              <li
                key={app.id}
                className="letter-item letter-item--clickable"
                onClick={() => openDetails(app, "scholarship")}
              >
                <div>
                  <p className="letter-type">
                    <strong>{app.fullName}</strong> – O/L {app.examYear}
                  </p>
                  <p className="letter-sub">
                    Address: {app.address?.slice(0, 80)}...
                  </p>
                  {app.createdAt && (
                    <p className="letter-sub">Submitted: {app.createdAt}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedApp && selectedType === "scholarship" && (
        <section className="society-card detail-card">
          <div className="detail-header">
            <div>
              <h4 className="card-title">
                Scholarship – Secretary Review Details
              </h4>
              {selectedApp.createdAt && (
                <p className="detail-meta">
                  Submitted: {selectedApp.createdAt}
                </p>
              )}
            </div>
            <button className="btn-close" onClick={closeDetails}>
              ×
            </button>
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              <div>
                <h5 className="detail-subtitle">Applicant Info</h5>
                <p>
                  <strong>Name:</strong> {selectedApp.fullName}
                </p>
                <p>
                  <strong>Address:</strong> {selectedApp.address}
                </p>
                <p>
                  <strong>School:</strong> {selectedApp.firstSchool}
                </p>
                <p>
                  <strong>Exam Year:</strong> {selectedApp.examYear}
                </p>
              </div>
              <div>
                <h5 className="detail-subtitle">Financial Info</h5>
                <p>
                  <strong>Monthly Amount:</strong>{" "}
                  {selectedApp.monthlyAmount || "N/A"} රු.
                </p>
                <p>
                  <strong>Village Officer Cert:</strong>{" "}
                  {selectedApp.villageOfficerCert}
                </p>
              </div>
            </div>

            <div className="detail-subsection">
              <h5 className="detail-subtitle">
                විභාග පාසලේ විදුහල්පති නිර්දේශය
              </h5>
              <p>{selectedApp.principalCert}</p>
            </div>

            <div className="detail-subsection">
              <h5 className="detail-subtitle">
                වර්තමාන උසස් පෙළ පාසලේ විදුහල්පතිගේ සහතිකය
              </h5>
              <p>{selectedApp.currentSchoolCert}</p>
            </div>

            {renderResultsTable(
              "ප්‍රථම වරට විභාග ප්‍රතිඵල",
              selectedApp.resultsFirstAttempt
            )}
            {renderResultsTable(
              "දෙවන වරට විභාග ප්‍රතිඵල",
              selectedApp.resultsSecondAttempt
            )}
          </div>

          {actionError && (
            <p className="society-error" style={{ marginTop: 8 }}>
              {actionError}
            </p>
          )}
          {actionSuccess && (
            <p className="society-success" style={{ marginTop: 8 }}>
              {actionSuccess}
            </p>
          )}

          <div className="detail-actions">
            <button
              className="btn-decline"
              onClick={() =>
                handleDecline("scholarshipApplications", selectedApp.id)
              }
            >
              අවලංගු කරන්න
            </button>
            <button
              className="btn-approve"
              onClick={() =>
                handleAccept("scholarshipApplications", selectedApp.id)
              }
            >
              අනුමෝදනය කර භාණ්ඩාගාරික වෙත යොමු කරන්න
            </button>
          </div>
        </section>
      )}
    </>
  );

  const renderLoanTab = () => (
    <>
      <section className="society-card">
        <h4 className="card-title">Pending Loan Applications</h4>
        {loadingApps ? (
          <p className="muted-text">අයදුම්පත් රදිමින්...</p>
        ) : loanApps.length === 0 ? (
          <p className="muted-text">
            දැනට ලේකම් මට්ටමට යොමු වූ ණය අයදුම්පත් නොමැත.
          </p>
        ) : (
          <ul className="letter-list">
            {loanApps.map((app) => (
              <li
                key={app.id}
                className="letter-item letter-item--clickable"
                onClick={() => openDetails(app, "loan")}
              >
                <div>
                  <p className="letter-type">
                    <strong>{app.borrowerName}</strong> – Loan:{" "}
                    {app.loanAmount} රු.
                  </p>
                  <p className="letter-sub">
                    Project: {app.projectType || "N/A"}
                  </p>
                  {app.createdAt && (
                    <p className="letter-sub">Submitted: {app.createdAt}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedApp && selectedType === "loan" && (
        <section className="society-card detail-card">
          <div className="detail-header">
            <div>
              <h4 className="card-title">Loan – Secretary Review Details</h4>
              {selectedApp.createdAt && (
                <p className="detail-meta">
                  Submitted: {selectedApp.createdAt}
                </p>
              )}
            </div>
            <button className="btn-close" onClick={closeDetails}>
              ×
            </button>
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              <div>
                <p>
                  <strong>Borrower:</strong> {selectedApp.borrowerName}
                </p>
                <p>
                  <strong>Address:</strong> {selectedApp.address}
                </p>
              </div>
              <div>
                <p>
                  <strong>Loan Amount:</strong> {selectedApp.loanAmount} රු.
                </p>
                <p>
                  <strong>Project Type:</strong> {selectedApp.projectType}</p>
              </div>
            </div>
          </div>

          {actionError && (
            <p className="society-error" style={{ marginTop: 8 }}>
              {actionError}
            </p>
          )}
          {actionSuccess && (
            <p className="society-success" style={{ marginTop: 8 }}>
              {actionSuccess}
            </p>
          )}

          <div className="detail-actions">
            <button
              className="btn-decline"
              onClick={() =>
                handleDecline("loanApplications", selectedApp.id)
              }
            >
              අවලංගු කරන්න
            </button>
            <button
              className="btn-approve"
              onClick={() =>
                handleAccept("loanApplications", selectedApp.id)
              }
            >
              අනුමෝදනය කර භාණ්ඩාගාරික වෙත යොමු කරන්න
            </button>
          </div>
        </section>
      )}
    </>
  );

  const renderFundTab = () => (
    <>
      <section className="society-card">
        <h4 className="card-title">Pending Fund Release Applications</h4>
        {loadingApps ? (
          <p className="muted-text">අයදුම්පත් රදිමින්...</p>
        ) : fundApps.length === 0 ? (
          <p className="muted-text">
            දැනට ලේකම් මට්ටමට යොමු වූ මුදල් නිදහස් කිරීමේ අයදුම්පත් නොමැත.
          </p>
        ) : (
          <ul className="letter-list">
            {fundApps.map((app) => (
              <li
                key={app.id}
                className="letter-item letter-item--clickable"
                onClick={() => openDetails(app, "fund")}
              >
                <div>
                  <p className="letter-type">
                    <strong>{app.societyName || "Society"}</strong> – Request:{" "}
                    {app.requestedAmount || "N/A"} රු.
                  </p>
                  <p className="letter-sub">
                    District: {app.district} | Division: {app.divisionName}
                  </p>
                  {app.createdAt && (
                    <p className="letter-sub">Submitted: {app.createdAt}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedApp && selectedType === "fund" && (
        <section className="society-card detail-card">
          <div className="detail-header">
            <div>
              <h4 className="card-title">
                Fund Release – Secretary Review Details
              </h4>
              {selectedApp.createdAt && (
                <p className="detail-meta">
                  Submitted: {selectedApp.createdAt}
                </p>
              )}
            </div>
            <button className="btn-close" onClick={closeDetails}>
              ×
            </button>
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              <div>
                <p>
                  <strong>Society Name:</strong> {selectedApp.societyName}
                </p>
                <p>
                  <strong>District:</strong> {selectedApp.district}
                </p>
                <p>
                  <strong>Division:</strong> {selectedApp.divisionName}
                </p>
              </div>
              <div>
                <p>
                  <strong>Requested Amount:</strong>{" "}
                  {selectedApp.requestedAmount} රු.
                </p>
                <p>
                  <strong>Purpose:</strong> {selectedApp.purpose}</p>
              </div>
            </div>
          </div>

          {actionError && (
            <p className="society-error" style={{ marginTop: 8 }}>
              {actionError}
            </p>
          )}
          {actionSuccess && (
            <p className="society-success" style={{ marginTop: 8 }}>
              {actionSuccess}
            </p>
          )}

          <div className="detail-actions">
            <button
              className="btn-decline"
              onClick={() =>
                handleDecline("fundReleaseApplications", selectedApp.id)
              }
            >
              අවලංගු කරන්න
            </button>
            <button
              className="btn-approve"
              onClick={() =>
                handleAccept("fundReleaseApplications", selectedApp.id)
              }
            >
              අනුමෝදනය කර භාණ්ඩාගාරික වෙත යොමු කරන්න
            </button>
          </div>
        </section>
      )}
    </>
  );

  const renderHistoryTab = () => (
    <>
      <section className="society-card">
        <div className="history-header">
          <h4 className="card-title">Secretary – Action History</h4>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowHistory((prev) => !prev)}
          >
            {showHistory ? "Hide" : "Show"} History
          </button>
        </div>

        {showHistory && (
          <div className="history-content">
            {historyApps.length === 0 ? (
              <p className="muted-text">
                මෙතෙක් ලේකම් විසින් සලකා බැලූ අයදුම්පත් නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {historyApps.map((l) => (
                  <li
                    key={l.id}
                    className="letter-item letter-item--clickable"
                    onClick={() => openHistoryDetails(l)}
                  >
                    <div>
                      <p className="letter-type">
                        <strong>
                          {l.fullName || l.borrowerName || l.societyName}
                        </strong>{" "}
                        [{l.type}]
                      </p>
                      {l.createdAt && (
                        <p className="letter-sub">Submitted: {l.createdAt}</p>
                      )}
                    </div>
                    <span
                      className={`badge ${
                        l.status === "Approved"
                          ? "badge-success"
                          : l.status === "Rejected"
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {l.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {selectedHistoryApp && (
        <section className="society-card detail-card">
          <div className="detail-header">
            <div>
              <h4 className="card-title">
                History Details – {selectedHistoryApp.type}
              </h4>
            </div>
            <button className="btn-close" onClick={closeHistoryDetails}>
              ×
            </button>
          </div>
          <div className="detail-body">
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "13px" }}>
              {JSON.stringify(selectedHistoryApp, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </>
  );

  // ---------- MAIN LAYOUT ----------
  return (
    <section className="society-dashboard">
      <div className="society-shell">
        {/* LEFT SIDEBAR */}
        <aside className="society-sidebar">
          <div className="society-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development Society – Secretary Panel</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="profile-tabs-mobile">
            <button
              className={
                profileTab === "profile"
                  ? "profile-tab-btn profile-tab-btn--active"
                  : "profile-tab-btn"
              }
              onClick={() => setProfileTab("profile")}
            >
              Profile
            </button>
            <button
              className={
                profileTab === "society"
                  ? "profile-tab-btn profile-tab-btn--active"
                  : "profile-tab-btn"
              }
              onClick={() => setProfileTab("society")}
            >
              Society Info
            </button>
            <button
              className={
                profileTab === "stats"
                  ? "profile-tab-btn profile-tab-btn--active"
                  : "profile-tab-btn"
              }
              onClick={() => setProfileTab("stats")}
            >
              Stats
            </button>
          </div>

          {/* Profile card */}
          <div
            className={
              "society-profile-card profile-section" +
              (profileTab === "profile" ? " profile-section--visible" : "")
            }
          >
            <div className="society-avatar">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "S"}
              </div>
            </div>
            <h2 className="society-name">{user.username}</h2>
            <p className="society-role">{label}</p>

            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact</span>
              <span className="info-value">
                {user.contactnumber || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Identity No</span>
              <span className="info-value">
                {user.identitynumber || "N/A"}
              </span>
            </div>
            {created && (
              <div className="info-row">
                <span className="info-label">Registered On</span>
                <span className="info-value">{created}</span>
              </div>
            )}
          </div>

          {/* Society info */}
          <div
            className={
              "society-info-card profile-section" +
              (profileTab === "society" ? " profile-section--visible" : "")
            }
          >
            <h4 className="sidebar-section-title">Society Information</h4>
            <div className="info-row">
              <span className="info-label">District</span>
              <span className="info-value">{user.district || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Secretary Division</span>
              <span className="info-value">{user.division || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Society Name</span>
              <span className="info-value">{user.society || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Reg. No</span>
              <span className="info-value">
                {user.societyRegisterNo || "N/A"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div
            className={
              "sidebar-stats profile-section" +
              (profileTab === "stats" ? " profile-section--visible" : "")
            }
          >
            <div className="stat-card">
              <p className="stat-label">Pending Applications</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Approved (History)</p>
              <p className="stat-value">{approvedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN */}
        <main className="society-main">
          <div className="tabs-bar">
            <button
              className={
                activeTab === "scholarship"
                  ? "tab-btn tab-btn--active"
                  : "tab-btn"
              }
              onClick={() => changeTab("scholarship")}
            >
              ශිෂ්‍යත්ව
            </button>
            <button
              className={
                activeTab === "loan" ? "tab-btn tab-btn--active" : "tab-btn"
              }
              onClick={() => changeTab("loan")}
            >
              ණය
            </button>
            <button
              className={
                activeTab === "fund" ? "tab-btn tab-btn--active" : "tab-btn"
              }
              onClick={() => changeTab("fund")}
            >
              මුදල් නිදහස්
            </button>
            <button
              className={
                activeTab === "history"
                  ? "tab-btn tab-btn--active"
                  : "tab-btn"
              }
              onClick={() => changeTab("history")}
            >
              ඉතිහාසය
            </button>
          </div>

          {activeTab === "scholarship" && renderScholarshipTab()}
          {activeTab === "loan" && renderLoanTab()}
          {activeTab === "fund" && renderFundTab()}
          {activeTab === "history" && renderHistoryTab()}
        </main>
      </div>
    </section>
  );
};

export default SocietySecretary;