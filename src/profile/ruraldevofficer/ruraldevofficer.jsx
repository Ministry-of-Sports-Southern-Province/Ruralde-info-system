import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../ruraldevofficer/ruraldevofficer.css";
import { useNavigate } from "react-router-dom";

const Ruraldevofficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [historyDecisions, setHistoryDecisions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [societiesError, setSocietiesError] = useState("");

  const [selectedSociety, setSelectedSociety] = useState(null);
  const [referralNote, setReferralNote] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState("");
  const [referralError, setReferralError] = useState("");

  const [decidedSocietyIds, setDecidedSocietyIds] = useState([]);
  const [selectedAlreadyDecided, setSelectedAlreadyDecided] = useState(false);
  const [selectedDecidedStatus, setSelectedDecidedStatus] = useState("");

  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Tabs: pending | history | analytics
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const fetchUserAndData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingUser(false);
        return;
      }

      try {
        // 1) Fetch officer user profile
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("User not found.");
          setLoadingUser(false);
          return;
        }

        const userData = docSnap.data();
        setUser(userData);
        setLoadingUser(false);

        // 2) Fetch societies for this officer's district + division
        if (userData.district && userData.division) {
          setLoadingSocieties(true);
          setSocietiesError("");

          try {
            const societiesRef = collection(db, "societies");
            const qSoc = query(
              societiesRef,
              where("district", "==", userData.district),
              where("division", "==", userData.division)
            );

            const snap = await getDocs(qSoc);
            const list = [];
            snap.forEach((socDoc) => {
              list.push({ id: socDoc.id, ...socDoc.data() });
            });

            setSocieties(list);
          } catch (socErr) {
            console.error("Error fetching societies for officer:", socErr);
            setSocietiesError("Failed to load registered societies.");
          } finally {
            setLoadingSocieties(false);
          }
        }

        // 3) Load decision history from Firestore for this officer
        if (userData.identitynumber) {
          setLoadingHistory(true);
          try {
            const histRef = collection(db, "districtRequests");
            const qHist = query(
              histRef,
              where("referredByOfficerId", "==", userData.identitynumber)
            );
            const histSnap = await getDocs(qHist);

            const hist = [];
            const decidedIds = [];

            histSnap.forEach((snapDoc) => {
              const d = snapDoc.data();
              hist.push({
                id: snapDoc.id,
                societyId: d.societyId || null,
                societyName: d.societyName || "Unnamed Society",
                registerNo: d.registerNo || "N/A",
                decision: d.status || "Pending",
                note: d.note || "",
                date:
                  d.createdAt && d.createdAt.toDate
                    ? d.createdAt.toDate().toLocaleString()
                    : "",
              });
              if (d.societyId) decidedIds.push(d.societyId);
            });

            hist.sort(
              (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
            );
            setHistoryDecisions(hist);
            setDecidedSocietyIds(decidedIds);
          } catch (histErr) {
            console.error("Error loading history:", histErr);
          } finally {
            setLoadingHistory(false);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
        setLoadingUser(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleSignOut = () => {
    const ok = window.confirm("Do you really want to sign out?");
    if (!ok) return;
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // From main list: "View / Decide"
  const handleSelectSociety = async (soc) => {
    setSelectedSociety(soc);
    setReferralNote("");
    setReferralError("");
    setReferralSuccess("");
    setSelectedAlreadyDecided(false);
    setSelectedDecidedStatus("");
    setSelectedHistoryItem(null); // not from history
    setActiveTab("pending");

    if (!user || !user.identitynumber) return;

    try {
      const histRef = collection(db, "districtRequests");
      const qCheck = query(
        histRef,
        where("referredByOfficerId", "==", user.identitynumber),
        where("societyId", "==", soc.id)
      );
      const snap = await getDocs(qCheck);

      if (!snap.empty) {
        const d = snap.docs[0].data();
        setSelectedAlreadyDecided(true);
        setSelectedDecidedStatus(d.status || "Already decided");
      }
    } catch (err) {
      console.error("Error checking decision:", err);
    }
  };

  // From history click – read-only view
  const handleHistoryClick = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setReferralNote("");
    setReferralError("");
    setReferralSuccess("");
    setActiveTab("history");

    // Try to find full society from societies list
    let soc = null;
    if (historyItem.societyId) {
      soc = societies.find((s) => s.id === historyItem.societyId);
    }

    if (soc) {
      setSelectedSociety(soc);
    } else {
      setSelectedSociety({
        id: historyItem.societyId || "unknown",
        registerNo: historyItem.registerNo,
        societyName: historyItem.societyName,
        address: "",
        phone: "",
        email: "",
        memberCount: null,
        positions: {},
      });
    }

    setSelectedAlreadyDecided(true);
    setSelectedDecidedStatus(historyItem.decision);
  };

  // Submit referral to DO with Accept / Decline
  const handleSubmitReferral = async (e, decision) => {
    e.preventDefault();
    if (!user || !selectedSociety) return;

    setReferralError("");
    setReferralSuccess("");
    setReferralLoading(true);

    try {
      const histRef = collection(db, "districtRequests");
      const qCheck = query(
        histRef,
        where("referredByOfficerId", "==", user.identitynumber || ""),
        where("societyId", "==", selectedSociety.id)
      );
      const snap = await getDocs(qCheck);

      if (!snap.empty) {
        const d = snap.docs[0].data();
        setSelectedAlreadyDecided(true);
        setSelectedDecidedStatus(d.status || "Already decided");
        setReferralError(
          "මෙම ලියාපදිංචිය සදහා ඔබ දැනටමත් තීරණයක් ලබා දී ඇත. නැවත Accept/Decline නොහැක."
        );
        setReferralLoading(false);
        return;
      }

      const createdAtLocal = new Date();

      const newRef = await addDoc(collection(db, "districtRequests"), {
        type: "society_registration_reference",
        district: user.district || null,
        division: user.division || null,
        referredByOfficerId: user.identitynumber || null,
        referredByName: user.username || null,
        officerPosition: user.position || "village_officer",

        societyId: selectedSociety.id,
        societyName: selectedSociety.societyName || null,
        registerNo: selectedSociety.registerNo || null,
        societyAddress: selectedSociety.address || null,
        societyPhone: selectedSociety.phone || null,
        societyEmail: selectedSociety.email || null,
        memberCount: selectedSociety.memberCount || null,
        positions: selectedSociety.positions || null,

        note: referralNote || "",
        status: decision === "accept" ? "Accepted" : "Declined",
        createdAt: serverTimestamp(),
      });

      const decisionItem = {
        id: newRef.id,
        societyId: selectedSociety.id,
        societyName: selectedSociety.societyName || "Unnamed Society",
        registerNo: selectedSociety.registerNo || "N/A",
        decision: decision === "accept" ? "Accepted" : "Declined",
        note: referralNote || "",
        date: createdAtLocal.toLocaleString(),
      };

      setHistoryDecisions((prev) => [decisionItem, ...prev]);
      setDecidedSocietyIds((prev) => [...prev, selectedSociety.id]);
      setSelectedAlreadyDecided(true);
      setSelectedDecidedStatus(decisionItem.decision);

      setReferralSuccess(
        decision === "accept"
          ? "සමිතිය (Accepted) ලෙස දිස්ත්‍රික් නිලධාරීට යොමු කිරීම සාර්ථකයි."
          : "සමිතිය (Declined) ලෙස දිස්ත්‍රික් නිලධාරීට යොමු කිරීම සාර්ථකයි."
      );
      setReferralNote("");
    } catch (err) {
      console.error("Error sending referral:", err);
      setReferralError(
        "යොමු කිරීමේදී දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සහ කරන්න."
      );
    } finally {
      setReferralLoading(false);
    }
  };

  if (loadingUser) return <p className="rural-loading">Loading profile...</p>;
  if (error) return <p className="rural-error">{error}</p>;
  if (!user) return null;

  const totalHistory = historyDecisions.length;
  const approvedCount = historyDecisions.filter(
    (d) => d.decision === "Accepted"
  ).length;
  const declinedCount = historyDecisions.filter(
    (d) => d.decision === "Declined"
  ).length;

  const societiesToShow = societies.filter(
    (s) => !decidedSocietyIds.includes(s.id)
  );

  const chairman = selectedSociety?.positions?.chairman || {};
  const secretary = selectedSociety?.positions?.secretary || {};
  const treasurer = selectedSociety?.positions?.treasurer || {};

  const actionDisabled =
    referralLoading || selectedAlreadyDecided || !!selectedHistoryItem;

  return (
    <section className="rural-dashboard">
      <div className="rural-shell">
        {/* LEFT: PROFILE SIDEBAR */}
        <aside className="rural-sidebar">
          <div className="rural-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development Officer Dashboard</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="rural-profile-card">
            <div className="rural-avatar">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "R"}
              </div>
            </div>
            <h2 className="rural-name">{user.username}</h2>
            <p className="rural-role">
              ග්‍රාම සංවර්ධන නිලධාරී (Rural Development Officer)
            </p>

            <p className="rural-area-tag">
              {user.district || "සියලුම"} / {user.division || "සියලුම"}{" "}
              ප්‍රා.ලේ.
            </p>

            {/* Collapsible sensitive info */}
            <div className="rural-info-card">
              <button
                type="button"
                className="rural-info-toggle"
                onClick={() => setShowSensitiveInfo((s) => !s)}
              >
                <span>පෞද්ගලික තොරතුරු (Profile Info)</span>
                <span>{showSensitiveInfo ? "▴" : "▾"}</span>
              </button>

              {showSensitiveInfo && (
                <div className="rural-info-body">
                  <div className="info-row">
                    <span className="info-label">Identity No</span>
                    <span className="info-value">
                      {user.identitynumber || "N/A"}
                    </span>
                  </div>
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
                    <span className="info-label">District</span>
                    <span className="info-value">
                      {user.district || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Division</span>
                    <span className="info-value">
                      {user.division || "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Society</span>
                    <span className="info-value">
                      {user.society || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Accepted</p>
              <p className="stat-value">{approvedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Declined</p>
              <p className="stat-value">{declinedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Decisions</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>ඔබගේ භූමිකාව</h4>
            <ul>
              <li>ප්‍රාදේශීය මට්ටමේ ග්‍රාම සංවර්ධන සමිතිවල කාර්යයන් අධීක්ෂණය කිරීම.</li>
              <li>සමිතියන්ගෙන් ලැබෙන යෝජනා පිළිබඳ සටහන් / නිර්දේශ සකස් කිරීම.</li>
              <li>ඔබගේ තීරණය සමඟ ලියාපදිංචි ලිපි දිස්ත්‍රික් නිලධාරීට යොමු කිරීම.</li>
            </ul>
          </div>
        </aside>

        {/* RIGHT: TABBED MAIN AREA */}
        <main className="rural-main">
          {/* Tabs */}
          <div className="rural-tab-bar">
            <button
              className={`rural-tab-item ${
                activeTab === "pending" ? "rural-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending & Actions
            </button>
            <button
              className={`rural-tab-item ${
                activeTab === "history" ? "rural-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`rural-tab-item ${
                activeTab === "analytics" ? "rural-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Main header under tabs */}
          <div className="rural-main-header">
            <h1 className="rural-main-title">
              ග්‍රාම සංවර්ධන සමිති ලියාපදිංචි ලිපි
            </h1>
            <p className="rural-main-subtitle">
              ඔබගේ ප්‍රා.ලේ. කොට්ඨාසය තුළ ලියාපදිංචි කරන ලද සමිති
              සම්බන්ධයෙන් Accept / Decline තීරණ ලබා දී ඒවා දිස්ත්‍රික්
              නිලධාරීට යොමු කිරීම මෙහිදී සිදු කරයි.
            </p>
          </div>

          {/* ========== TAB CONTENT: PENDING & ACTIONS ========== */}
          {activeTab === "pending" && (
            <>
              <section className="rural-card">
                <h3 className="card-title">
                  තීරණයට බාකි ලියාපදිංචි සමිති
                </h3>
                <p className="muted-text">
                  ලැයිස්තුවේ සිට සමිතියක් තෝරාගෙන නිරීක්ෂණය කර Accept හෝ
                  Decline තීරණය ලබා දී දිස්ත්‍රික් නිලධාරීට යොමු කරන්න.
                </p>

                {loadingSocieties && (
                  <p className="muted-text">
                    Loading registered societies...
                  </p>
                )}

                {societiesError && (
                  <p className="rural-error">{societiesError}</p>
                )}

                {!loadingSocieties &&
                  !societiesError &&
                  societiesToShow.length === 0 && (
                    <p className="muted-text">
                      මේ මොහොතේ ඔබට තීරණය කිරීමට බාකි ලියාපදිංචි සමිතියක්
                      නොමැත.
                    </p>
                  )}

                {!loadingSocieties && societiesToShow.length > 0 && (
                  <table className="society-table">
                    <thead>
                      <tr>
                        <th>ලියාපදිංචි අංකය</th>
                        <th>සමිතියේ නම</th>
                        <th>ලිපිනය</th>
                        <th>දුරකථන</th>
                        <th>සාමාජිකයින්</th>
                        <th>ක්‍රියා</th>
                      </tr>
                    </thead>
                    <tbody>
                      {societiesToShow.map((s) => (
                        <tr key={s.id}>
                          <td>{s.registerNo || "N/A"}</td>
                          <td>{s.societyName || "Unnamed Society"}</td>
                          <td>{s.address || "N/A"}</td>
                          <td>{s.phone || "N/A"}</td>
                          <td>
                            {typeof s.memberCount === "number"
                              ? s.memberCount
                              : "N/A"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-view-refer"
                              onClick={() => handleSelectSociety(s)}
                            >
                              View / Decide
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* Detail + Referral / Read-only panel */}
              {selectedSociety && (
                <section className="rural-card referral-card">
                  <div className="referral-header">
                    <h3 className="card-title">
                      සමිතිය විස්තර – {selectedSociety.societyName}
                    </h3>
                    <button
                      type="button"
                      className="btn-close-referral"
                      onClick={() => {
                        setSelectedSociety(null);
                        setReferralNote("");
                        setReferralError("");
                        setReferralSuccess("");
                        setSelectedAlreadyDecided(false);
                        setSelectedDecidedStatus("");
                        setSelectedHistoryItem(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="referral-body">
                    <div className="ref-society-details">
                      <h4>සමිතිය පිළිබඳ විස්තර</h4>
                      <p>
                        <strong>ලියාපදිංචි අංකය:</strong>{" "}
                        {selectedSociety.registerNo || "N/A"}
                      </p>
                      <p>
                        <strong>ලිපිනය:</strong>{" "}
                        {selectedSociety.address || "N/A"}
                      </p>
                      <p>
                        <strong>දුරකථන:</strong>{" "}
                        {selectedSociety.phone || "N/A"}
                      </p>
                      <p>
                        <strong>ඊමේල්:</strong>{" "}
                        {selectedSociety.email || "N/A"}
                      </p>
                      <p>
                        <strong>සාමාජිකයින් ගණන:</strong>{" "}
                        {typeof selectedSociety.memberCount === "number"
                          ? selectedSociety.memberCount
                          : "N/A"}
                      </p>

                      <div className="positions-block">
                        <h4>තනතුරු විස්තර</h4>

                        <PositionBlock
                          title="සභාපති (Chairman)"
                          data={chairman}
                        />
                        <PositionBlock
                          title="ලේකම් (Secretary)"
                          data={secretary}
                        />
                        <PositionBlock
                          title="භාණ්ඩාගාරික (Treasurer)"
                          data={treasurer}
                        />
                      </div>
                    </div>

                    <form
                      className="referral-form"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <h4>දිස්ත්‍රික් නිලධාරීට යොමු කිරීම</h4>
                      <p className="muted-text">
                        මෙම සමිතිය සම්බන්ධයෙන් ඔබගේ සටහන් / නිර්දේශ සටහන්
                        කර &quot;Accept&quot; හෝ &quot;Decline&quot; තෝරා
                        දිස්ත්‍රික් නිලධාරීට යොමු කරන්න.
                      </p>

                      <label>Officer Note / Recommendation</label>
                      <textarea
                        value={referralNote}
                        onChange={(e) => setReferralNote(e.target.value)}
                        rows={4}
                        placeholder="සටහන / නිර්දේශ ඇතුලත් කරන්න..."
                        disabled={selectedAlreadyDecided}
                      />

                      {selectedAlreadyDecided && (
                        <p className="muted-text">
                          මෙම සමිතිය සදහා ඔබ දැනටමත්{" "}
                          <strong>{selectedDecidedStatus}</strong> තීරණය ලබා
                          දී ඇත.
                        </p>
                      )}

                      {referralError && (
                        <p className="rural-error">{referralError}</p>
                      )}
                      {referralSuccess && (
                        <p className="rural-success">{referralSuccess}</p>
                      )}

                      <div className="referral-actions">
                        <button
                          type="button"
                          className="btn-decline"
                          disabled={actionDisabled}
                          onClick={(e) => handleSubmitReferral(e, "decline")}
                        >
                          {referralLoading ? "Processing..." : "Decline"}
                        </button>
                        <button
                          type="button"
                          className="btn-accept"
                          disabled={actionDisabled}
                          onClick={(e) => handleSubmitReferral(e, "accept")}
                        >
                          {referralLoading ? "Processing..." : "Accept"}
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ========== TAB CONTENT: HISTORY ========== */}
          {activeTab === "history" && (
            <section className="rural-card">
              <div className="history-header">
                <h3 className="card-title">Registration Decision History</h3>
              </div>

              {loadingHistory ? (
                <p className="muted-text">Loading history...</p>
              ) : historyDecisions.length === 0 ? (
                <p className="muted-text">
                  තීරණාත්මක ඉතිහාසයක් මෙතෙක් නොමැත.
                </p>
              ) : (
                <ul className="letter-list">
                  {historyDecisions.map((d) => (
                    <li
                      key={d.id}
                      className="letter-item"
                      onClick={() => handleHistoryClick(d)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <p className="letter-type">
                          <strong>{d.societyName}</strong>
                        </p>
                        <p className="letter-sub">Reg. No: {d.registerNo}</p>
                        <p className="letter-sub">Date & Time: {d.date}</p>
                        {d.note && (
                          <p className="letter-sub">Note: {d.note}</p>
                        )}
                      </div>
                      <span
                        className={`badge ${
                          d.decision === "Accepted"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {d.decision}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Read-only detail if selected from history */}
              {selectedHistoryItem && selectedSociety && (
                <section className="rural-card referral-card" style={{ marginTop: 10 }}>
                  <div className="referral-header">
                    <h3 className="card-title">
                      History View – {selectedSociety.societyName}
                    </h3>
                    <button
                      type="button"
                      className="btn-close-referral"
                      onClick={() => {
                        setSelectedSociety(null);
                        setSelectedHistoryItem(null);
                        setSelectedAlreadyDecided(false);
                        setSelectedDecidedStatus("");
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="referral-body">
                    <div className="ref-society-details">
                      <h4>සමිතිය පිළිබඳ විස්තර</h4>
                      <p>
                        <strong>ලියාපදිංචි අංකය:</strong>{" "}
                        {selectedSociety.registerNo || "N/A"}
                      </p>
                      <p>
                        <strong>ලිපිනය:</strong>{" "}
                        {selectedSociety.address || "N/A"}
                      </p>
                      <p>
                        <strong>දුරකථන:</strong>{" "}
                        {selectedSociety.phone || "N/A"}
                      </p>
                      <p>
                        <strong>ඊමේල්:</strong>{" "}
                        {selectedSociety.email || "N/A"}
                      </p>
                    </div>

                    <div className="referral-form">
                      <h4>ඔබ ලබා දුන් තීරණය</h4>
                      <p className="muted-text">
                        මෙම තීරණය දැනටමත් දිස්ත්‍රික් නිලධාරීට යොමු කර ඇත.
                      </p>
                      <p>
                        <strong>Decision:</strong>{" "}
                        {selectedHistoryItem.decision}
                      </p>
                      <p>
                        <strong>Date:</strong> {selectedHistoryItem.date}
                      </p>
                      {selectedHistoryItem.note && (
                        <p>
                          <strong>Note:</strong> {selectedHistoryItem.note}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </section>
          )}

          {/* ========== TAB CONTENT: ANALYTICS ========== */}
          {activeTab === "analytics" && (
            <section className="rural-card">
              <h3 className="card-title">විශ්ලේෂණ සාරාංශය</h3>
              <p className="muted-text">
                ඔබ විසින් ලබා දී ඇති තීරණ පිළිබඳ සරල සංඛ්‍යාත දර්ශක.
              </p>

              <div className="rural-analytics-grid">
                <div className="rural-analytics-card">
                  <h4>Accepted</h4>
                  <p className="rural-analytics-number">{approvedCount}</p>
                  <p className="rural-analytics-label">
                    ඔබ විසින් පිළිගත් (Accepted) ලියාපදිංචි ඉල්ලීම් ගණන.
                  </p>
                </div>
                <div className="rural-analytics-card">
                  <h4>Declined</h4>
                  <p className="rural-analytics-number">{declinedCount}</p>
                  <p className="rural-analytics-label">
                    ඔබ විසින් ප්‍රත්‍යාකරණය කළ (Declined) ඉල්ලීම් ගණන.
                  </p>
                </div>
                <div className="rural-analytics-card">
                  <h4>Total Decisions</h4>
                  <p className="rural-analytics-number">{totalHistory}</p>
                  <p className="rural-analytics-label">
                    ඔබ විසින් ලබා දුන් සමස්ත තීරණ ගණන.
                  </p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </section>
  );
};

const PositionBlock = ({ title, data }) => {
  const d = data || {};
  return (
    <div className="position-item">
      <h5>{title}</h5>
      <p>
        <strong>නම:</strong> {d.fullName || "N/A"}
      </p>
      <p>
        <strong>ලිපිනය:</strong> {d.address || "N/A"}
      </p>
      <p>
        <strong>දුරකථන:</strong> {d.phone || "N/A"}
      </p>
      <p>
        <strong>ඊමේල්:</strong> {d.email || "N/A"}
      </p>
      <p>
        <strong>ජා.හැ.අංකය:</strong> {d.nic || "N/A"}
      </p>
      <p>
        <strong>උපන් දිනය:</strong> {d.dob || "N/A"}
      </p>
    </div>
  );
};

export default Ruraldevofficer;