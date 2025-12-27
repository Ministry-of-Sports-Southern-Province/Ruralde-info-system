import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import "../districtOfficer/districtOfficer.css";
import { useNavigate } from "react-router-dom";

const DistrictOfficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [doNote, setDoNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Tabs: pending | requested | history | analytics
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
        // 1) Load district officer user
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

        // 2) Load registration references from RDOs for this district
        if (userData.district) {
          setLoadingRequests(true);
          try {
            const reqRef = collection(db, "districtRequests");
            const qReq = query(
              reqRef,
              where("district", "==", userData.district)
            );

            const snap = await getDocs(qReq);

            const all = [];
            snap.forEach((reqDoc) => {
              const d = reqDoc.data();
              all.push({
                id: reqDoc.id,
                societyId: d.societyId || null,
                societyName: d.societyName || "Unnamed Society",
                registerNo: d.registerNo || "N/A",
                societyAddress: d.societyAddress || "N/A",
                societyPhone: d.societyPhone || "N/A",
                societyEmail: d.societyEmail || "N/A",
                memberCount:
                  typeof d.memberCount === "number" ? d.memberCount : null,
                positions: d.positions || null,

                district: d.district || "N/A",
                division: d.division || "N/A",

                officerId: d.referredByOfficerId || "N/A",
                officerName: d.referredByName || "Unknown Officer",
                officerPosition: d.officerPosition || "village_officer",

                status: d.status || "Pending", // RDO decision
                note: d.note || "",

                districtStatus: d.districtStatus || "Pending",
                districtNote: d.districtNote || "",

                createdAt:
                  d.createdAt && d.createdAt.toDate
                    ? d.createdAt.toDate().toLocaleString()
                    : "",
              });
            });

            all.sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );

            setRequests(all);
          } catch (err) {
            console.error("Error loading district requests:", err);
            setError("Failed to load requests for this district.");
          } finally {
            setLoadingRequests(false);
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

  const handleSignOutClick = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setShowSignOutModal(false);
    navigate("/login");
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setDoNote(req.districtNote || "");
    setActionError("");
    setActionSuccess("");
    setActiveTab("pending");
  };

  // === DO Accept / Decline: Only once ===
  const handleDoDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.districtStatus === "AcceptedByDO" ||
      selectedRequest.districtStatus === "DeclinedByDO" ||
      selectedRequest.districtStatus === "ForwardedToSecretary"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සඳහා දිස්ත්‍රික් තීරණය දැනටමත් ලබා දී ඇත."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      const docRef = doc(db, "districtRequests", selectedRequest.id);
      const newStatus =
        decision === "accept" ? "AcceptedByDO" : "DeclinedByDO";

      await updateDoc(docRef, {
        districtStatus: newStatus,
        districtNote: doNote || "",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                districtStatus: newStatus,
                districtNote: doNote || "",
              }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              districtStatus: newStatus,
              districtNote: doNote || "",
            }
          : prev
      );

      setActionSuccess(
        decision === "accept"
          ? "සමිතිය දිස්ත්‍රික් මට්ටමින් (අනුමත) ලෙස සළකනු ලැබීය."
          : "සමිතිය දිස්ත්‍රික් මට්ටමින් (ප්‍රත්‍යාකරණය) කරන ලදී."
      );
    } catch (err) {
      console.error("Error updating DO decision:", err);
      setActionError("දිස්ත්‍රික් තීරණය සුරක්ෂිත කිරීමට නොහැකි විය.");
    } finally {
      setActionLoading(false);
    }
  };

  // === Forward to Secretary: only after DO has decided ===
  const handleForwardToSecretary = async () => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.districtStatus !== "AcceptedByDO" &&
      selectedRequest.districtStatus !== "DeclinedByDO"
    ) {
      setActionError(
        "කරුණාකර පළමුව Accept හෝ Decline තීරණයක් ලබා දී පසුව යොමු කරන්න."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      await addDoc(collection(db, "secretaryRequests"), {
        societyId: selectedRequest.societyId,
        societyName: selectedRequest.societyName,
        registerNo: selectedRequest.registerNo,
        societyAddress: selectedRequest.societyAddress,
        societyPhone: selectedRequest.societyPhone,
        societyEmail: selectedRequest.societyEmail,
        memberCount: selectedRequest.memberCount,
        positions: selectedRequest.positions,

        district: selectedRequest.district,
        division: selectedRequest.division,

        ruralOfficerId: selectedRequest.officerId,
        ruralOfficerName: selectedRequest.officerName,
        ruralOfficerPosition: selectedRequest.officerPosition,
        ruralOfficerDecision: selectedRequest.status,
        ruralOfficerNote: selectedRequest.note,

        districtOfficerId: user.identitynumber || null,
        districtOfficerName: user.username || null,
        districtOfficerEmail: user.email || null,
        districtDecision: selectedRequest.districtStatus,
        districtNote: selectedRequest.districtNote || doNote || "",

        status: "Pending",
        createdAt: new Date(),
      });

      const docRef = doc(db, "districtRequests", selectedRequest.id);
      await updateDoc(docRef, {
        districtStatus: "ForwardedToSecretary",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, districtStatus: "ForwardedToSecretary" }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev ? { ...prev, districtStatus: "ForwardedToSecretary" } : prev
      );

      setActionSuccess(
        "සමිතිය පිළිබඳ ලේඛනය ප්‍රාදේශීය ලේකම් වෙත යොමු කිරීම සාර්ථකයි."
      );
    } catch (err) {
      console.error("Error forwarding to secretary:", err);
      setActionError(
        "ප්‍රාදේශීය ලේකම් වෙත යොමු කිරීමේදී දෝෂයක් සිදු විය. නැවත උත්සහ කරන්න."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser) return <p className="district-loading">Loading profile...</p>;
  if (error) return <p className="district-error">{error}</p>;
  if (!user) return null;

  const latestRequests = requests;
  const historyRequests = requests;

  const totalPending = latestRequests.length;
  const totalHistory = historyRequests.length;
  const acceptedByRdoCount = requests.filter(
    (l) => l.status === "Accepted"
  ).length;
  const forwardedToSecretaryCount = requests.filter(
    (l) => l.districtStatus === "ForwardedToSecretary"
  ).length;

  return (
    <section className="district-dashboard">
      {/* SIGN OUT MODAL */}
      {showSignOutModal && (
        <div className="do-modal-backdrop">
          <div className="do-modal-card">
            <h3 className="do-modal-title">Sign Out</h3>
            <p className="do-modal-message">
              ඔබගේ ගිණුමේ සිට ඉවත් වීමට ඇත්තෙන්ම අවශ්‍යද?
            </p>
            <div className="do-modal-actions">
              <button
                type="button"
                className="do-modal-btn do-modal-btn-cancel"
                onClick={handleCancelSignOut}
              >
                නැවත Dashboard හි පවතින්න
              </button>
              <button
                type="button"
                className="do-modal-btn do-modal-btn-confirm"
                onClick={handleConfirmSignOut}
              >
                ඔව්, Sign Out වන්න
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="district-shell">
        {/* LEFT: PROFILE SIDEBAR */}
        <aside className="district-sidebar">
          <div className="district-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>District Officer Dashboard</span>
            </div>
            <button className="signout-btn" onClick={handleSignOutClick}>
              Sign Out
            </button>
          </div>

          <div className="district-profile-card">
            <div className="district-avatar">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "D"}
              </div>
            </div>
            <h2 className="district-name">{user.username}</h2>
            <p className="district-role-main">
              {user.position || "දිස්ත්‍රික් ග්‍රාම සංවර්ධන නිලධාරී"}
            </p>
            <p className="district-role-sub">
              {user.district || "සියලුම"} දිස්ත්‍රික් – District Officer
            </p>

            <p className="district-area-tag">
              {user.district || "සියලුම"} / {user.division || "සියලුම"}{" "}
              ප්‍රා.ලේ.
            </p>

            {/* Collapsible sensitive info */}
            <div className="district-info-card">
              <button
                type="button"
                className="do-info-toggle"
                onClick={() => setShowSensitiveInfo((s) => !s)}
              >
                <span>පෞද්ගලික තොරතුරු (Profile Info)</span>
                <span>{showSensitiveInfo ? "▴" : "▾"}</span>
              </button>

              {showSensitiveInfo && (
                <div className="do-info-body">
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
                      {user.division || "All"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Total Requests</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Accepted by RDO</p>
              <p className="stat-value">{acceptedByRdoCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Forwarded to DS</p>
              <p className="stat-value">{forwardedToSecretaryCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Records</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>ඔබගේ භූමිකාව</h4>
            <ul>
              <li>RDO මට්ටමේ තීරණ සමාලෝචනය කර දිස්ත්‍රික් මට්ටමේ තීරණය ලබා දීම.</li>
              <li>සමිතිය පිළිබඳ නිසි සටහන් District Note ලෙස සටහන් කිරීම.</li>
              <li>අවසානයේ ප්‍රාදේශීය ලේකම් වෙත යොමු කිරීම (Forward to DS).</li>
            </ul>
          </div>
        </aside>

        {/* RIGHT: MAIN CONTENT WITH TABS */}
        <main className="district-main">
          {/* Tabs */}
          <div className="do-tab-bar">
            <button
              className={`do-tab-item ${
                activeTab === "pending" ? "do-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending & Actions
            </button>
            <button
              className={`do-tab-item ${
                activeTab === "requested" ? "do-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("requested")}
            >
              Requested References
            </button>
            <button
              className={`do-tab-item ${
                activeTab === "history" ? "do-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`do-tab-item ${
                activeTab === "analytics" ? "do-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Small header */}
          <div className="do-main-header">
            <h1 className="do-main-title">RDO Registration References</h1>
            <p className="do-main-subtitle">
              RDO මට්ටමේ අනුමැති ලබාගත් ග්‍රාම සංවර්ධන සමිති ලියාපදිංචි
              විස්තර ඔබ විසින් දිස්ත්‍රික් මට්ටමේ සමාලෝචනය කර, අවසන් වශයෙන්
              ප්‍රාදේශීය ලේකම් වෙත යොමු කළ යුතුය.
            </p>
          </div>

          {/* ========== TAB CONTENTS ========== */}

          {/* 1. Pending & Actions */}
          {activeTab === "pending" && (
            <>
              <section className="district-card">
                <h3 className="card-title">RDO Registration References</h3>
                <p className="muted-text">
                  ලැයිස්තුවෙන් එකක් තෝරා සමාලෝචනය කිරීමෙන් පසු Accept /
                  Decline තීරණය ලබා දී, අවසානයේ &quot;Forward to
                  Divisional Secretary&quot; භාවිතයෙන් DS වෙත යොමු කරන්න.
                </p>
                {loadingRequests ? (
                  <p className="muted-text">Loading requests...</p>
                ) : latestRequests.length === 0 ? (
                  <p className="muted-text">
                    ඔබගේ දිස්ත්‍රික්කය සඳහා RDO හරහා ඉදිරිපත් කළ
                    ලියාපදිංචි ඉල්ලීම් නොමැත.
                  </p>
                ) : (
                  <ul className="letter-list">
                    {latestRequests.map((req) => (
                      <li
                        key={req.id}
                        className="letter-item"
                        onClick={() => handleSelectRequest(req)}
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <p className="letter-type">
                            <strong>{req.societyName}</strong> (
                            {req.registerNo})
                          </p>
                          <p className="letter-sub">
                            Division: {req.division} | From RDO:{" "}
                            {req.officerName}
                          </p>
                          <p className="letter-sub">Date: {req.createdAt}</p>
                          {req.note && (
                            <p className="letter-sub">
                              RDO Note: {req.note}
                            </p>
                          )}
                          {req.districtStatus &&
                            req.districtStatus !== "Pending" && (
                              <p className="letter-sub">
                                DO Status: {req.districtStatus}
                              </p>
                            )}
                        </div>
                        <span
                          className={`badge ${
                            req.status === "Accepted"
                              ? "badge-success"
                              : req.status === "Declined"
                              ? "badge-danger"
                              : "badge-warning"
                          }`}
                        >
                          {req.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {selectedRequest && (
                <section className="district-card referral-card">
                  <div className="referral-header">
                    <h3 className="card-title">
                      Society Registration – {selectedRequest.societyName}
                    </h3>
                    <button
                      type="button"
                      className="btn-close-referral"
                      onClick={() => {
                        setSelectedRequest(null);
                        setDoNote("");
                        setActionError("");
                        setActionSuccess("");
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="referral-body">
                    <div className="ref-society-details">
                      <h4>සමිතිය සම්බන්ධ තොරතුරු</h4>
                      <p>
                        <strong>Register No:</strong>{" "}
                        {selectedRequest.registerNo}
                      </p>
                      <p>
                        <strong>Address:</strong>{" "}
                        {selectedRequest.societyAddress}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedRequest.societyPhone}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedRequest.societyEmail}
                      </p>
                      <p>
                        <strong>Members:</strong>{" "}
                        {selectedRequest.memberCount ?? "N/A"}
                      </p>

                      <h4 style={{ marginTop: "10px" }}>Positions</h4>
                      {selectedRequest.positions ? (
                        <>
                          <PositionBlock
                            title="සභාපති (Chairman)"
                            data={selectedRequest.positions.chairman}
                          />
                          <PositionBlock
                            title="ලේකම් (Secretary)"
                            data={selectedRequest.positions.secretary}
                          />
                          <PositionBlock
                            title="භාණ්ඩාගාරික (Treasurer)"
                            data={selectedRequest.positions.treasurer}
                          />
                        </>
                      ) : (
                        <p className="muted-text">
                          Position details not available.
                        </p>
                      )}
                    </div>

                    <div className="ref-society-details">
                      <h4>Rural Development Officer Signature</h4>
                      <p>
                        <strong>Name:</strong> {selectedRequest.officerName}
                      </p>
                      <p>
                        <strong>Identity No:</strong>{" "}
                        {selectedRequest.officerId}
                      </p>
                      <p>
                        <strong>Position:</strong>{" "}
                        {selectedRequest.officerPosition ===
                        "village_officer"
                          ? "Rural Development Officer"
                          : selectedRequest.officerPosition}
                      </p>
                      <p>
                        <strong>RDO Decision:</strong>{" "}
                        {selectedRequest.status}
                      </p>
                      <p>
                        <strong>RDO Note:</strong>{" "}
                        {selectedRequest.note || "N/A"}
                      </p>
                      <p>
                        <strong>Date:</strong> {selectedRequest.createdAt}
                      </p>

                      <div className="referral-form" style={{ marginTop: 10 }}>
                        <h4>District Officer Decision</h4>
                        <p className="muted-text">
                          දිස්ත්‍රික් මට්ටමේ තීරණය එක් වරක් පමණක් ලබා දිය
                          යුතුය. Accept / Decline තීරණයකින් අනතුරුව මෙම
                          ලේඛනය ප්‍රාදේශීය ලේකම් (DS) වෙත යොමු කළ හැක.
                        </p>

                        <label>District Officer Note</label>
                        <textarea
                          value={doNote}
                          onChange={(e) => setDoNote(e.target.value)}
                          rows={3}
                          placeholder="ඔබගේ සටහන / යෝජනාව මෙහි ලියා තබන්න..."
                          disabled={
                            selectedRequest.districtStatus === "AcceptedByDO" ||
                            selectedRequest.districtStatus === "DeclinedByDO" ||
                            selectedRequest.districtStatus ===
                              "ForwardedToSecretary"
                          }
                        />

                        {actionError && (
                          <p className="district-error">{actionError}</p>
                        )}
                        {actionSuccess && (
                          <p className="district-success">{actionSuccess}</p>
                        )}

                        {selectedRequest.districtStatus === "Pending" && (
                          <div
                            className="referral-actions"
                            style={{ marginTop: 8 }}
                          >
                            <button
                              type="button"
                              className="btn-decline"
                              disabled={actionLoading}
                              onClick={() => handleDoDecision("decline")}
                            >
                              {actionLoading ? "Processing..." : "Decline"}
                            </button>
                            <button
                              type="button"
                              className="btn-accept"
                              disabled={actionLoading}
                              onClick={() => handleDoDecision("accept")}
                            >
                              {actionLoading ? "Processing..." : "Accept"}
                            </button>
                          </div>
                        )}

                        {(selectedRequest.districtStatus === "AcceptedByDO" ||
                          selectedRequest.districtStatus ===
                            "DeclinedByDO" ||
                          selectedRequest.districtStatus ===
                            "ForwardedToSecretary") && (
                          <button
                            type="button"
                            className="btn-accept"
                            style={{ marginTop: 8 }}
                            disabled={
                              actionLoading ||
                              selectedRequest.districtStatus ===
                                "ForwardedToSecretary"
                            }
                            onClick={handleForwardToSecretary}
                          >
                            {actionLoading
                              ? "Forwarding..."
                              : selectedRequest.districtStatus ===
                                "ForwardedToSecretary"
                              ? "Already Forwarded to Secretary"
                              : "Forward to Divisional Secretary"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* 2. Requested References (list only) */}
          {activeTab === "requested" && (
            <section className="district-card">
              <h3 className="card-title">Requested / Forwarded References</h3>
              <p className="muted-text">
                මේ ලැයිස්තුවෙන් එකක් තෝරාගත් විට, එය &quot;Pending &
                Actions&quot; ටැබය තුළ විස්තර සහ තීරණ කොටසට විවෘත වේ.
              </p>

              {loadingRequests ? (
                <p className="muted-text">Loading requests...</p>
              ) : latestRequests.length === 0 ? (
                <p className="muted-text">Requests not available.</p>
              ) : (
                <ul className="letter-list">
                  {latestRequests.map((req) => (
                    <li
                      key={req.id}
                      className="letter-item"
                      onClick={() => handleSelectRequest(req)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <p className="letter-type">
                          <strong>{req.societyName}</strong> ({req.registerNo})
                        </p>
                        <p className="letter-sub">
                          Division: {req.division} | RDO: {req.officerName}
                        </p>
                        <p className="letter-sub">
                          DO Status: {req.districtStatus}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          req.status === "Accepted"
                            ? "badge-success"
                            : req.status === "Declined"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {req.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 3. HISTORY TAB */}
          {activeTab === "history" && (
            <section className="district-card">
              <h3 className="card-title">All Registration References History</h3>
              <p className="muted-text">
                RDO → DO → DS යන ක්‍රියාවලිය සම්බන්ධ ඔබගේ දිස්ත්‍රික්කයට අදාළ
                සම්පූර්ණ ඉතිහාසය මෙහි සටහන් වේ.
              </p>

              {loadingRequests ? (
                <p className="muted-text">Loading history...</p>
              ) : historyRequests.length === 0 ? (
                <p className="muted-text">No history records.</p>
              ) : (
                <ul className="letter-list">
                  {historyRequests.map((req) => (
                    <li
                      key={req.id}
                      className="letter-item"
                      onClick={() => handleSelectRequest(req)}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <p className="letter-type">
                          <strong>{req.societyName}</strong> ({req.registerNo})
                        </p>
                        <p className="letter-sub">
                          Division: {req.division} | RDO: {req.officerName}
                        </p>
                        <p className="letter-sub">Date: {req.createdAt}</p>
                        {req.note && (
                          <p className="letter-sub">RDO Note: {req.note}</p>
                        )}
                        {req.districtStatus &&
                          req.districtStatus !== "Pending" && (
                            <p className="letter-sub">
                              DO Status: {req.districtStatus}
                            </p>
                          )}
                      </div>
                      <span
                        className={`badge ${
                          req.status === "Accepted"
                            ? "badge-success"
                            : req.status === "Declined"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {req.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 4. ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <section className="district-card">
              <h3 className="card-title">දිස්ත්‍රික් මට්ටමේ විශ්ලේෂණය</h3>
              <p className="muted-text">
                පහත සංඛ්‍යාතයන් මගින් ඔබගේ දිස්ත්‍රික් මට්ටමේ ලියාපදිංචි
                ක්‍රියාවලිය ගැන සරල සාරාංශයක් ලබා ගත හැක.
              </p>

              <div className="do-analytics-grid">
                <div className="do-analytics-card">
                  <h4>සම්පූර්ණ Requests</h4>
                  <p className="do-analytics-number">{totalPending}</p>
                  <p className="do-analytics-label">
                    RDO මට්ටමේ සිට ඔබ වෙත ලැබුණු සමස්ත යොමු කිරීම්.
                  </p>
                </div>
                <div className="do-analytics-card">
                  <h4>RDO Accepted</h4>
                  <p className="do-analytics-number">{acceptedByRdoCount}</p>
                  <p className="do-analytics-label">
                    RDO මට්ටමේ &quot;Accepted&quot; ලෙස සලකන ලද ඉල්ලීම්
                    සංඛ්‍යාව.
                  </p>
                </div>
                <div className="do-analytics-card">
                  <h4>Forwarded to DS</h4>
                  <p className="do-analytics-number">
                    {forwardedToSecretaryCount}
                  </p>
                  <p className="do-analytics-label">
                    DS වෙත යොමු කරන ලද ලියාපදිංචි ලිපි සංඛ්‍යාව.
                  </p>
                </div>
                <div className="do-analytics-card">
                  <h4>History Records</h4>
                  <p className="do-analytics-number">{totalHistory}</p>
                  <p className="do-analytics-label">
                    ඔබගේ දිස්ත්‍රික්කය සම්බන්ධ සම්පූර්ණ ඉතිහාස ලිපි ගණන.
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

export default DistrictOfficer;