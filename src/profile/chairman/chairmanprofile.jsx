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

  const [requests, setRequests] = useState([]); // secretaryRequests forwarded to Director
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [directorNote, setDirectorNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showHistory, setShowHistory] = useState(false);

  const certificateRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
    documentTitle: "Society-Registration-Certificate",
  });

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
                  ? d.ruralDecisionAt.toDate().toLocaleDateString()
                  : "",

              // DO
              districtOfficerName: d.districtOfficerName || "Unknown DO",
              districtOfficerId: d.districtOfficerId || "N/A",
              districtDecision: d.districtDecision || "Pending",
              districtDecisionAt:
                d.districtDecisionAt && d.districtDecisionAt.toDate
                  ? d.districtDecisionAt.toDate().toLocaleDateString()
                  : "",

              // DS
              secretaryStatus: d.secretaryStatus || "Pending",
              secretaryNote: d.secretaryNote || "",
              secretaryDecisionAt:
                d.secretaryDecisionAt && d.secretaryDecisionAt.toDate
                  ? d.secretaryDecisionAt.toDate().toLocaleDateString()
                  : "",

              // Subject Officer
              subjectStatus: d.subjectStatus || "Pending",
              subjectNote: d.subjectNote || "",
              subjectDecisionAt:
                d.subjectDecisionAt && d.subjectDecisionAt.toDate
                  ? d.subjectDecisionAt.toDate().toLocaleDateString()
                  : "",

              // Director decision (may already exist)
              directorStatus: d.directorStatus || "Pending",
              directorNote: d.directorNote || "",
              directorDecisionAt:
                d.directorDecisionAt && d.directorDecisionAt.toDate
                  ? d.directorDecisionAt.toDate().toLocaleDateString()
                  : "",

              createdAt:
                d.createdAt && d.createdAt.toDate
                  ? d.createdAt.toDate().toLocaleDateString()
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
  };

  const handleDirectorDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.directorStatus === "AcceptedByDirector" ||
      selectedRequest.directorStatus === "RejectedByDirector"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සදහා අධ්‍යක්ෂක තීරණය දැනටමත් ලබා දී ඇත."
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

      const decisionAtStr = now.toLocaleDateString();

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
          ? "සමිතිය අවසන්ව (Accepted) ලෙස ලියාපදිංචි කරන ලදී."
          : "සමිතිය අවසන්ව (Rejected) ලෙස සලකන ලදී."
      );
    } catch (err) {
      console.error("Error updating director decision:", err);
      setActionError("අධ්‍යක්ෂක තීරණය සුරක්ෂිත කිරීමට නොහැකි විය.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  if (!user) return <p style={{ textAlign: "center" }}>User not found</p>;

  const latestRequests = requests;
  const historyRequests = requests;

  const totalLatest = latestRequests.length;
  const totalHistory = historyRequests.length;

  const canGenerateCertificate =
    selectedRequest && selectedRequest.directorStatus === "AcceptedByDirector";

  return (
    <div className="chairman-dashboard">
      <div className="dashboard-shell">
        {/* SIDEBAR */}
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
            <h2 className="sidebar-name">{user.username}</h2>
            <p className="sidebar-role">
              පලාත් සංවර්ධන අධ්‍යක්ෂක <span>(Director)</span>
            </p>

            <div className="sidebar-info">
              <p>
                <strong>District:</strong> {user.district || "All"}
              </p>
              <p>
                <strong>Division:</strong> {user.division || "All"}
              </p>
              <p>
                <strong>Contact:</strong> {user.contactnumber || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Forwarded from Subject</p>
              <p className="stat-value">{totalLatest}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Records</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Unique Societies</p>
              <p className="stat-value">
                {new Set(historyRequests.map((r) => r.societyId || r.id)).size}
              </p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>Key Responsibilities</h4>
            <ul>
              <li>අවසාන වශයෙන් ග්‍රාම සංවර්ධන සමිති ලියාපදිංචි කිරීම.</li>
              <li>සහතික නිකුත් කිරීම.</li>
              <li>සමස්ත පළාත් වැඩසටහන් උසස් මට්ටමින් පාලනය.</li>
            </ul>
          </div>
        </aside>

        {/* MAIN */}
        <main className="dashboard-main">
          {/* INBOX */}
          <section className="dashboard-grid">
            <div className="dash-widget">
              <h3 className="widget-title">Forwarded Registration Letters</h3>
              {loadingRequests ? (
                <p className="muted-text">Loading registrations...</p>
              ) : latestRequests.length === 0 ? (
                <p className="muted-text">
                  No registrations forwarded by Subject Officers.
                </p>
              ) : (
                <ul className="letter-list">
                  {latestRequests.map((req) => (
                    <li
                      key={req.id}
                      className="letter-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectRequest(req)}
                    >
                      <div>
                        <p className="letter-type">
                          <strong>{req.societyName}</strong> ({req.registerNo})
                        </p>
                        <p className="letter-sub">
                          District: {req.district} | Division: {req.division}
                        </p>
                        <p className="letter-sub">
                          Subject Status: {req.subjectStatus}
                        </p>
                        <p className="letter-sub">
                          Director Status: {req.directorStatus}
                        </p>
                      </div>
                      <span className="badge badge-info">Forwarded</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dash-widget">
              <h3 className="widget-title">Profile Summary</h3>
              <div className="profile-summary-grid">
                <div>
                  <p className="summary-label">Identity Number</p>
                  <p className="summary-value">{user.identitynumber}</p>
                </div>
                <div>
                  <p className="summary-label">Position</p>
                  <p className="summary-value">{user.position}</p>
                </div>
                <div>
                  <p className="summary-label">Assigned Area</p>
                  <p className="summary-value">
                    {user.district || "All"} / {user.division || "All"}
                  </p>
                </div>
              </div>
              <p className="summary-note">
                These registrations have completed Rural, District, Divisional,
                and Subject Officer approvals. Your decision will finalize
                registration and enable certificate generation.
              </p>
            </div>
          </section>

          {/* DETAIL + DECISION + CERTIFICATE */}
          {selectedRequest && (
            <>
              <section className="director-detail-card">
                <div className="detail-header">
                  <h3 className="widget-title">
                    Society Registration – {selectedRequest.societyName}
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
                      <h4>Society Information</h4>
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
                      <p>
                        <strong>District / Division:</strong>{" "}
                        {selectedRequest.district} /{" "}
                        {selectedRequest.division}
                      </p>
                    </div>
                  </div>

                  {/* Approval chain + Director decision */}
                  <div className="detail-column">
                    <div className="approval-chain">
                      <h4>Approval Chain</h4>

                      <div className="chain-step">
                        <h5>Rural Development Officer</h5>
                        <p>
                          <strong>Name:</strong>{" "}
                          {selectedRequest.ruralOfficerName} (
                          {selectedRequest.ruralOfficerId})
                        </p>
                        <p>
                          <strong>Decision:</strong>{" "}
                          {selectedRequest.ruralOfficerDecision}
                        </p>
                        {selectedRequest.ruralDecisionAt && (
                          <p>
                            <strong>Date:</strong>{" "}
                            {selectedRequest.ruralDecisionAt}
                          </p>
                        )}
                      </div>

                      <div className="chain-step">
                        <h5>District Officer</h5>
                        <p>
                          <strong>Name:</strong>{" "}
                          {selectedRequest.districtOfficerName} (
                          {selectedRequest.districtOfficerId})
                        </p>
                        <p>
                          <strong>Decision:</strong>{" "}
                          {selectedRequest.districtDecision}
                        </p>
                        {selectedRequest.districtDecisionAt && (
                          <p>
                            <strong>Date:</strong>{" "}
                            {selectedRequest.districtDecisionAt}
                          </p>
                        )}
                      </div>

                      <div className="chain-step">
                        <h5>Divisional Secretary</h5>
                        <p>
                          <strong>Decision:</strong>{" "}
                          {selectedRequest.secretaryStatus}
                        </p>
                        {selectedRequest.secretaryDecisionAt && (
                          <p>
                            <strong>Date:</strong>{" "}
                            {selectedRequest.secretaryDecisionAt}
                          </p>
                        )}
                      </div>

                      <div className="chain-step">
                        <h5>Subject Officer</h5>
                        <p>
                          <strong>Decision:</strong>{" "}
                          {selectedRequest.subjectStatus}
                        </p>
                        {selectedRequest.subjectDecisionAt && (
                          <p>
                            <strong>Date:</strong>{" "}
                            {selectedRequest.subjectDecisionAt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="director-decision-card">
                      <h4>Director Final Decision</h4>
                      <p className="muted-text">
                        Accept or Reject once. After Accepted, you can generate
                        a formal certificate (PDF).
                      </p>

                      <label>Director Note</label>
                      <textarea
                        value={directorNote}
                        onChange={(e) => setDirectorNote(e.target.value)}
                        rows={3}
                        placeholder="Enter your note..."
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
                            onClick={() => handleDirectorDecision("reject")}
                          >
                            {actionLoading ? "Processing..." : "Reject"}
                          </button>
                          <button
                            type="button"
                            className="btn-accept"
                            disabled={actionLoading}
                            onClick={() => handleDirectorDecision("accept")}
                          >
                            {actionLoading ? "Processing..." : "Accept"}
                          </button>
                        </div>
                      )}

                      {canGenerateCertificate && (
                        <button
                          type="button"
                          className="btn-accept"
                          style={{ marginTop: 10, width: "100%" }}
                          onClick={handlePrint}
                        >
                          Download Registration Certificate (PDF)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* CERTIFICATE PREVIEW, HIDDEN, USED ONLY FOR PDF */}
              {canGenerateCertificate && (
                <div
                  style={{ position: "absolute", left: -9999, top: 0 }}
                  ref={certificateRef}
                >
                  <CertificateView
                    director={user}
                    request={selectedRequest}
                  />
                </div>
              )}
            </>
          )}

          {/* HISTORY */}
          <section className="dashboard-history">
            <div className="history-header">
              <h3 className="widget-title">Forwarded Registrations History</h3>
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide" : "Show"} History
              </button>
            </div>

            {showHistory && (
              <div className="history-content">
                {historyRequests.length === 0 ? (
                  <p className="muted-text">No history records.</p>
                ) : (
                  <ul className="letter-list">
                    {historyRequests.map((req) => (
                      <li
                        key={req.id}
                        className="letter-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectRequest(req)}
                      >
                        <div>
                          <p className="letter-type">
                            <strong>{req.societyName}</strong> ({req.registerNo})
                          </p>
                          <p className="letter-sub">
                            District: {req.district} | Division:{" "}
                            {req.division}
                          </p>
                          <p className="letter-sub">Date: {req.createdAt}</p>
                          <p className="letter-sub">
                            Director Status: {req.directorStatus}
                          </p>
                        </div>
                        <span className="badge badge-info">History</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
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
          නිසි පරිදි ලියාපදිංචි වී ඇති බවය.
        </p>

        <p className="certificate-text">
          මෙම සමිතියට වෙන් වූ ලියාපදිංචි අංකය:
          <strong> {request.registerNo}</strong> යි.
        </p>

        <p className="certificate-text">
          ඉහත සමිතිය සඳහා Rural Development Officer, District Officer,
          Divisional Secretary හා Subject Officer මට්ටම්වූ සියලු අවශ්‍ය
          අනුමැති ලබාගෙන, Director විසින් අවසන් වශයෙන්{" "}
          <strong>සාර්ථකව ලියාපදිංචි කරන ලද බව</strong> මෙයින්
          අවධාරණය කරනු ලැබේ.
        </p>

        <p className="certificate-text">
          මෙම සමිතිය කෙරෙහි අදාළ නීති, නිර්දේශ හා ලියවිලි මගින් සම්පූර්ණව
          පරීක්ෂා කරමින්, පිළිගත් ග්‍රාම සංවර්ධන සමිතියක් ලෙස පිළිගනු
          ලැබේ.
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

const PositionBlock = ({ title, data }) => {
  const d = data || {};
  return (
    <div className="position-item">
      <h5>{title}</h5>
      <p>
        <strong>නම:</strong> {d.fullName || "N/A"}
      </p>
      <p>
        <strong>ලිපිනය:</strong> {d.address || "N/A"}</p>
      <p>
        <strong>දුරකථන:</strong> {d.phone || "N/A"}</p>
      <p>
        <strong>ඊමේල්:</strong> {d.email || "N/A"}</p>
      <p>
        <strong>ජා.හැ.අංකය:</strong> {d.nic || "N/A"}</p>
      <p>
        <strong>උපන් දිනය:</strong> {d.dob || "N/A"}</p>
    </div>
  );
};

export default ChairmanProfile;