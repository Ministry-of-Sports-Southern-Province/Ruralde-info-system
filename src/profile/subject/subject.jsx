import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import "../subject/subject.css";
import { useNavigate } from "react-router-dom";

const Subject = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [subjectNote, setSubjectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const [activeTab, setActiveTab] = useState("pending");
  const [statusFilter, setStatusFilter] = useState("all");

  // ===== LOAD USER + SECRETARY REQUESTS =====
  useEffect(() => {
    const fetchUserAndData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User not found.");
          setLoadingUser(false);
          return;
        }

        const userData = userSnap.data();
        setUser(userData);
        setLoadingUser(false);

        setLoadingRequests(true);
        try {
          const secRef = collection(db, "secretaryRequests");
          const snap = await getDocs(secRef);

          const all = [];
          snap.forEach((reqDoc) => {
            const d = reqDoc.data();
            all.push({
              id: reqDoc.id,

              // area
              district: d.district || "N/A",
              division: d.division || "N/A",

              // society
              societyId: d.societyId || null,
              societyName: d.societyName || "Unnamed Society",
              registerNo: d.registerNo || "N/A",
              societyAddress: d.societyAddress || "N/A",
              societyPhone: d.societyPhone || "N/A",
              societyEmail: d.societyEmail || "N/A",
              memberCount:
                typeof d.memberCount === "number" ? d.memberCount : null,
              positions: d.positions || null,

              // Rural Development Officer
              ruralOfficerId: d.ruralOfficerId || "N/A",
              ruralOfficerName: d.ruralOfficerName || "Unknown RDO",
              ruralOfficerPosition: d.ruralOfficerPosition || "",
              ruralOfficerDecision: d.ruralOfficerDecision || "Pending",
              ruralOfficerNote: d.ruralOfficerNote || "",
              ruralDecisionAt:
                d.ruralDecisionAt && d.ruralDecisionAt.toDate
                  ? d.ruralDecisionAt.toDate().toLocaleString()
                  : "",

              // District Officer
              districtOfficerId: d.districtOfficerId || "N/A",
              districtOfficerName: d.districtOfficerName || "Unknown DO",
              districtOfficerEmail: d.districtOfficerEmail || "",
              districtDecision: d.districtDecision || "Pending",
              districtNote: d.districtNote || "",
              districtDecisionAt:
                d.districtDecisionAt && d.districtDecisionAt.toDate
                  ? d.districtDecisionAt.toDate().toLocaleString()
                  : "",

              // Divisional Secretary
              secretaryStatus: d.secretaryStatus || "Pending",
              secretaryNote: d.secretaryNote || "",
              secretaryDecisionAt:
                d.secretaryDecisionAt && d.secretaryDecisionAt.toDate
                  ? d.secretaryDecisionAt.toDate().toLocaleString()
                  : "",

              // Subject Officer
              subjectStatus: d.subjectStatus || "Pending",
              subjectNote: d.subjectNote || "",
              subjectDecisionAt:
                d.subjectDecisionAt && d.subjectDecisionAt.toDate
                  ? d.subjectDecisionAt.toDate().toLocaleString()
                  : "",

              // createdAt
              createdAt:
                d.createdAt && d.createdAt.toDate
                  ? d.createdAt.toDate().toLocaleString()
                  : "",

              _rawDistrictDecision: d.districtDecision || "Pending",
            });
          });

          all.sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

          setRequests(all);
        } catch (err) {
          console.error("Error loading secretaryRequests:", err);
          setError("Failed to load registration references.");
        } finally {
          setLoadingRequests(false);
        }
      } catch (err) {
        console.error("Error fetching subject officer:", err);
        setError("Failed to fetch user data.");
        setLoadingUser(false);
      }
    };

    fetchUserAndData();
  }, []);

  // ===== SIGN OUT MODAL =====
  const handleSignOutClick = () => setShowSignOutModal(true);
  const handleConfirmSignOut = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setShowSignOutModal(false);
    navigate("/login");
  };
  const handleCancelSignOut = () => setShowSignOutModal(false);

  // ===== BACK BUTTON =====
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/"); // fallback
    }
  };

  // ===== SELECT A REQUEST =====
  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setSubjectNote(req.subjectNote || "");
    setActionError("");
    setActionSuccess("");
    setActiveTab("pending");
  };

  // ===== SUBJECT OFFICER DECISION =====
  const handleSubjectDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.subjectStatus === "AcceptedBySubject" ||
      selectedRequest.subjectStatus === "RejectedBySubject" ||
      selectedRequest.subjectStatus === "ForwardedToDirector"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සඳහා ඔබගේ (විෂය නිලධාරී) තීරණය දැනටමත් ලබා දී ඇත."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      const docRef = doc(db, "secretaryRequests", selectedRequest.id);
      const newStatus =
        decision === "accept" ? "AcceptedBySubject" : "RejectedBySubject";

      const now = new Date();

      await updateDoc(docRef, {
        subjectStatus: newStatus,
        subjectNote: subjectNote || "",
        subjectDecisionAt: now,
      });

      const decisionAtStr = now.toLocaleString();

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                subjectStatus: newStatus,
                subjectNote,
                subjectDecisionAt: decisionAtStr,
              }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              subjectStatus: newStatus,
              subjectNote,
              subjectDecisionAt: decisionAtStr,
            }
          : prev
      );

      setActionSuccess(
        decision === "accept"
          ? "සමිතිය විෂය මට්ටමින් (අනුමත) ලෙස සලකනු ලැබීය."
          : "සමිතිය විෂය මට්ටමින් (ප්‍රත්‍යාකරණය) කරන ලදී."
      );
    } catch (err) {
      console.error("Error updating subject decision:", err);
      setActionError("විෂය භාර තීරණය සුරක්ෂිත කිරීමට නොහැකි විය.");
    } finally {
      setActionLoading(false);
    }
  };

  // ===== FORWARD TO DIRECTOR =====
  const handleForwardToDirector = async () => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.subjectStatus !== "AcceptedBySubject" &&
      selectedRequest.subjectStatus !== "RejectedBySubject"
    ) {
      setActionError(
        "කරුණාකර පළමුව Accept හෝ Reject තීරණයක් ලබා දී පසුව Director වෙත යොමු කරන්න."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      const docRef = doc(db, "secretaryRequests", selectedRequest.id);
      await updateDoc(docRef, { subjectStatus: "ForwardedToDirector" });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, subjectStatus: "ForwardedToDirector" }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev ? { ...prev, subjectStatus: "ForwardedToDirector" } : prev
      );

      setActionSuccess(
        "සමිතිය පිළිබඳ ලේඛනය Director වෙත යොමු කිරීම සාර්ථකයි."
      );
    } catch (err) {
      console.error("Error forwarding to director:", err);
      setActionError(
        "Director වෙත යොමු කිරීමේදී දෝෂයක් සිදු විය. නැවත උත්සහ කරන්න."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!user) return null;

  const allRequests = requests;

  const filteredRequests = allRequests.filter((r) => {
    if (statusFilter === "pending") return r.subjectStatus === "Pending";
    if (statusFilter === "accepted")
      return r.subjectStatus === "AcceptedBySubject";
    if (statusFilter === "rejected")
      return r.subjectStatus === "RejectedBySubject";
    if (statusFilter === "forwarded")
      return r.subjectStatus === "ForwardedToDirector";
    return true;
  });

  const historyRequests = allRequests;

  const totalAll = allRequests.length;
  const totalHistory = historyRequests.length;
  const acceptedCount = historyRequests.filter(
    (r) => r.subjectStatus === "AcceptedBySubject"
  ).length;
  const forwardedCount = historyRequests.filter(
    (r) => r.subjectStatus === "ForwardedToDirector"
  ).length;

  // Analytics
  let districtApprovedCount = 0;
  let districtRejectedCount = 0;
  let districtPendingCount = 0;

  const districtMap = {};

  historyRequests.forEach((r) => {
    const decision = (r._rawDistrictDecision || "Pending").toLowerCase();
    const districtName = r.district || "N/A";

    if (!districtMap[districtName]) {
      districtMap[districtName] = {
        district: districtName,
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      };
    }

    districtMap[districtName].total += 1;

    if (decision === "accept" || decision === "accepted") {
      districtApprovedCount += 1;
      districtMap[districtName].approved += 1;
    } else if (decision === "reject" || decision === "rejected") {
      districtRejectedCount += 1;
      districtMap[districtName].rejected += 1;
    } else {
      districtPendingCount += 1;
      districtMap[districtName].pending += 1;
    }
  });

  const districtAnalyticsRows = Object.values(districtMap).sort((a, b) =>
    a.district.localeCompare(b.district)
  );

  const roleLabel = user.position || "විෂය භාර නිලධාරී";

  return (
    <div className="subject-dashboard">
      {/* SIGN OUT MODAL */}
      {showSignOutModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Sign Out</h3>
            <p className="modal-message">
              ඔබගේ ගිනුමෙන් ඉවත්වීමට බලාපොරොත්තුද?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={handleCancelSignOut}
              >
                නැවත Dashboard හි පවතින්න
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={handleConfirmSignOut}
              >
                ඔව්, Sign Out වන්න
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="subject-shell">
        {/* ===== SIDEBAR (desktop) ===== */}
        <aside className="subject-sidebar">
          <div className="sidebar-header">
            <div>
              <h2 className="sidebar-title">Subject Officer Dashboard</h2>
              <p className="sidebar-subtitle">
                දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
              </p>
            </div>
            <button className="signout-btn" onClick={handleSignOutClick}>
              Sign Out
            </button>
          </div>

          <div className="sidebar-profile-card">
            <div className="sidebar-avatar">
              <img
                src={user.photoURL || "https://via.placeholder.com/120"}
                alt="Profile"
              />
            </div>
            <h2 className="sidebar-name">{user.username}</h2>
            <p className="sidebar-role-main">{roleLabel}</p>
            <p className="sidebar-role-sub">
              විෂය භාර නිලධාරී – {user.district || "සියලුම"} දිස්ත්‍රික්කය
            </p>

            <p className="sidebar-area-tag">
              {user.district || "සියලුම"} / {user.division || "සියලුම"}{" "}
              ප්‍රා.ලේ.
            </p>

            <div className="sidebar-info-card">
              <button
                type="button"
                className="sidebar-info-toggle"
                onClick={() => setShowSensitiveInfo((s) => !s)}
              >
                <span>පෞද්ගලික තොරතුරු (Profile Info)</span>
                <span>{showSensitiveInfo ? "▴" : "▾"}</span>
              </button>

              {showSensitiveInfo && (
                <div className="sidebar-info-body">
                  <p>
                    <strong>ජාතික හැඳුනුම්පත් අංකය:</strong>{" "}
                    {user.identitynumber || "N/A"}
                  </p>
                  <p>
                    <strong>දුරකථන අංකය:</strong>{" "}
                    {user.contactnumber || "N/A"}
                  </p>
                  <p>
                    <strong>ඊමේල් ලිපිනය:</strong> {user.email || "N/A"}
                  </p>
                  <p>
                    <strong>දිස්ත්‍රික්කය:</strong> {user.district || "N/A"}
                  </p>
                  <p>
                    <strong>ප්‍රා.ලේ. කොට්ඨාසය:</strong>{" "}
                    {user.division || "N/A"}
                  </p>
                  <p>
                    <strong>Assigned Society:</strong>{" "}
                    {user.society || "Not Assigned"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">සම්පූර්ණ ලියාපදිංචි</p>
              <p className="stat-value">{totalAll}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">විෂය මට්ටමින් අනුමත</p>
              <p className="stat-value">{acceptedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Director වෙත යොමු කළ</p>
              <p className="stat-value">{forwardedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>ඔබගේ භූමිකාව</h4>
            <ul>
              <li>RDO, DO, DS තීරණ මුලින්ම සලකා බලන්න.</li>
              <li>Accept / Reject තීරණය ලබා දෙන්න.</li>
              <li>අවසානයේ Director වෙත යොමු කිරීම.</li>
            </ul>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="subject-main">
          {/* MOBILE BACK ROW + PROFILE CARD */}
          <div className="subject-mobile-back-row">
            <button
              type="button"
              className="mobile-back-btn"
              onClick={handleBack}
            >
              ◀ Back
            </button>
          </div>

          <div className="subject-mobile-header-card">
            <div className="subject-mobile-header-left">
              <div className="subject-mobile-header-avatar">
                <img
                  src={user.photoURL || "https://via.placeholder.com/80"}
                  alt="Profile"
                />
              </div>
              <div className="subject-mobile-header-text">
                <p className="subject-mobile-header-name">{user.username}</p>
                <p className="subject-mobile-header-role">{roleLabel}</p>
                <p className="subject-mobile-header-area">
                  {user.district || "සියලුම"} / {user.division || "සියලුම"}{" "}
                  ප්‍රා.ලේ.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="mobile-header-signout-btn"
              onClick={handleSignOutClick}
            >
              Sign Out
            </button>
          </div>

          {/* Tabs */}
          <div className="sub-tab-bar">
            <button
              className={`sub-tab-item ${
                activeTab === "pending" ? "sub-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Applications & Actions
            </button>
            <button
              className={`sub-tab-item ${
                activeTab === "history" ? "sub-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`sub-tab-item ${
                activeTab === "analytics" ? "sub-tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Header under tabs */}
          <div className="sub-main-header">
            <h1 className="sub-main-title">සමිති ලියාපදිංචි කළමනාකරණය</h1>
            <p className="sub-main-subtitle">
              RDO → District Officer → Divisional Secretary මඟින් සම්පූර්ණ කර
              ඔබගේ විෂය භාර තීරණය බලා සිටින ලියාපදිංචි ඉල්ලීම් මෙහි
              පෙන්වයි.
            </p>
          </div>

          {/* ===== PENDING TAB ===== */}
          {activeTab === "pending" && (
            <>
              <div className="subject-status-filter">
                <button
                  className={`status-chip ${
                    statusFilter === "all" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({totalAll})
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "pending" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending (
                  {
                    allRequests.filter(
                      (r) => r.subjectStatus === "Pending"
                    ).length
                  }
                  )
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "accepted" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("accepted")}
                >
                  Accepted (
                  {
                    allRequests.filter(
                      (r) => r.subjectStatus === "AcceptedBySubject"
                    ).length
                  }
                  )
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "rejected" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("rejected")}
                >
                  Rejected (
                  {
                    allRequests.filter(
                      (r) => r.subjectStatus === "RejectedBySubject"
                    ).length
                  }
                  )
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "forwarded" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("forwarded")}
                >
                  Forwarded (
                  {
                    allRequests.filter(
                      (r) => r.subjectStatus === "ForwardedToDirector"
                    ).length
                  }
                  )
                </button>
              </div>

              <section className="subject-grid">
                <div className="sub-widget">
                  <h3 className="widget-title">සමිති ලියාපදිංචි ලිපි</h3>
                  <p className="muted-text">
                    ලැයිස්තුව මගින් ඉල්ලීම් තෝරාගෙන විස්තර බලන්න.
                  </p>
                  {loadingRequests ? (
                    <p className="muted-text">
                      ලියාපදිංචි ඉල්ලීම් රදිමින්...
                    </p>
                  ) : filteredRequests.length === 0 ? (
                    <p className="muted-text">
                      මෙම කොටසට අදාළ ලියාපදිංචි ලිපි හමු නොවිනි.
                    </p>
                  ) : (
                    <ul className="letter-list">
                      {filteredRequests.map((req) => (
                        <li
                          key={req.id}
                          className="letter-item"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectRequest(req)}
                        >
                          <div>
                            <p className="letter-type">
                              <strong>{req.societyName}</strong> (
                              {req.registerNo})
                            </p>
                            <p className="letter-sub">
                              දිස්ත්‍රික්කය: {req.district} | ප්‍රා.ලේ.:{" "}
                              {req.division}
                            </p>
                            <p className="letter-sub">
                              Created: {req.createdAt}
                            </p>
                            <p className="letter-sub">
                              DS Status: {req.secretaryStatus}
                            </p>
                            {req.subjectStatus !== "Pending" && (
                              <p className="letter-sub">
                                Subject Status: {req.subjectStatus}
                              </p>
                            )}
                          </div>
                          <span
                            className={`badge ${
                              req.subjectStatus === "AcceptedBySubject"
                                ? "badge-success"
                                : req.subjectStatus === "RejectedBySubject"
                                ? "badge-danger"
                                : req.subjectStatus === "ForwardedToDirector"
                                ? "badge-warning"
                                : "badge-info"
                            }`}
                          >
                            {req.subjectStatus}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="sub-widget">
                  <h3 className="widget-title">විෂය නිලධාරී මගපෙන්වීම</h3>
                  <p className="muted-text">
                    • ඉල්ලීම තෝරන්න → RDO/DO/DS තීරණ බලන්න.
                    <br />
                    • Subject Officer Action කොටසෙන් Accept / Reject.
                    <br />
                    • අවසානයේ Forward to Director.
                  </p>
                </div>
              </section>

              {selectedRequest && (
                <section className="subject-detail-card">
                  <div className="detail-header">
                    <h3 className="widget-title">
                      {selectedRequest.societyName} – විස්තර / තීරණය
                    </h3>
                    <button
                      type="button"
                      className="btn-close-referral"
                      onClick={() => {
                        setSelectedRequest(null);
                        setSubjectNote("");
                        setActionError("");
                        setActionSuccess("");
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="detail-body">
                    <div className="detail-column">
                      <div className="society-card">
                        <h4>සමිතිය සම්බන්ධ තොරතුරු</h4>
                        <p>
                          <strong>ලියාපදිංචි අංකය:</strong>{" "}
                          {selectedRequest.registerNo}
                        </p>
                        <p>
                          <strong>ලිපිනය:</strong>{" "}
                          {selectedRequest.societyAddress}
                        </p>
                        <p>
                          <strong>දුරකථන:</strong>{" "}
                          {selectedRequest.societyPhone}
                        </p>
                        <p>
                          <strong>ඊමේල්:</strong>{" "}
                          {selectedRequest.societyEmail}
                        </p>
                        <p>
                          <strong>සාමාජික සංඛ්‍යාව:</strong>{" "}
                          {selectedRequest.memberCount ?? "N/A"}
                        </p>
                        <p>
                          <strong>දිස්ත්‍රික් / ප්‍රා.ලේ.:</strong>{" "}
                          {selectedRequest.district} /{" "}
                          {selectedRequest.division}
                        </p>
                      </div>

                      <div className="positions-card">
                        <h4>තනතුරු (Positions)</h4>
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
                    </div>

                    <div className="detail-column">
                      <div className="approval-chain">
                        <h4>අනුමැතිය / පියවර වල සටහන්</h4>

                        <div className="chain-step">
                          <h5>Rural Development Officer</h5>
                          <p>
                            <strong>නම:</strong>{" "}
                            {selectedRequest.ruralOfficerName} (
                            {selectedRequest.ruralOfficerId})
                          </p>
                          <p>
                            <strong>තනතුර:</strong>{" "}
                            {selectedRequest.ruralOfficerPosition ||
                              "Rural Development Officer"}
                          </p>
                          <p>
                            <strong>තීරණය:</strong>{" "}
                            {selectedRequest.ruralOfficerDecision}
                          </p>
                          {selectedRequest.ruralOfficerNote && (
                            <p>
                              <strong>Note:</strong>{" "}
                              {selectedRequest.ruralOfficerNote}
                            </p>
                          )}
                          <p>
                            <strong>දිනය:</strong>{" "}
                            {selectedRequest.ruralDecisionAt || "N/A"}
                          </p>
                        </div>

                        <div className="chain-step">
                          <h5>District Officer</h5>
                          <p>
                            <strong>නම:</strong>{" "}
                            {selectedRequest.districtOfficerName} (
                            {selectedRequest.districtOfficerId})
                          </p>
                          <p>
                            <strong>ඊමේල්:</strong>{" "}
                            {selectedRequest.districtOfficerEmail || "N/A"}
                          </p>
                          <p>
                            <strong>තීරණය:</strong>{" "}
                            {selectedRequest.districtDecision}
                          </p>
                          {selectedRequest.districtNote && (
                            <p>
                              <strong>Note:</strong>{" "}
                              {selectedRequest.districtNote}
                            </p>
                          )}
                          <p>
                            <strong>දිනය:</strong>{" "}
                            {selectedRequest.districtDecisionAt || "N/A"}
                          </p>
                        </div>

                        <div className="chain-step">
                          <h5>Divisional Secretary</h5>
                          <p>
                            <strong>තීරණය:</strong>{" "}
                            {selectedRequest.secretaryStatus}
                          </p>
                          {selectedRequest.secretaryNote && (
                            <p>
                              <strong>Note:</strong>{" "}
                              {selectedRequest.secretaryNote}
                            </p>
                          )}
                          <p>
                            <strong>දිනය:</strong>{" "}
                            {selectedRequest.secretaryDecisionAt || "N/A"}
                          </p>
                        </div>

                        <div className="chain-step subject-step">
                          <h5>Subject Officer</h5>
                          <p>
                            <strong>ඔබගේ තීරණය:</strong>{" "}
                            {selectedRequest.subjectStatus}
                          </p>
                          {selectedRequest.subjectNote && (
                            <p>
                              <strong>ඔබගේ සටහන:</strong>{" "}
                              {selectedRequest.subjectNote}
                            </p>
                          )}
                          <p>
                            <strong>දිනය:</strong>{" "}
                            {selectedRequest.subjectDecisionAt || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="referral-form subject-action-card">
                        <h4>Subject Officer Action</h4>
                        <p className="muted-text">
                          මෙය ඔබගේ විෂය භාර නිල තීරණය ලබා දෙන කොටසයි.
                        </p>

                        <label>විෂය නිලධාරී සටහන</label>
                        <textarea
                          value={subjectNote}
                          onChange={(e) => setSubjectNote(e.target.value)}
                          rows={3}
                          placeholder="ඔබගේ සටහන මෙහි ලියා තබන්න..."
                          disabled={
                            selectedRequest.subjectStatus ===
                              "AcceptedBySubject" ||
                            selectedRequest.subjectStatus ===
                              "RejectedBySubject" ||
                            selectedRequest.subjectStatus ===
                              "ForwardedToDirector"
                          }
                        />

                        {actionError && (
                          <p className="error-text">{actionError}</p>
                        )}
                        {actionSuccess && (
                          <p className="success-text">{actionSuccess}</p>
                        )}

                        {selectedRequest.subjectStatus === "Pending" && (
                          <div
                            className="referral-actions"
                            style={{ marginTop: 8 }}
                          >
                            <button
                              type="button"
                              className="btn-decline"
                              disabled={actionLoading}
                              onClick={() => handleSubjectDecision("reject")}
                            >
                              {actionLoading ? "Processing..." : "Reject"}
                            </button>
                            <button
                              type="button"
                              className="btn-accept"
                              disabled={actionLoading}
                              onClick={() => handleSubjectDecision("accept")}
                            >
                              {actionLoading ? "Processing..." : "Accept"}
                            </button>
                          </div>
                        )}

                        {(selectedRequest.subjectStatus ===
                          "AcceptedBySubject" ||
                          selectedRequest.subjectStatus ===
                            "RejectedBySubject" ||
                          selectedRequest.subjectStatus ===
                            "ForwardedToDirector") && (
                          <button
                            type="button"
                            className="btn-accept forward-btn"
                            disabled={
                              actionLoading ||
                              selectedRequest.subjectStatus ===
                                "ForwardedToDirector"
                            }
                            onClick={handleForwardToDirector}
                          >
                            {actionLoading
                              ? "Forwarding..."
                              : selectedRequest.subjectStatus ===
                                "ForwardedToDirector"
                              ? "Already Forwarded to Director"
                              : "Forward to Director"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ===== HISTORY TAB ===== */}
          {activeTab === "history" && (
            <section className="sub-widget">
              <h3 className="widget-title">Registration History</h3>
              <p className="muted-text">
                ඔබ විසින් දැක ගත් / තීරණය කළ සියලුම ලියාපදිංචි ඉල්ලීම්
                මෙහිදි සටහන් වේ.
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
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setActiveTab("pending");
                        handleSelectRequest(req);
                      }}
                    >
                      <div>
                        <p className="letter-type">
                          <strong>{req.societyName}</strong> ({req.registerNo})
                        </p>
                        <p className="letter-sub">
                          දිස්ත්‍රික්කය: {req.district} | ප්‍රා.ලේ.:{" "}
                          {req.division}
                        </p>
                        <p className="letter-sub">
                          Created: {req.createdAt}
                        </p>
                        {req.subjectStatus !== "Pending" && (
                          <p className="letter-sub">
                            Subject Status: {req.subjectStatus}
                          </p>
                        )}
                      </div>
                      <span
                        className={`badge ${
                          req.subjectStatus === "AcceptedBySubject"
                            ? "badge-success"
                            : req.subjectStatus === "RejectedBySubject"
                            ? "badge-danger"
                            : req.subjectStatus === "ForwardedToDirector"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {req.subjectStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* ===== ANALYTICS TAB ===== */}
          {activeTab === "analytics" && (
            <section className="sub-widget">
              <h3 className="widget-title">විෂය මට්ටමේ විශ්ලේෂණය</h3>
              <p className="muted-text">
                පහත සංඛ්‍යාතයන් මගින් ඔබගේ වත්මන් කාර්ය භාරය සහ දිස්ත්‍රික්
                මට්ටමේ තීරණ පිළිබඳ දර්ශනයක් ලබා ගත හැක.
              </p>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>සම්පූර්ණ ලියාපදිංචි</h4>
                  <p className="analytics-number">{totalAll}</p>
                  <p className="analytics-label">
                    දැනට පද්ධතිය තුළ තිබෙන ලියාපදිංචි ඉල්ලීම් සංඛ්‍යාව.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>විෂය මට්ටමින් අනුමත</h4>
                  <p className="analytics-number">{acceptedCount}</p>
                  <p className="analytics-label">
                    ඔබ විසින් &quot;Accepted&quot; ලෙස සලකන ලද සමිති
                    සංඛ්‍යාව.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>Director වෙත යොමු කළ</h4>
                  <p className="analytics-number">{forwardedCount}</p>
                  <p className="analytics-label">
                    ලියාපදිංචි කිරීම අවසන් කිරීමට Director වෙත යොමු කළ
                    ලිපි.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>History</h4>
                  <p className="analytics-number">{totalHistory}</p>
                  <p className="analytics-label">
                    ඔබගේ සෙසු ක්‍රියාවලිය පිළිබඳ සම්පූර්ණ ඉතිහාසය.
                  </p>
                </div>
              </div>

              <div className="analytics-grid" style={{ marginTop: 24 }}>
                <div className="analytics-card">
                  <h4>දිස්ත්‍රික් මට්ටමේ අනුමත</h4>
                  <p className="analytics-number">{districtApprovedCount}</p>
                  <p className="analytics-label">
                    District Officer මට්ටමේ &quot;Accept&quot; වූ ඉල්ලීම්
                    ගණන.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>දිස්ත්‍රික් මට්ටමේ ප්‍රත්‍යාකරණ</h4>
                  <p className="analytics-number">{districtRejectedCount}</p>
                  <p className="analytics-label">
                    District Officer මට්ටමේ &quot;Reject&quot; වූ ඉල්ලීම්
                    ගණන.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>දිස්ත්‍රික් මට්ටමේ Pending</h4>
                  <p className="analytics-number">{districtPendingCount}</p>
                  <p className="analytics-label">
                    තවමත් District Officer තීරණය නොලබා ඇති ඉල්ලීම්.
                  </p>
                </div>
              </div>

              <div className="district-analytics-table">
                <h4 style={{ marginTop: 24 }}>District Approval Breakdown</h4>
                {districtAnalyticsRows.length === 0 ? (
                  <p className="muted-text">No district data available.</p>
                ) : (
                  <div className="district-table-wrapper">
                    <div className="district-table-header">
                      <span>District</span>
                      <span>Total</span>
                      <span>Approved</span>
                      <span>Rejected</span>
                      <span>Pending</span>
                    </div>
                    {districtAnalyticsRows.map((row) => (
                      <div
                        key={row.district}
                        className="district-table-row"
                      >
                        <span>{row.district}</span>
                        <span>{row.total}</span>
                        <span>{row.approved}</span>
                        <span>{row.rejected}</span>
                        <span>{row.pending}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
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

export default Subject;