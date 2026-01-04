import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import "./chairmanprofile.css";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const ChairmanProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [directorNote, setDirectorNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Tabs: pending | requested | certificates | history | analytics
  const [activeTab, setActiveTab] = useState("pending");

  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | accepted | rejected

  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  const certificateRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
    documentTitle: "Society-Registration-Certificate",
  });

  const [previewRequest, setPreviewRequest] = useState(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingUser(false);
        return;
      }

      try {
        // 1) Load Director user
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

        // 2) Load registrations forwarded to Director
        setLoadingRequests(true);
        try {
          const secRef = collection(db, "secretaryRequests");
          const qSec = query(
            secRef,
            where("subjectStatus", "==", "ForwardedToDirector")
          );
          const snap = await getDocs(qSec);

          const all = [];
          snap.forEach((reqDoc) => {
            const d = reqDoc.data();
            all.push({
              id: reqDoc.id,

              district: d.district || "N/A",
              division: d.division || "N/A",

              societyId: d.societyId || null,
              societyName: d.societyName || "Unnamed Society",
              registerNo: d.registerNo || "N/A",
              societyAddress: d.societyAddress || "N/A",
              societyPhone: d.societyPhone || "N/A",
              societyEmail: d.societyEmail || "N/A",
              memberCount:
                typeof d.memberCount === "number" ? d.memberCount : null,
              positions: d.positions || null,

              // RDO
              ruralOfficerName: d.ruralOfficerName || "Unknown RDO",
              ruralOfficerId: d.ruralOfficerId || "N/A",
              ruralOfficerDecision: d.ruralOfficerDecision || "Pending",
              ruralDecisionAt:
                d.ruralDecisionAt && d.ruralDecisionAt.toDate
                  ? d.ruralDecisionAt.toDate().toLocaleString()
                  : "",

              // DO
              districtOfficerName: d.districtOfficerName || "Unknown DO",
              districtOfficerId: d.districtOfficerId || "N/A",
              districtDecision: d.districtDecision || "Pending",
              districtDecisionAt:
                d.districtDecisionAt && d.districtDecisionAt.toDate
                  ? d.districtDecisionAt.toDate().toLocaleString()
                  : "",

              // DS
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

              // Director decision
              directorStatus: d.directorStatus || "Pending",
              directorNote: d.directorNote || "",
              directorDecisionAt:
                d.directorDecisionAt && d.directorDecisionAt.toDate
                  ? d.directorDecisionAt.toDate().toLocaleString()
                  : "",

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
          console.error("Error loading forwarded registrations:", err);
          setError("Failed to load forwarded registrations.");
        } finally {
          setLoadingRequests(false);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to fetch user data.");
        setLoadingUser(false);
      }
    };

    fetchUserAndData();
  }, []);

  const handleSignOut = () => {
    const confirmed = window.confirm("Do you really want to sign out?");
    if (!confirmed) return;

    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setDirectorNote(req.directorNote || "");
    setActionError("");
    setActionSuccess("");
    setActiveTab("pending");
  };

  const handleDirectorDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.directorStatus === "AcceptedByDirector" ||
      selectedRequest.directorStatus === "RejectedByDirector"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සඳහා අධ්‍යක්ෂක තීරණය දැනටමත් ලබාදී ඇත."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      const docRef = doc(db, "secretaryRequests", selectedRequest.id);
      const newStatus =
        decision === "accept" ? "AcceptedByDirector" : "RejectedByDirector";
      const now = new Date();

      await updateDoc(docRef, {
        directorStatus: newStatus,
        directorNote: directorNote || "",
        directorDecisionAt: now,
      });

      const decisionAtStr = now.toLocaleString();

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                directorStatus: newStatus,
                directorNote: directorNote || "",
                directorDecisionAt: decisionAtStr,
              }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              directorStatus: newStatus,
              directorNote: directorNote || "",
              directorDecisionAt: decisionAtStr,
            }
          : prev
      );

      setActionSuccess(
        decision === "accept"
          ? "සමිතිය අවසන්ව (අනුමත) ලෙස ලියාපදිංචි කරන ලදී."
          : "සමිතිය (ප්‍රත්‍යාකරණය) කරන ලදී."
      );
    } catch (err) {
      console.error("Error updating director decision:", err);
      setActionError("අධ්‍යක්ෂක තීරණය සුරක්ෂිත කිරීමට නොහැකි විය.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser)
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!user) return <p style={{ textAlign: "center" }}>User not found</p>;

  const latestRequests = requests;

  const acceptedRequests = requests.filter(
    (r) => r.directorStatus === "AcceptedByDirector"
  );
  const pendingRequests = requests.filter(
    (r) => r.directorStatus === "Pending"
  );
  const rejectedRequests = requests.filter(
    (r) => r.directorStatus === "RejectedByDirector"
  );

  const totalForwarded = requests.length;

  const canGenerateCertificate =
    selectedRequest && selectedRequest.directorStatus === "AcceptedByDirector";

  // ===== DISTRICT-WISE ANALYTICS FOR DIRECTOR =====
  const districtStatsMap = requests.reduce((acc, r) => {
    const key = r.district || "N/A";
    if (!acc[key]) {
      acc[key] = { total: 0, accepted: 0, pending: 0, rejected: 0 };
    }
    acc[key].total += 1;
    if (r.directorStatus === "AcceptedByDirector") acc[key].accepted += 1;
    else if (r.directorStatus === "RejectedByDirector") acc[key].rejected += 1;
    else acc[key].pending += 1;
    return acc;
  }, {});

  const districtStats = Object.entries(districtStatsMap).map(
    ([districtName, stats]) => ({
      districtName,
      ...stats,
    })
  );

  const maxTotalForBar =
    districtStats.length > 0
      ? Math.max(...districtStats.map((d) => d.total))
      : 1;

  const fullName =
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username) || "Director";

  // apply status filter for main list
  const filteredRequests = latestRequests.filter((r) => {
    if (statusFilter === "pending") return r.directorStatus === "Pending";
    if (statusFilter === "accepted")
      return r.directorStatus === "AcceptedByDirector";
    if (statusFilter === "rejected")
      return r.directorStatus === "RejectedByDirector";
    return true; // all
  });

  return (
    <div className="chairman-dashboard">
      <div className="dashboard-shell">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <div>
              <h2 className="sidebar-title">Director Dashboard</h2>
              <p className="sidebar-subtitle">
                දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
              </p>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
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
            <h2 className="sidebar-name">{fullName}</h2>
            <p className="sidebar-role-main">
              {user.position || "අධ්‍යක්ෂක"}
            </p>
            <p className="sidebar-role-sub">
              පලාත් සංවර්ධන අධ්‍යක්ෂක – {user.district || "සියලුම"} දිස්ත්‍රික්කය
            </p>

            <p className="sidebar-area-tag">
              {user.district || "සියලුම"} / {user.division || "සියලුම"}{" "}
              ප්‍රා.ලේ. කොට්ඨාස
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
                    <strong>දිස්ත්‍රික්කය:</strong> {user.district || "All"}
                  </p>
                  <p>
                    <strong>ප්‍රාදේශීය ලේකම් කොට්ඨාසය:</strong>{" "}
                    {user.division || "All"}
                  </p>
                  {user.positionStartDate && (
                    <p>
                      <strong>තනතුර භාරගත් දිනය:</strong>{" "}
                      {user.positionStartDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Forwarded</p>
              <p className="stat-value">{totalForwarded}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Accepted</p>
              <p className="stat-value">{acceptedRequests.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{pendingRequests.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{rejectedRequests.length}</p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>ප්‍රධාන වගකීම්</h4>
            <ul>
              <li>ග්‍රාම සංවර්ධන සමිති අවසන්ව ලියාපදිංචි කිරීම.</li>
              <li>ලියාපදිංචි සහතික නිකුත් කිරීම.</li>
              <li>
                දිස්ත්‍රික්ක හා ප්‍රාදේශීය මට්ටමේ වැඩසටහන් සම්බන්ධ දේශපාලන
                රහිත පාලනය.
              </li>
            </ul>
          </div>
        </aside>

        {/* ===== RIGHT MAIN DASHBOARD ===== */}
        <main className="dashboard-main">
          {/* Tabs at top */}
          <div className="tab-bar">
            <button
              className={`tab-item ${
                activeTab === "pending" ? "tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending & Actions
            </button>
            <button
              className={`tab-item ${
                activeTab === "requested" ? "tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("requested")}
            >
              All Forwarded
            </button>
            <button
              className={`tab-item ${
                activeTab === "certificates" ? "tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("certificates")}
            >
              Certificates
            </button>
            <button
              className={`tab-item ${
                activeTab === "history" ? "tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button
              className={`tab-item ${
                activeTab === "analytics" ? "tab-item-active" : ""
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Main header under tabs */}
          <div className="main-header">
            <div>
              <h1 className="main-title">
                ග්‍රාම සංවර්ධන සමිති ලියාපදිංචි කිරීම
              </h1>
              <p className="main-subtitle">
                මෙහි ඇති සියලුම ඉල්ලීම් ග්‍රාම නිලධාරී, දිස්ත්‍රික් ලේකම්,
                ප්‍රාදේශීය ලේකම් හා විෂය අංශ නිලධාරී මට්ටම් පියවර සම්පූර්ණ කර
                අවසන් දේශීය තීරණය සඳහා අධ්‍යක්ෂවරයා වෙත එවනු ලැබූ ය.
              </p>
            </div>
          </div>

          {/* Small context widgets */}
          <section className="dashboard-grid">
            <div className="dash-widget">
              <h3 className="widget-title">ඔබගේ කාර්ය භාරය</h3>
              <p className="muted-text">
                • &quot;Pending & Actions&quot; ටැබය මගින් තවම අනුමති ලබා
                දෙනලද නොවන ඉල්ලීම් විවෘත කර Accept / Reject කළ හැක.<br />
                • &quot;Certificates&quot; ටැබය මගින් දැනටමත් අනුමත වූ
                සමිතිවල ලියාපදිංචි සහතික බාගත කරගත හැක.<br />
                • ඉතිහාසය හා විශ්ලේෂණ ටැබ මගින් සමස්ත ක්‍රියාවලිය සැලකිල්ලට
                ගත හැක.
              </p>
            </div>
            <div className="dash-widget">
              <h3 className="widget-title">
                වහාම දැනගත යුතු සංක්ෂිප්ත තොරතුරු
              </h3>
              <div className="profile-summary-grid">
                <div>
                  <p className="summary-label">සම්පූර්ණ ඉදිරිපත් කිරීම්</p>
                  <p className="summary-value">{totalForwarded}</p>
                </div>
                <div>
                  <p className="summary-label">අනුමත සමිති</p>
                  <p className="summary-value">{acceptedRequests.length}</p>
                </div>
                <div>
                  <p className="summary-label">අපේක්ෂිත (Pending)</p>
                  <p className="summary-value">{pendingRequests.length}</p>
                </div>
                <div>
                  <p className="summary-label">ප්‍රත්‍යාකරණ</p>
                  <p className="summary-value">{rejectedRequests.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========== TAB CONTENTS ========== */}

          {/* 1. PENDING & ACTIONS */}
          {activeTab === "pending" && (
            <>
              {/* Status filter chips for directorStatus */}
              <div className="subject-status-filter">
                <button
                  className={`status-chip ${
                    statusFilter === "all" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({latestRequests.length})
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "pending" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending ({pendingRequests.length})
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "accepted" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("accepted")}
                >
                  Accepted ({acceptedRequests.length})
                </button>
                <button
                  className={`status-chip ${
                    statusFilter === "rejected" ? "status-chip-active" : ""
                  }`}
                  onClick={() => setStatusFilter("rejected")}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              </div>

              <section className="dash-widget">
                <h3 className="widget-title">සමිති ලියාපදිංචි ඉල්ලීම්</h3>
                <p className="muted-text">
                  පහත ලැයිස්තුවෙන් එකක් තෝරාගෙන එහි විස්තර බැලී Accept හෝ
                  Reject කිරීම සිදු කරන්න. ඔබගේ තීරණය එක් වරක් පමණක්
                  ලබා දිය යුතුය.
                </p>
                {loadingRequests ? (
                  <p className="muted-text">ලියාපදිංචි ඉල්ලීම් රදිමින්...</p>
                ) : filteredRequests.length === 0 ? (
                  <p className="muted-text">
                    දැනට ඔබ වෙත යොමු වූ ඉල්ලීම් නොමැත.
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
                            Subject Status: {req.subjectStatus}
                          </p>
                          <p className="letter-sub">
                            Director Status: {req.directorStatus}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            req.directorStatus === "AcceptedByDirector"
                              ? "badge-success"
                              : req.directorStatus === "RejectedByDirector"
                              ? "badge-danger"
                              : "badge-info"
                          }`}
                        >
                          {req.directorStatus}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {selectedRequest && (
                <>
                  <section className="director-detail-card">
                    <div className="detail-header">
                      <h3 className="widget-title">
                        {selectedRequest.societyName} – විස්තර / තීරණය
                      </h3>
                      <button
                        type="button"
                        className="btn-close-referral"
                        onClick={() => {
                          setSelectedRequest(null);
                          setDirectorNote("");
                          setActionError("");
                          setActionSuccess("");
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="detail-body">
                      {/* Society info */}
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
                            <strong>දිස්ත්‍රික් / ප්‍රා.ලේ. කොට්ඨාසය:</strong>{" "}
                            {selectedRequest.district} /{" "}
                            {selectedRequest.division}
                          </p>
                        </div>
                      </div>

                      {/* Approval chain + Director decision */}
                      <div className="detail-column">
                        <div className="approval-chain">
                          <h4>අනුමැතිය ලබා ගත් පියවර</h4>

                          <div className="chain-step">
                            <h5>Rural Development Officer</h5>
                            <p>
                              <strong>නම:</strong>{" "}
                              {selectedRequest.ruralOfficerName} (
                              {selectedRequest.ruralOfficerId})
                            </p>
                            <p>
                              <strong>තීරණය:</strong>{" "}
                              {selectedRequest.ruralOfficerDecision}
                            </p>
                            {selectedRequest.ruralDecisionAt && (
                              <p>
                                <strong>දිනය:</strong>{" "}
                                {selectedRequest.ruralDecisionAt}
                              </p>
                            )}
                          </div>

                          <div className="chain-step">
                            <h5>District Officer</h5>
                            <p>
                              <strong>නම:</strong>{" "}
                              {selectedRequest.districtOfficerName} (
                              {selectedRequest.districtOfficerId})
                            </p>
                            <p>
                              <strong>තීරණය:</strong>{" "}
                              {selectedRequest.districtDecision}
                            </p>
                            {selectedRequest.districtDecisionAt && (
                              <p>
                                <strong>දිනය:</strong>{" "}
                                {selectedRequest.districtDecisionAt}
                              </p>
                            )}
                          </div>

                          <div className="chain-step">
                            <h5>Divisional Secretary</h5>
                            <p>
                              <strong>තීරණය:</strong>{" "}
                              {selectedRequest.secretaryStatus}
                            </p>
                            {selectedRequest.secretaryDecisionAt && (
                              <p>
                                <strong>දිනය:</strong>{" "}
                                {selectedRequest.secretaryDecisionAt}
                              </p>
                            )}
                          </div>

                          <div className="chain-step">
                            <h5>Subject Officer</h5>
                            <p>
                              <strong>තීරණය:</strong>{" "}
                              {selectedRequest.subjectStatus}
                            </p>
                            {selectedRequest.subjectDecisionAt && (
                              <p>
                                <strong>දිනය:</strong>{" "}
                                {selectedRequest.subjectDecisionAt}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="director-decision-card">
                          <h4>අධ්‍යක්ෂවරයාගේ අවසන් තීරණය</h4>
                          <p className="muted-text">
                            මෙහි දී Accept / Reject එකක් තෝරාගන්න. එකම
                            ඉල්ලීමක සදහා අධ්‍යක්ෂවරයාගේ තීරණය එක් වරක්
                            පමණක් ලබා දිය යුතුය. Accept කළ පසු ලියාපදිංචි
                            සහතිකය (PDF) බාගත කරගත හැක.
                          </p>

                          <label>අධ්‍යක්ෂවරයාගේ සටහන</label>
                          <textarea
                            value={directorNote}
                            onChange={(e) => setDirectorNote(e.target.value)}
                            rows={3}
                            placeholder="ඔබගේ සටහන මෙහි ලියා තබන්න..."
                            disabled={
                              selectedRequest.directorStatus ===
                                "AcceptedByDirector" ||
                              selectedRequest.directorStatus ===
                                "RejectedByDirector"
                            }
                          />

                          {actionError && (
                            <p className="director-error">{actionError}</p>
                          )}
                          {actionSuccess && (
                            <p className="director-success">{actionSuccess}</p>
                          )}

                          {selectedRequest.directorStatus === "Pending" && (
                            <div
                              className="referral-actions"
                              style={{ marginTop: 8 }}
                            >
                              <button
                                type="button"
                                className="btn-decline"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleDirectorDecision("reject")
                                }
                              >
                                {actionLoading ? "Processing..." : "Reject"}
                              </button>
                              <button
                                type="button"
                                className="btn-accept"
                                disabled={actionLoading}
                                onClick={() =>
                                  handleDirectorDecision("accept")
                                }
                              >
                                {actionLoading ? "Processing..." : "Accept"}
                              </button>
                            </div>
                          )}

                          {canGenerateCertificate && (
                            <div className="certificate-preview-block">
                              <h4 className="certificate-preview-title">
                                සුභ පැතුම්!
                              </h4>
                              <p className="certificate-preview-subtitle">
                                පහත සඳහන් සමිතිය දකුණු පළාත් ග්‍රාම
                                සංවර්ධන දෙපාර්තමේන්තුව යටතේ නිසි ලෙස
                                ලියාපදිංචි කරන ලද බව මෙයින් තහවුරු කරයි.
                              </p>

                              <div className="certificate-preview-body">
                                <p>
                                  <strong>සමිතිය නාමය:</strong>{" "}
                                  {selectedRequest.societyName}
                                </p>
                                <p>
                                  <strong>ලියාපදිංචි අංකය:</strong>{" "}
                                  {selectedRequest.registerNo}
                                </p>
                                <p>
                                  <strong>දිස්ත්‍රික් / ප්‍රා.ලේ.:</strong>{" "}
                                  {selectedRequest.district} /{" "}
                                  {selectedRequest.division}
                                </p>
                                <p>
                                  <strong>ලිපිනය:</strong>{" "}
                                  {selectedRequest.societyAddress}
                                </p>
                                <p>
                                  <strong>සම්බන්ධතා:</strong>{" "}
                                  {selectedRequest.societyPhone} |{" "}
                                  {selectedRequest.societyEmail}
                                </p>
                                <p>
                                  <strong>සාමාජික සංඛ්‍යාව:</strong>{" "}
                                  {selectedRequest.memberCount ?? "N/A"}
                                </p>
                                <p>
                                  <strong>අධ්‍යක්ෂ තීරණ දිනය:</strong>{" "}
                                  {selectedRequest.directorDecisionAt ||
                                    new Date().toLocaleDateString()}
                                </p>
                              </div>

                              <p className="certificate-preview-footer-text">
                                ඉහත තොරතුරු නිවැරදි බව තහවුරු කර
                                &quot;Download&quot; බටනය ඔබා
                                ලියාපදිංචි සහතිකය (PDF) බාගත කරගන්න.
                              </p>
                            </div>
                          )}

                          {canGenerateCertificate && (
                            <button
                              type="button"
                              className="btn-accept"
                              style={{ marginTop: 10, width: "100%" }}
                              onClick={handlePrint}
                            >
                              ලියාපදිංචි සහතිකය (PDF) බාගත කරන්න
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {canGenerateCertificate && (
                    <div
                      style={{ position: "absolute", left: -9999, top: 0 }}
                      ref={certificateRef}
                    >
                      <CertificateView director={user} request={selectedRequest} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* 2. ALL FORWARDED TAB */}
          {activeTab === "requested" && (
            <section className="dash-widget">
              <h3 className="widget-title">
                ඉදිරිපත් කරන ලද / Forwarded සමිති ලැයිස්තුව
              </h3>
              <p className="muted-text">
                මෙය සරල දර්ශනයක් වන අතර, එක් එකක් මත ක්ලික් කිරීමෙන් එය
                &quot;Pending & Actions&quot; ටැබයට විවෘත වේ.
              </p>

              {latestRequests.length === 0 ? (
                <p className="muted-text">Forwarded සමිති නොමැත.</p>
              ) : (
                <ul className="letter-list">
                  {latestRequests.map((req) => (
                    <li
                      key={req.id}
                      className="letter-item"
                      onClick={() => {
                        setActiveTab("pending");
                        handleSelectRequest(req);
                      }}
                      style={{ cursor: "pointer" }}
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
                          Director Status: {req.directorStatus}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          req.directorStatus === "AcceptedByDirector"
                            ? "badge-success"
                            : req.directorStatus === "RejectedByDirector"
                            ? "badge-danger"
                            : "badge-info"
                        }`}
                      >
                        {req.directorStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 3. CERTIFICATES TAB */}
          {activeTab === "certificates" && (
            <section className="dash-widget certificates-widget">
              <div className="cert-header">
                <div>
                  <h3 className="widget-title">නිකුත් කළ ලියාපදිංචි සහතික</h3>
                  <p className="muted-text">
                    මෙහිදි අධ්‍යක්ෂවරයා විසින් දැනටමත් අනුමත කර ඇති සියලුම
                    සමිති පෙන්වයි. කැමති එකක් තෝරාගෙන Preview සහ PDF
                    බාගත කිරීම සිදු කළ හැක.
                  </p>
                </div>
              </div>

              {acceptedRequests.length === 0 ? (
                <p className="muted-text">
                  අධ්‍යක්ෂවරයා විසින් තවමත් කිසිදු සමිතියක් අනුමත කර
                  නොමැත.
                </p>
              ) : (
                <ul className="letter-list">
                  {acceptedRequests.map((req) => (
                    <li
                      key={req.id}
                      className="letter-item"
                      onClick={() => setPreviewRequest(req)}
                      style={{ cursor: "pointer" }}
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
                          Accepted on: {req.directorDecisionAt || "-"}
                        </p>
                      </div>
                      <span className="badge badge-success">Accepted</span>
                    </li>
                  ))}
                </ul>
              )}

              {previewRequest && (
                <div className="cert-modal-backdrop">
                  <div className="cert-modal">
                    <div className="cert-modal-header">
                      <h4 className="widget-title">
                        Certificate Preview – {previewRequest.societyName}
                      </h4>
                      <button
                        className="btn-close-referral"
                        onClick={() => setPreviewRequest(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="cert-modal-body">
                      <CertificatePreviewBlock request={previewRequest} />
                    </div>
                    <div className="cert-modal-footer">
                      <button
                        className="btn-accept"
                        onClick={() => {
                          setSelectedRequest(previewRequest);
                          setTimeout(() => {
                            handlePrint();
                          }, 50);
                        }}
                      >
                        ලියාපදිංචි සහතිකය (PDF) බාගත කරන්න
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 4. HISTORY TAB */}
          {activeTab === "history" && (
            <section className="dash-widget">
              <h3 className="widget-title">Forwarded Registrations History</h3>
              <p className="muted-text">
                මෙය අධ්‍යක්ෂවරයා වෙත යොමු වූ සියලුම ලියාපදිංචි ඉල්ලීම්
                පිළිබඳ සම්පූර්ණ ඉතිහාසයයි. (අනුමත / ප්‍රත්‍යාකරණ / Pending)
              </p>

              {requests.length === 0 ? (
                <p className="muted-text">ඉතිහාස දත්ත නොමැත.</p>
              ) : (
                <ul className="letter-list">
                  {requests.map((req) => (
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
                          ඉදිරිපත් වූ දිනය: {req.createdAt}
                        </p>
                        <p className="letter-sub">
                          Director Status: {req.directorStatus}
                        </p>
                      </div>
                      <span className="badge badge-info">History</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* 5. ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <section className="dash-widget">
              <h3 className="widget-title">විශ්ලේෂණ සාරාංශය</h3>
              <p className="muted-text">
                මෙහි දී ඔබට සරල සංඛ්‍යාත දත්ත දැකගත හැක. දිස්ත්‍රික් අනුව
                ලියාපදිංචි ඉල්ලීම් ගණන ද පහත දැක්වේ.
              </p>

              {/* Overall numbers */}
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>සම්පූර්ණ ඉදිරිපත් කිරීම්</h4>
                  <p className="analytics-number">{totalForwarded}</p>
                  <p className="analytics-label">
                    මෙතෙක් අධ්‍යක්ෂවරයා වෙත යොමු වූ සමස්ත ඉල්ලීම්.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>අනුමත සමිති</h4>
                  <p className="analytics-number">
                    {acceptedRequests.length}
                  </p>
                  <p className="analytics-label">
                    ලියාපදිංචි සහතික නිකුත් කිරීමට සුදුසු වූ සමිති.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>Pending තීරණ</h4>
                  <p className="analytics-number">
                    {pendingRequests.length}
                  </p>
                  <p className="analytics-label">
                    දැනටමත් ඔබගේ අවසන් තීරණය බලා සිටින ඉල්ලීම් සංඛ්‍යාව.
                  </p>
                </div>
                <div className="analytics-card">
                  <h4>ප්‍රත්‍යාකරණ</h4>
                  <p className="analytics-number">
                    {rejectedRequests.length}
                  </p>
                  <p className="analytics-label">
                    අධ්‍යක්ෂවරයා මට්ටමේ ප්‍රත්‍යාකරණය කළ ඉල්ලීම්.
                  </p>
                </div>
              </div>

              {/* District-wise "chart" */}
              <h4 style={{ marginTop: 16, marginBottom: 6 }}>
                දිස්ත්‍රික් අනුව ලියාපදිංචි ඉල්ලීම් / District-wise Summary
              </h4>
              {districtStats.length === 0 ? (
                <p className="muted-text">
                  දිස්ත්‍රික් අනුව දත්ත පෙන්වීමට ලියාපදිංචි ඉල්ලීම් නොමැත.
                </p>
              ) : (
                <div className="district-analytics-table">
                  {districtStats.map((d) => {
                    const barWidth =
                      maxTotalForBar > 0
                        ? (d.total / maxTotalForBar) * 100
                        : 0;
                    return (
                      <div key={d.districtName} className="district-row">
                        <div className="district-label">{d.districtName}</div>
                        <div className="district-bar-wrapper">
                          <div
                            className="district-bar"
                            style={{ width: `${barWidth}%` }}
                          >
                            <span className="district-bar-text">
                              Total: {d.total} | Accepted: {d.accepted} |
                              Pending: {d.pending} | Rejected: {d.rejected}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

/** Printable certificate view (Sinhala) */
const CertificateView = ({ director, request }) => {
  const today =
    request.directorDecisionAt ||
    new Date().toLocaleDateString("si-LK") ||
    new Date().toLocaleDateString();

  return (
    <div className="certificate-page">
      <div className="certificate-inner">
        <h2 className="certificate-header">
          දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව
        </h2>
        <h3 className="certificate-subheader">ලියාපදිංචි සහතිකය</h3>

        <p className="certificate-text">
          මෙයින් සහතික කරනුයේ{" "}
          <strong>{request.societyName}</strong> නම් ග්‍රාම සංවර්ධන සමිතිය{" "}
          <strong>
            {request.district} දිස්ත්‍රික්කයේ {request.division} ප්‍රාදේශීය
            ලේකම් කොට්ඨාසය තුළ
          </strong>{" "}
          දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුවේ නීති රීති අනුව නිසි
          පරිදි ලියාපදිංචි වී ඇති බවය.
        </p>

        <p className="certificate-text">
          මෙම සමිතියට වෙන් වූ ලියාපදිංචි අංකය:
          <strong> {request.registerNo}</strong> යි.
        </p>

        <p className="certificate-text">
          මෙම ලියාපදිංචිය සඳහා Rural Development Officer, District Officer,
          Divisional Secretary සහ Subject Officer මට්ටම්වූ සියලු අවශ්‍ය
          අනුමැති ලබාගෙන, පසුකාලීනව අධ්‍යක්ෂවරයා විසින් අවසන් වශයෙන්{" "}
          <strong>අනුමත කරන ලද බව</strong> මෙයින් තහවුරු කරනු ලැබේ.
        </p>

        <p className="certificate-text">
          ඉහත සමිතියට අදාල නියමයන් හා නීති රීති අනුව ක්‍රියා කරන
          වගකීම සමිතිය සතුව තිබේ. මෙම සහතිකය වසරකට අදාළ නිල ලියාපදිංචි
          ලේඛනයක් ලෙස සලකනු ලැබේ.
        </p>

        <div className="certificate-meta">
          <p>දිනය: {today}</p>
          <p>දිස්ත්‍රික්කය: {request.district}</p>
          <p>ප්‍රාදේශීය ලේකම් කොට්ඨාසය: {request.division}</p>
        </div>

        <div className="certificate-signature">
          <p>.............................................</p>
          <p>
            {director?.username || "Director"} <br />
            පලාත් සංවර්ධන අධ්‍යක්ෂක
          </p>
        </div>
      </div>
    </div>
  );
};

const CertificatePreviewBlock = ({ request }) => {
  return (
    <div className="certificate-preview-modal-block">
      <h4 className="certificate-preview-title">Registration Summary</h4>
      <p className="certificate-preview-subtitle">
        මෙම සමිතිය සම්බන්ධ මූලික තොරතුරු පහත දැක්වේ.
      </p>
      <div className="certificate-preview-body">
        <p>
          <strong>සමිතිය නාමය:</strong> {request.societyName}
        </p>
        <p>
          <strong>ලියාපදිංචි අංකය:</strong> {request.registerNo}
        </p>
        <p>
          <strong>දිස්ත්‍රික් / ප්‍රා.ලේ.:</strong> {request.district} /{" "}
          {request.division}
        </p>
        <p>
          <strong>ලිපිනය:</strong> {request.societyAddress}
        </p>
        <p>
          <strong>සම්බන්ධතා:</strong> {request.societyPhone} |{" "}
          {request.societyEmail}
        </p>
        <p>
          <strong>සාමාජික සංඛ්‍යාව:</strong> {request.memberCount ?? "N/A"}
        </p>
        <p>
          <strong>අනුමත වූ දිනය:</strong>{" "}
          {request.directorDecisionAt || "Not available"}
        </p>
      </div>
    </div>
  );
};

export default ChairmanProfile;