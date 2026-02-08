import React, { useEffect, useState } from "react";
import "./societyChairman.css";
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
  society_chairman: "සභාපති / Society Chairman",
};

const SocietyChairman = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const [pendingScholarshipApps, setPendingScholarshipApps] = useState([]);
  const [allScholarshipApps, setAllScholarshipApps] = useState([]);

  const [loadingApps, setLoadingApps] = useState(false);

  const [historyApps, setHistoryApps] = useState([]);
  const [showHistoryList, setShowHistoryList] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedHistoryApp, setSelectedHistoryApp] = useState(null);

  const [activeTab, setActiveTab] = useState("pending");

  // ---------- LOAD HISTORY FROM FIRESTORE ----------
  const loadHistory = async (regNo) => {
    if (!regNo) return;

    try {
      const collections = [
        { name: "scholarshipApplications", type: "scholarship" },
        { name: "loanApplications", type: "loan" },
        { name: "fundReleaseApplications", type: "fund" },
      ];

      let list = [];

      for (const c of collections) {
        const colRef = collection(db, c.name);
        const snap = await getDocs(colRef);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          type: c.type,
        }));

        const filtered = data
          .filter(
            (app) =>
              app.societyContext?.registerNo === regNo &&
              typeof app.status === "string" &&
              (app.status.startsWith("ApprovedBy_society_chairman") ||
                app.status.startsWith("DeclinedBy_society_chairman"))
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

        list = list.concat(filtered);
      }

      list.sort(
        (a, b) =>
          (b.lastActionAt?.seconds || 0) - (a.lastActionAt?.seconds || 0)
      );

      setHistoryApps(list);
    } catch (err) {
      console.error("Error loading chairman history:", err);
    }
  };

  // ---------- LOAD USER + APPLICATIONS ----------
  useEffect(() => {
    const fetchUserAndApps = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingProfile(false);
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setError("User not found.");
          setLoadingProfile(false);
          return;
        }

        const u = userSnap.data();
        setUser(u);
        setLoadingProfile(false);

        const regNo = u.societyRegisterNo || null;
        const role = "society_chairman";
        setLoadingApps(true);

        if (!regNo) {
          setPendingScholarshipApps([]);
          setAllScholarshipApps([]);
          setHistoryApps([]);
          setLoadingApps(false);
          return;
        }

        // Load all scholarship apps for this society
        const schRef = collection(db, "scholarshipApplications");
        const schSnap = await getDocs(schRef);
        const schRaw = schSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        let allSchList = schRaw
          .filter((app) => app.societyContext?.registerNo === regNo)
          .map((data) => ({
            id: data.id,
            type: "scholarship",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
            _createdAtMs:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().getTime()
                : 0,
          }));

        // Sort newest first
        allSchList.sort((a, b) => b._createdAtMs - a._createdAtMs);

        const pendingList = allSchList.filter(
          (app) => app.currentRole === role
        );

        setAllScholarshipApps(allSchList);
        setPendingScholarshipApps(pendingList);

        await loadHistory(regNo);
      } catch (err) {
        console.error("Error loading chairman or applications:", err);
        setError("Failed to load profile or applications.");
      } finally {
        setLoadingApps(false);
      }
    };

    fetchUserAndApps();
  }, []);

  // ---------- AUTH ----------
  const handleSignOut = () => {
    if (!window.confirm("Do you really want to sign out?")) return;
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // ---------- HELPERS: ADD TO HISTORY LOCALLY ----------
  const addToHistoryFromAction = (app, finalStatus) => {
    if (!user || !user.societyRegisterNo) return;

    const createdAtString =
      app.createdAt && app.createdAt.toLocaleString
        ? app.createdAt.toLocaleString()
        : typeof app.createdAt === "string"
        ? app.createdAt
        : "";

    const historyEntry = {
      ...app,
      id: app.id,
      type: "scholarship",
      status: finalStatus, // "Approved" or "Rejected"
      createdAt: createdAtString,
      lastActionAt: { seconds: Math.floor(Date.now() / 1000) },
    };

    setHistoryApps((prev) => {
      const next = [historyEntry, ...prev];
      next.sort(
        (a, b) =>
          (b.lastActionAt?.seconds || 0) - (a.lastActionAt?.seconds || 0)
      );
      return next;
    });
  };

  // ---------- ACTIONS ----------
  const handleAccept = async (collectionName, appId) => {
    if (!user) return;
    setActionError("");
    setActionSuccess("");

    try {
      const now = new Date();
      const ref = doc(db, collectionName, appId);

      await updateDoc(ref, {
        status: "ApprovedBy_society_chairman",
        currentRole: "society_secretary",
        lastActionBy: user.username || user.email || "SocietyChairman",
        lastActionAt: now,
      });

      // Remove from pending
      setPendingScholarshipApps((prev) => prev.filter((a) => a.id !== appId));

      // Update in all list and keep updated app to add to history
      let updatedAppForHistory = null;
      setAllScholarshipApps((prev) =>
        prev.map((a) => {
          if (a.id === appId) {
            const updated = {
              ...a,
              status: "ApprovedBy_society_chairman",
              currentRole: "society_secretary",
              lastActionAt: { seconds: Math.floor(now.getTime() / 1000) },
            };
            updatedAppForHistory = updated;
            return updated;
          }
          return a;
        })
      );

      // Update selected app in detail panel
      setSelectedApp((prev) =>
        prev && prev.id === appId
          ? {
              ...prev,
              status: "ApprovedBy_society_chairman",
              currentRole: "society_secretary",
              lastActionAt: { seconds: Math.floor(now.getTime() / 1000) },
            }
          : prev
      );

      // Add to history tab
      if (updatedAppForHistory) {
        addToHistoryFromAction(updatedAppForHistory, "Approved");
      }

      setActionSuccess(
        "අයදුම්පත සභාපතිතුමා විසින් අනුමෝදනය කර ලේකම් (Secretary) වෙත යොමු කරන ලදී."
      );
    } catch (err) {
      console.error("Error chairman approving application:", err);
      setActionError("අනුමෝදනය කිරීමේදී දෝෂයක් සිදු විය.");
    }
  };

  const handleDecline = async (collectionName, appId) => {
    if (!user) return;
    setActionError("");
    setActionSuccess("");

    try {
      const now = new Date();
      const ref = doc(db, collectionName, appId);

      await updateDoc(ref, {
        status: "DeclinedBy_society_chairman",
        lastActionBy: user.username || user.email || "SocietyChairman",
        lastActionAt: now,
      });

      // Remove from pending
      setPendingScholarshipApps((prev) => prev.filter((a) => a.id !== appId));

      // Update in all list and keep updated app to add to history
      let updatedAppForHistory = null;
      setAllScholarshipApps((prev) =>
        prev.map((a) => {
          if (a.id === appId) {
            const updated = {
              ...a,
              status: "DeclinedBy_society_chairman",
              lastActionAt: { seconds: Math.floor(now.getTime() / 1000) },
            };
            updatedAppForHistory = updated;
            return updated;
          }
          return a;
        })
      );

      // Update selected app
      setSelectedApp((prev) =>
        prev && prev.id === appId
          ? {
              ...prev,
              status: "DeclinedBy_society_chairman",
              lastActionAt: { seconds: Math.floor(now.getTime() / 1000) },
            }
          : prev
      );

      // Add to history tab
      if (updatedAppForHistory) {
        addToHistoryFromAction(updatedAppForHistory, "Rejected");
      }

      setActionSuccess("අයදුම්පත සභාපති මට්ටමින් අවලංගු කරන ලදී.");
    } catch (err) {
      console.error("Error chairman declining application:", err);
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
    setActionError("");
    setActionSuccess("");
  };

  const openHistoryDetails = (app) => {
    setSelectedHistoryApp(app);
    setSelectedApp(null);
    setSelectedType(null);
    setActionError("");
    setActionSuccess("");
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

  // ---------- Derived values ----------
  if (loadingProfile)
    return <p className="society-loading">Loading profile...</p>;
  if (error) return <p className="society-error">{error}</p>;
  if (!user) return null;

  const label = positionLabels[user.position] || "Society Chairman";
  const created =
    user.createdAt && user.createdAt.toDate
      ? user.createdAt.toDate().toLocaleDateString()
      : "";

  const totalPending = pendingScholarshipApps.length;

  const canActOnSelected =
    selectedType === "scholarship" && !!selectedApp;

  // ---------- Tab renders ----------

  const renderPendingScholarshipTab = () => (
    <section className="society-card">
      <h4 className="card-title">Pending Scholarship Applications</h4>
      {loadingApps ? (
        <p className="muted-text">අයදුම්පත් රදිමින්...</p>
      ) : pendingScholarshipApps.length === 0 ? (
        <p className="muted-text">
          දැනට සභාපති මට්ටමට යොමු වූ ශිෂ්‍යත්ව අයදුම්පත් නොමැත.
        </p>
      ) : (
        <ul className="letter-list">
          {pendingScholarshipApps.map((app) => (
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
  );

  const renderAllScholarshipTab = () => (
    <section className="society-card">
      <h4 className="card-title">All Scholarship Applications (This Society)</h4>
      {loadingApps ? (
        <p className="muted-text">අයදුම්පත් රදිමින්...</p>
      ) : allScholarshipApps.length === 0 ? (
        <p className="muted-text">
          මෙම සමිතියට ශිෂ්‍යත්ව අයදුම්පත් තවම සුරක්ෂිත කර නොමැත.
        </p>
      ) : (
        <ul className="letter-list">
          {allScholarshipApps.map((app) => (
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
                <p className="letter-sub">
                  Stage: {app.currentRole || "N/A"} | Status:{" "}
                  {app.status || "N/A"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const renderHistoryTab = () => (
    <>
      <section className="society-card">
        <div className="history-header">
          <h4 className="card-title">Chairman Action History</h4>
          <button
            type="button"
            className="toggle-btn"
            onClick={() => setShowHistoryList((prev) => !prev)}
          >
            {showHistoryList ? "Hide" : "Show"} History
          </button>
        </div>

        {showHistoryList && (
          <div className="history-content">
            {historyApps.length === 0 ? (
              <p className="muted-text">
                මෙතෙක් සභාපතිතුමා විසින් සලකා බැලූ අයදුම්පත් නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {historyApps.map((app) => (
                  <li
                    key={app.id}
                    className="letter-item letter-item--clickable"
                    onClick={() => openHistoryDetails(app)}
                  >
                    <div>
                      <p className="letter-type">
                        <strong>
                          {app.fullName || app.borrowerName || app.societyName}
                        </strong>{" "}
                        [{app.type}]
                      </p>
                      {app.createdAt && (
                        <p className="letter-sub">Submitted: {app.createdAt}</p>
                      )}
                    </div>
                    <span
                      className={`badge ${
                        app.status === "Approved"
                          ? "badge-success"
                          : "badge-danger"
                      }`}
                    >
                      {app.status}
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
              {selectedHistoryApp.createdAt && (
                <p className="detail-meta">
                  Submitted: {selectedHistoryApp.createdAt}
                </p>
              )}
              {selectedHistoryApp.status && (
                <p className="detail-meta">
                  Status: {selectedHistoryApp.status}
                </p>
              )}
            </div>
            <button className="btn-close" onClick={closeHistoryDetails}>
              ×
            </button>
          </div>
          <div className="detail-body">
            {selectedHistoryApp.type === "scholarship" && (
              <>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedHistoryApp.fullName || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedHistoryApp.address || "N/A"}
                </p>
                <p>
                  <strong>Exam Year:</strong>{" "}
                  {selectedHistoryApp.examYear || "N/A"}
                </p>
                <p>
                  <strong>Monthly Amount:</strong>{" "}
                  {selectedHistoryApp.monthlyAmount || "N/A"} රු.
                </p>
                <p>
                  <strong>First School:</strong>{" "}
                  {selectedHistoryApp.firstSchool || "N/A"}
                </p>
                <p>
                  <strong>Village Officer Cert:</strong>{" "}
                  {selectedHistoryApp.villageOfficerCert || "N/A"}
                </p>
                <p>
                  <strong>Principal Recommendation:</strong>{" "}
                  {selectedHistoryApp.principalCert || "N/A"}
                </p>
                <p>
                  <strong>Current School Principal:</strong>{" "}
                  {selectedHistoryApp.currentSchoolCert || "N/A"}
                </p>
              </>
            )}

            {selectedHistoryApp.type === "loan" && (
              <>
                <p>
                  <strong>Borrower:</strong>{" "}
                  {selectedHistoryApp.borrowerName || "N/A"}
                </p>
                <p>
                  <strong>Loan Amount:</strong>{" "}
                  {selectedHistoryApp.loanAmount || "N/A"} රු.
                </p>
              </>
            )}

            {selectedHistoryApp.type === "fund" && (
              <>
                <p>
                  <strong>Society:</strong>{" "}
                  {selectedHistoryApp.societyName || "N/A"}
                </p>
                <p>
                  <strong>Requested Amount:</strong>{" "}
                    {selectedHistoryApp.requestedAmount || "N/A"} රු.
                </p>
              </>
            )}
          </div>
        </section>
      )}
    </>
  );

  const renderSelectedDetails = () => {
    if (!selectedApp || selectedType !== "scholarship") return null;
    const app = selectedApp;

    return (
      <section className="society-card detail-card">
        <div className="detail-header">
          <div>
            <h4 className="card-title">Scholarship – Full Details</h4>
            {app.createdAt && (
              <p className="detail-meta">Submitted: {app.createdAt}</p>
            )}
            {app.status && <p className="detail-meta">Status: {app.status}</p>}
            {app.currentRole && (
              <p className="detail-meta">Stage: {app.currentRole}</p>
            )}
          </div>
          <button className="btn-close" onClick={closeDetails}>
            ×
          </button>
        </div>

        <div className="detail-body">
          <p>
            <strong>Name:</strong> {app.fullName}
          </p>
          <p>
            <strong>Address:</strong> {app.address}
          </p>
          <p>
            <strong>Exam Year:</strong> {app.examYear}
          </p>
          <p>
            <strong>First School:</strong> {app.firstSchool}
          </p>
          <p>
            <strong>Monthly Amount:</strong> {app.monthlyAmount} රු.
          </p>
          <p>
            <strong>Village Officer Cert:</strong> {app.villageOfficerCert}
          </p>
          <p>
            <strong>Principal Recommendation:</strong> {app.principalCert}
          </p>
          <p>
            <strong>Current School Principal:</strong> {app.currentSchoolCert}
          </p>
        </div>

        {canActOnSelected && (
          <div className="detail-actions">
            <button
              className="btn-decline"
              onClick={() =>
                handleDecline("scholarshipApplications", app.id)
              }
            >
              අවලංගු කරන්න
            </button>
            <button
              className="btn-approve"
              onClick={() =>
                handleAccept("scholarshipApplications", app.id)
              }
            >
              අනුමෝදනය කර ලේකම් වෙත යොමු කරන්න
            </button>
          </div>
        )}

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
      </section>
    );
  };

  // ---------- MAIN RENDER ----------
  return (
    <section className="society-dashboard">
      <div className="society-shell">
        {/* LEFT SIDEBAR */}
        <aside className="society-sidebar">
          <div className="society-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development Society – Chairman Panel</span>
            </div>
          </div>

          <div className="society-profile-card">
            <div className="society-avatar">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "C"}
              </div>
            </div>
            <h2 className="society-name">{user.username}</h2>
            <p className="society-role">{label}</p>

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
            {created && (
              <div className="info-row">
                <span className="info-label">Registered On</span>
                <span className="info-value">{created}</span>
              </div>
            )}
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Pending Applications</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">All Scholarships</p>
              <p className="stat-value">{allScholarshipApps.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">History Records</p>
              <p className="stat-value">{historyApps.length}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <main className="society-main">
          <div className="tabs-bar">
            <button
              className={
                activeTab === "pending"
                  ? "tab-btn tab-btn--active"
                  : "tab-btn"
              }
              onClick={() => changeTab("pending")}
            >
              ඉදිරිපත් වූ ශිෂ්‍යත්ව (Pending)
            </button>
            <button
              className={
                activeTab === "all" ? "tab-btn tab-btn--active" : "tab-btn"
              }
              onClick={() => changeTab("all")}
            >
              සමාජයේ සියලු ශිෂ්‍යත්ව (All)
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

          {activeTab === "pending" && renderPendingScholarshipTab()}
          {activeTab === "all" && renderAllScholarshipTab()}
          {activeTab === "history" && renderHistoryTab()}

          {(activeTab === "pending" || activeTab === "all") &&
            renderSelectedDetails()}
        </main>
      </div>
    </section>
  );
};

export default SocietyChairman;