import React, { useEffect, useState } from "react";
import "./ruraldevofficer.css";
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
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Ruraldevofficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  // societies / registration decisions
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

  // NEW: applications forwarded to RDO (by Treasurer)
  const [pendingApps, setPendingApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState("");

  // for messages about forwarding apps
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

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

        // 4) Load applications forwarded to this RDO
        if (userData.district && userData.division) {
          setLoadingApps(true);
          setAppsError("");
          setActionError("");
          setActionSuccess("");

          try {
            const allPending = [];

            // --- LOAN APPLICATIONS ---
            const loansRef = collection(db, "loanApplications");
            const qLoans = query(
              loansRef,
              where("currentRole", "==", "rural_officer"),
              where("societyContext.district", "==", userData.district),
              where("societyContext.divisionName", "==", userData.division)
            );
            const loanSnap = await getDocs(qLoans);
            loanSnap.forEach((d) => {
              const data = d.data();
              allPending.push({
                id: d.id,
                type: "loan",
                ...data,
                createdAt:
                  data.createdAt && data.createdAt.toDate
                    ? data.createdAt.toDate().toLocaleString()
                    : "",
              });
            });

            // --- SCHOLARSHIP APPLICATIONS (if you want RDO to see them) ---
            const schRef = collection(db, "scholarshipApplications");
            const qSch = query(
              schRef,
              where("currentRole", "==", "rural_officer"),
              where("societyContext.district", "==", userData.district),
              where("societyContext.divisionName", "==", userData.division)
            );
            const schSnap = await getDocs(qSch);
            schSnap.forEach((d) => {
              const data = d.data();
              allPending.push({
                id: d.id,
                type: "scholarship",
                ...data,
                createdAt:
                  data.createdAt && data.createdAt.toDate
                    ? data.createdAt.toDate().toLocaleString()
                    : "",
              });
            });

            // --- FUND RELEASE APPLICATIONS (if needed) ---
            const fundRef = collection(db, "fundReleaseApplications");
            const qFund = query(
              fundRef,
              where("currentRole", "==", "rural_officer"),
              where("societyContext.district", "==", userData.district),
              where("societyContext.divisionName", "==", userData.division)
            );
            const fundSnap = await getDocs(qFund);
            fundSnap.forEach((d) => {
              const data = d.data();
              allPending.push({
                id: d.id,
                type: "fund",
                ...data,
                createdAt:
                  data.createdAt && data.createdAt.toDate
                    ? data.createdAt.toDate().toLocaleString()
                    : "",
              });
            });

            setPendingApps(allPending);
          } catch (appErr) {
            console.error("Error loading RDO applications:", appErr);
            setAppsError("Failed to load forwarded applications.");
          } finally {
            setLoadingApps(false);
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

  // From main list: "View / Decide" (registration referrals)
  const handleSelectSociety = async (soc) => {
    setSelectedSociety(soc);
    setReferralNote("");
    setReferralError("");
    setReferralSuccess("");
    setSelectedAlreadyDecided(false);
    setSelectedDecidedStatus("");
    setSelectedHistoryItem(null);

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
    setActiveTab("history");
  };

  // Submit referral to DO with Accept / Decline (registration)
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

  // Forward application (at RDO) to District Officer
  const handleForwardAppToDistrictOfficer = async (app) => {
    if (!user) return;
    setAppsError("");
    setActionError("");
    setActionSuccess("");

    // choose collection based on type
    let collectionName = "loanApplications";
    if (app.type === "scholarship") collectionName = "scholarshipApplications";
    else if (app.type === "fund") collectionName = "fundReleaseApplications";

    try {
      const ref = doc(db, collectionName, app.id);
      await updateDoc(ref, {
        currentRole: "district_officer",
        status: "ForwardedTo_district_officer",
        lastActionBy: user.username || user.email || "RuralOfficer",
        lastActionAt: new Date(),
      });

      setPendingApps((prev) => prev.filter((a) => a.id !== app.id));
      setActionSuccess(
        "අයදුම්පත දිස්ත්‍රික් නිලධාරී (District Officer) වෙත යොමු කරන ලදී."
      );
    } catch (err) {
      console.error("Error forwarding to DO:", err);
      setActionError("District Officer වෙත යොමු කිරීමේදී දෝෂයක් සිදු විය.");
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

  const created =
    user?.createdAt && user.createdAt.toDate
      ? user.createdAt.toDate().toLocaleDateString()
      : "";

  return (
    <section className="rural-dashboard">
      <div className="rural-shell">
        {/* LEFT: PROFILE SIDEBAR */}
        <aside className="rural-sidebar">
          <div className="rural-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development – Rural Officer Panel</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="sidebar-card">
            <div className="avatar-circle">
              {user.username ? user.username.charAt(0).toUpperCase() : "R"}
            </div>
            <h3 className="sidebar-name">{user.username || "Officer"}</h3>
            <p className="sidebar-role">ග්‍රාම සංවර්ධන නිලධාරී / Rural Dev. Officer</p>

            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact</span>
              <span className="info-value">{user.contactnumber || "N/A"}</span>
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

            <h4 className="sidebar-section-title" style={{ marginTop: 16 }}>
              Officer Area
            </h4>
            <div className="info-row">
              <span className="info-label">District</span>
              <span className="info-value">{user.district || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Division</span>
              <span className="info-value">{user.division || "N/A"}</span>
            </div>

            <h4 className="sidebar-section-title" style={{ marginTop: 16 }}>
              Society Registration Stats
            </h4>
            <div className="info-row">
              <span className="info-label">Decisions Given</span>
              <span className="info-value">{totalHistory}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Accepted</span>
              <span className="info-value">{approvedCount}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Declined</span>
              <span className="info-value">{declinedCount}</span>
            </div>

            <h4 className="sidebar-section-title" style={{ marginTop: 16 }}>
              Toggle Sensitive Info
            </h4>
            <label className="toggle-checkbox">
              <input
                type="checkbox"
                checked={showSensitiveInfo}
                onChange={() => setShowSensitiveInfo((p) => !p)}
              />
              <span>Show committee members' personal info</span>
            </label>
          </div>
        </aside>

        {/* RIGHT: MAIN AREA */}
        <main className="rural-main">
          {/* Tab bar */}
          <div className="rural-tabs">
            <button
              className={
                activeTab === "pending"
                  ? "rural-tab-btn rural-tab-btn--active"
                  : "rural-tab-btn"
              }
              onClick={() => setActiveTab("pending")}
            >
              තීරණයට බාකි / Pending
            </button>
            <button
              className={
                activeTab === "history"
                  ? "rural-tab-btn rural-tab-btn--active"
                  : "rural-tab-btn"
              }
              onClick={() => setActiveTab("history")}
            >
              ඉතිහාසය / History
            </button>
            <button
              className={
                activeTab === "analytics"
                  ? "rural-tab-btn rural-tab-btn--active"
                  : "rural-tab-btn"
              }
              onClick={() => setActiveTab("analytics")}
            >
              විශ්ලේෂණ / Analytics
            </button>
          </div>

          {/* ---------- PENDING TAB ---------- */}
          {activeTab === "pending" && (
            <>
              {/* --- Societies pending registration decision --- */}
              <section className="rural-card">
                <h3 className="card-title">
                  තීරණයට බාකි ලියාපදිංචි සමිති (Registration)
                </h3>
                {loadingSocieties ? (
                  <p className="muted-text">සමිති ලැයිස්තුව රදිමින්...</p>
                ) : societiesError ? (
                  <p className="rural-error">{societiesError}</p>
                ) : societiesToShow.length === 0 ? (
                  <p className="muted-text">
                    තවදුරටත් ඔබගේ කොට්ඨාසයේ නව ලියාපදිංචි සමිතියක් නැත.
                  </p>
                ) : (
                  <table className="society-table">
                    <thead>
                      <tr>
                        <th>සමිතියේ නම</th>
                        <th>ලියාපදිංචි අංකය</th>
                        <th>ලිපිනය</th>
                        <th>සාමාජික සංඛ්‍යාව</th>
                        <th>ක්‍රියා</th>
                      </tr>
                    </thead>
                    <tbody>
                      {societiesToShow.map((s) => (
                        <tr key={s.id}>
                          <td>{s.societyName || "N/A"}</td>
                          <td>{s.registerNo || "N/A"}</td>
                          <td>{s.address || "N/A"}</td>
                          <td>{s.memberCount || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-accept"
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

              {/* Selected society details & decision form */}
              {selectedSociety && (
                <section className="rural-card">
                  <h3 className="card-title">
                    ලියාපදිංචි society – {selectedSociety.societyName}
                  </h3>
                  <div className="society-detail-grid">
                    <div>
                      <p>
                        <strong>Reg. No:</strong>{" "}
                        {selectedSociety.registerNo || "N/A"}
                      </p>
                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedSociety.address || "N/A"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedSociety.phone || "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedSociety.email || "N/A"}
                      </p>
                      <p>
                        <strong>Members:</strong>{" "}
                        {selectedSociety.memberCount || "N/A"}
                      </p>
                    </div>
                    {showSensitiveInfo && (
                      <div>
                        <h4>Committee Members</h4>
                        <div className="committee-grid">
                          <PositionBlock
                            title="සභාපති / Chairman"
                            data={chairman}
                          />
                          <PositionBlock
                            title="ලේකම් / Secretary"
                            data={secretary}
                          />
                          <PositionBlock
                            title="භාණ්ඩාගාරික / Treasurer"
                            data={treasurer}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedAlreadyDecided && (
                    <p className="muted-text" style={{ marginTop: 8 }}>
                      ඔබ විසින් මෙම society එකට දැනටමත්{" "}
                      <strong>{selectedDecidedStatus}</strong> තීරණය
                      ලබා දී ඇත.
                    </p>
                  )}

                  {!selectedHistoryItem && (
                    <form
                      className="referral-form"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <label className="form-label">
                        ඔබේ සාරාංශ කටයුතු / නෝට්ස්:
                        <textarea
                          value={referralNote}
                          onChange={(e) => setReferralNote(e.target.value)}
                          rows={3}
                          placeholder="ඔබේ නිර්දේශය මෙහි ලියන්න..."
                        />
                      </label>

                      {referralError && (
                        <p className="rural-error" style={{ marginTop: 8 }}>
                          {referralError}
                        </p>
                      )}
                      {referralSuccess && (
                        <p className="rural-success" style={{ marginTop: 8 }}>
                          {referralSuccess}
                        </p>
                      )}

                      <div className="referral-actions">
                        <button
                          type="button"
                          className="btn-decline"
                          disabled={actionDisabled}
                          onClick={(e) => handleSubmitReferral(e, "decline")}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className="btn-accept"
                          disabled={actionDisabled}
                          onClick={(e) => handleSubmitReferral(e, "accept")}
                        >
                          Accept & Forward to District Officer
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              )}

              {/* NEW: Applications forwarded to this RDO */}
              <section className="rural-card" style={{ marginTop: 16 }}>
                <h3 className="card-title">
                  ඔබ වෙත යොමු වූ අයදුම්පත් (Applications at RDO)
                </h3>
                <p className="muted-text">
                  භාණ්ඩාගාරික (Treasurer) මඟින්{" "}
                  <strong>currentRole = "rural_officer"</strong> ලෙස යොමු
                  කරන ලද අයදුම්පත් මෙහි පෙන්වයි. අවශ්‍ය පරීක්ෂණ වර්ගීකරණය
                  සිදු කර{" "}
                  <strong>District Officer</strong> වෙත යොමු කරන්න.
                </p>

                {loadingApps ? (
                  <p className="muted-text">අයදුම්පත් රදිමින්...</p>
                ) : appsError ? (
                  <p className="rural-error">{appsError}</p>
                ) : pendingApps.length === 0 ? (
                  <p className="muted-text">
                    දැනට ඔබ වෙත යොමු කරන ලද අයදුම්පත් නොමැත.
                  </p>
                ) : (
                  <table className="society-table">
                    <thead>
                      <tr>
                        <th>වර්ගය</th>
                        <th>ඉල්ලුම්කරු / ව්‍යාපෘතිය</th>
                        <th>මුදල</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApps.map((app) => (
                        <tr key={app.id}>
                          <td>
                            {app.type === "loan"
                              ? "ණය"
                              : app.type === "scholarship"
                              ? "ශිෂ්‍යත්ව"
                              : "මුදල් නිදහස්"}
                          </td>
                          <td>
                            {app.type === "loan" && (
                              <>
                                {app.borrowerName || "-"} – {app.projectType}
                              </>
                            )}
                            {app.type === "scholarship" && (
                              <>
                                {app.fullName || "-"} – O/L {app.examYear}
                              </>
                            )}
                            {app.type === "fund" && (
                              <>
                                {app.societyName || "-"} –{" "}
                                {app.projectName || ""}
                              </>
                            )}
                          </td>
                          <td>
                            {app.type === "loan" && (app.loanAmount || "-")}
                            {app.type === "scholarship" &&
                              (app.monthlyAmount || "-")}
                            {app.type === "fund" &&
                              (app.requestedAmount || "-")}
                          </td>
                          <td>{app.createdAt || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-accept"
                              onClick={() =>
                                handleForwardAppToDistrictOfficer(app)
                              }
                            >
                              Forward to District Officer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {actionError && (
                  <p className="rural-error" style={{ marginTop: 8 }}>
                    {actionError}
                  </p>
                )}
                {actionSuccess && (
                  <p className="rural-success" style={{ marginTop: 8 }}>
                    {actionSuccess}
                  </p>
                )}
              </section>
            </>
          )}

          {/* ---------- HISTORY TAB ---------- */}
          {activeTab === "history" && (
            <section className="rural-card">
              <h3 className="card-title">ඔබ ලබා දී ඇති තීරණ ඉතිහාසය</h3>
              {loadingHistory ? (
                <p className="muted-text">History loading...</p>
              ) : historyDecisions.length === 0 ? (
                <p className="muted-text">
                  තවත් ලියාපදිංචි society තීරණ අවශ්‍ය නොවීය.
                </p>
              ) : (
                <ul className="history-list">
                  {historyDecisions.map((h) => (
                    <li
                      key={h.id}
                      className="history-item"
                      onClick={() => handleHistoryClick(h)}
                    >
                      <div>
                        <p className="history-title">
                          {h.societyName || "Unnamed Society"}
                        </p>
                        <p className="history-sub">
                          Reg. No: {h.registerNo || "N/A"}
                        </p>
                        <p className="history-sub">
                          Decision:{" "}
                          <strong
                            className={
                              h.decision === "Accepted"
                                ? "badge-success"
                                : h.decision === "Declined"
                                ? "badge-danger"
                                : "badge-warning"
                            }
                          >
                            {h.decision}
                          </strong>{" "}
                          | {h.date}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* ---------- ANALYTICS TAB (simple demo) ---------- */}
          {activeTab === "analytics" && (
            <section className="rural-card">
              <h3 className="card-title">Analytics (Simple)</h3>
              <p className="muted-text">
                මෙහිදී ඔබට අවශ්‍ය වෙන විස්තරාත්මක වාර්තා, ග්‍රාෆ්, ලියාපදිංචි
                ප්‍රවණතා ආදිය later එකතු කරගත හැක.
              </p>
              <ul>
                <li>Decisions given: {totalHistory}</li>
                <li>Accepted: {approvedCount}</li>
                <li>Declined: {declinedCount}</li>
                <li>Applications currently at RDO: {pendingApps.length}</li>
              </ul>
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