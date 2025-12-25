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

  const [requests, setRequests] = useState([]); // secretaryRequests (all)
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [subjectNote, setSubjectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [showSignOutModal, setShowSignOutModal] = useState(false);

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
        // 1) Load subject officer
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

        // 2) Load ALL secretaryRequests (subject sees all registrations in DB)
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
              subjectStatus: d.subjectStatus || "Pending", // Pending | AcceptedBySubject | RejectedBySubject | ForwardedToDirector
              subjectNote: d.subjectNote || "",
              subjectDecisionAt:
                d.subjectDecisionAt && d.subjectDecisionAt.toDate
                  ? d.subjectDecisionAt.toDate().toLocaleString()
                  : "",

              // When record was first created at DS/DO level
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

  // ===== SELECT A REQUEST =====
  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setSubjectNote(req.subjectNote || "");
    setActionError("");
    setActionSuccess("");
  };

  // ===== SUBJECT OFFICER DECISION: ACCEPT / REJECT =====
  const handleSubjectDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.subjectStatus === "AcceptedBySubject" ||
      selectedRequest.subjectStatus === "RejectedBySubject" ||
      selectedRequest.subjectStatus === "ForwardedToDirector"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සදහා ඔබේ (Subject Officer) තීරණය දැනටමත් ලබා දී ඇත."
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
          ? "සමිතිය විෂය මට්ටමින් (Accepted) ලෙස සළකනු ලැබීය."
          : "සමිතිය විෂය මට්ටමින් (Rejected) ලෙස සළකනු ලැබීය."
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

  const latestRequests = requests;       // show all in inbox
  const historyRequests = requests;      // same list in history
  const totalPending = latestRequests.length;
  const totalHistory = historyRequests.length;
  const acceptedCount = historyRequests.filter(
    (r) => r.subjectStatus === "AcceptedBySubject"
  ).length;

  return (
    <div className="subject-dashboard">
      {/* SIGN OUT MODAL */}
      {showSignOutModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Confirm Sign Out</h3>
            <p className="modal-message">
              Are you sure you want to sign out from your account?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={handleCancelSignOut}
              >
                No, Stay Logged In
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={handleConfirmSignOut}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="subject-shell">
        {/* SIDEBAR */}
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
            <p className="sidebar-role">
              විෂය භාර නිලධාරී <span>(Subject Officer)</span>
            </p>

            <div className="sidebar-info">
              <p>
                <strong>District:</strong> {user.district || "N/A"}
              </p>
              <p>
                <strong>Division:</strong> {user.division || "N/A"}
              </p>
              <p>
                <strong>Society:</strong> {user.society || "N/A"}
              </p>
              <p>
                <strong>Contact:</strong> {user.contactnumber || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Total Registrations</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Accepted (Subject)</p>
              <p className="stat-value">{acceptedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>

          {/* RESPONSIBILITIES */}
          <div className="sidebar-notes">
            <h4>Officer Notes</h4>
            <ul>
              <li>රූරාල්, දිස්ත්‍රික්, ප්‍රාදේශීය තීරණ සලකා බලන්න.</li>
              <li>විෂය අදාළ නීති අනුව Accept/Reject තීරණය ලබා දෙන්න.</li>
              <li>අවසන් වශයෙන් Director වෙත යොමු කිරීම.</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="subject-main">
          {/* INBOX + SUMMARY */}
          <section className="subject-grid">
            {/* Inbox as letter-list */}
            <div className="sub-widget">
              <h3 className="widget-title">All Registration Letters</h3>
              {loadingRequests ? (
                <p className="muted-text">Loading registrations...</p>
              ) : latestRequests.length === 0 ? (
                <p className="muted-text">
                  No registration letters available.
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
                        <p className="letter-sub">Date: {req.createdAt}</p>
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
                            : "badge-warning"
                        }`}
                      >
                        {req.subjectStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile snapshot */}
            <div className="sub-widget">
              <h3 className="widget-title">Profile Snapshot</h3>
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
                  <p className="summary-label">Assigned Society</p>
                  <p className="summary-value">
                    {user.society || "Not Assigned"}
                  </p>
                </div>
              </div>
              <p className="summary-note">
                This dashboard shows all registration letters reviewed by
                Rural, District, and Divisional levels, now awaiting your
                subject decision.
              </p>
            </div>
          </section>

          {/* DETAIL & APPROVAL CHAIN */}
          {selectedRequest && (
            <section className="subject-detail-card">
              <div className="detail-header">
                <h3 className="widget-title">
                  Society Registration – {selectedRequest.societyName}
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
                {/* Society info block */}
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

                  <div className="positions-card">
                    <h4>Positions</h4>
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

                {/* Approval chain + subject actions */}
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
                      {selectedRequest.ruralOfficerNote && (
                        <p>
                          <strong>Note:</strong>{" "}
                          {selectedRequest.ruralOfficerNote}
                        </p>
                      )}
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
                      {selectedRequest.districtNote && (
                        <p>
                          <strong>Note:</strong>{" "}
                          {selectedRequest.districtNote}
                        </p>
                      )}
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
                      {selectedRequest.secretaryNote && (
                        <p>
                          <strong>Note:</strong>{" "}
                          {selectedRequest.secretaryNote}
                        </p>
                      )}
                      {selectedRequest.secretaryDecisionAt && (
                        <p>
                          <strong>Date:</strong>{" "}
                          {selectedRequest.secretaryDecisionAt}
                        </p>
                      )}
                    </div>

                    <div className="chain-step subject-step">
                      <h5>Subject Officer</h5>
                      <p>
                        <strong>Your Decision:</strong>{" "}
                        {selectedRequest.subjectStatus}
                      </p>
                      {selectedRequest.subjectNote && (
                        <p>
                          <strong>Your Note:</strong>{" "}
                          {selectedRequest.subjectNote}
                        </p>
                      )}
                      {selectedRequest.subjectDecisionAt && (
                        <p>
                          <strong>Date:</strong>{" "}
                          {selectedRequest.subjectDecisionAt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="referral-form subject-action-card">
                    <h4>Subject Officer Action</h4>
                    <p className="muted-text">
                      Accept or Reject once, then you can forward this
                      registration letter to the Director.
                    </p>

                    <label>Subject Officer Note</label>
                    <textarea
                      value={subjectNote}
                      onChange={(e) => setSubjectNote(e.target.value)}
                      rows={3}
                      placeholder="Enter your note..."
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

                    {/* Accept/Reject visible only if Subject has not decided */}
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

                    {/* Forward to Director visible only AFTER Subject has decided */}
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

          {/* HISTORY */}
          <section className="subject-history">
            <div className="history-header">
              <h3 className="widget-title">Registration History</h3>
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
                              : "badge-warning"
                          }`}
                        >
                          {req.subjectStatus}
                        </span>
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

export default Subject;