import React, { useEffect, useState } from "react";
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
import "../devsecretary/divisionalsecretary.css";
import { useNavigate } from "react-router-dom";

const DivisionalSecretary = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [requests, setRequests] = useState([]); // secretaryRequests for this division
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [showHistory, setShowHistory] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dsNote, setDsNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchUserAndData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingUser(false);
        return;
      }

      try {
        // 1) Load divisional secretary user
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

        // 2) Load forwarded registrations for this district + division
        if (userData.district && userData.division) {
          setLoadingRequests(true);
          try {
            const secRef = collection(db, "secretaryRequests");
            const qSec = query(
              secRef,
              where("district", "==", userData.district),
              where("division", "==", userData.division)
            );
            const snap = await getDocs(qSec);

            const all = [];
            snap.forEach((reqDoc) => {
              const d = reqDoc.data();
              all.push({
                id: reqDoc.id,

                // from DO
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

                // RDO signature
                ruralOfficerId: d.ruralOfficerId || "N/A",
                ruralOfficerName: d.ruralOfficerName || "Unknown RDO",
                ruralOfficerPosition: d.ruralOfficerPosition || "",
                ruralOfficerDecision: d.ruralOfficerDecision || "Pending",
                ruralOfficerNote: d.ruralOfficerNote || "",

                // DO signature
                districtOfficerId: d.districtOfficerId || "N/A",
                districtOfficerName: d.districtOfficerName || "Unknown DO",
                districtOfficerEmail: d.districtOfficerEmail || "",
                districtDecision: d.districtDecision || "Pending",
                districtNote: d.districtNote || "",

                // Divisional Secretary decision
                secretaryStatus: d.secretaryStatus || "Pending", // AcceptedByDS / RejectedByDS / ForwardedToSubject / Pending
                secretaryNote: d.secretaryNote || "",
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
            console.error("Error loading secretary requests:", err);
            setError("Failed to load requests for this division.");
          } finally {
            setLoadingRequests(false);
          }
        }
      } catch (err) {
        console.error("Error fetching divisional secretary:", err);
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

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setDsNote(req.secretaryNote || "");
    setActionError("");
    setActionSuccess("");
  };

  // DS Accept / Reject – only one time
  const handleDsDecision = async (decision) => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.secretaryStatus === "AcceptedByDS" ||
      selectedRequest.secretaryStatus === "RejectedByDS" ||
      selectedRequest.secretaryStatus === "ForwardedToSubject"
    ) {
      setActionError(
        "මෙම ලියාපදිංචිය සදහා ප්‍රාදේශීය ලේකම් තීරණය දැනටමත් ලබා දී ඇත."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      const docRef = doc(db, "secretaryRequests", selectedRequest.id);
      const newStatus =
        decision === "accept" ? "AcceptedByDS" : "RejectedByDS";

      await updateDoc(docRef, {
        secretaryStatus: newStatus,
        secretaryNote: dsNote || "",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                secretaryStatus: newStatus,
                secretaryNote: dsNote || "",
              }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              secretaryStatus: newStatus,
              secretaryNote: dsNote || "",
            }
          : prev
      );

      setActionSuccess(
        decision === "accept"
          ? "සමිතිය ප්‍රාදේශීය මට්ටමින් (Accepted) ලෙස සළකනු ලැබීය."
          : "සමිතිය ප්‍රාදේශීය මට්ටමින් (Rejected) ලෙස සළකනු ලැබීය."
      );
    } catch (err) {
      console.error("Error updating DS decision:", err);
      setActionError("ප්‍රාදේශීය තීරණය සුරක්ෂිත කිරීමට නොහැකි විය.");
    } finally {
      setActionLoading(false);
    }
  };

  // Forward to Subject Officer – only after DS has decided
  const handleForwardToSubjectOfficer = async () => {
    if (!selectedRequest || !user) return;

    if (
      selectedRequest.secretaryStatus !== "AcceptedByDS" &&
      selectedRequest.secretaryStatus !== "RejectedByDS"
    ) {
      setActionError(
        "කරුණාකර පළමුව Accept හෝ Reject තීරණයක් ලබා දී පසුව යොමු කරන්න."
      );
      return;
    }

    setActionError("");
    setActionSuccess("");
    setActionLoading(true);

    try {
      // Here we just update secretaryRequests to mark forwarded.
      // If you want, you could also create a 'subjectRequests' collection.
      const docRef = doc(db, "secretaryRequests", selectedRequest.id);
      await updateDoc(docRef, {
        secretaryStatus: "ForwardedToSubject",
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, secretaryStatus: "ForwardedToSubject" }
            : r
        )
      );

      setSelectedRequest((prev) =>
        prev ? { ...prev, secretaryStatus: "ForwardedToSubject" } : prev
      );

      setActionSuccess(
        "සමිතිය පිළිබඳ ලේඛනය විෂය භාර නිලධාරී වෙත යොමු කිරීම සාර්ථකයි."
      );
    } catch (err) {
      console.error("Error forwarding to subject officer:", err);
      setActionError(
        "විෂය භාර නිලධාරී වෙත යොමු කිරීමේදී දෝෂයක් සිදු විය. නැවත උත්සහ කරන්න."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingUser) return <p className="ds-loading">Loading profile...</p>;
  if (error) return <p className="ds-error">{error}</p>;
  if (!user) return null;

  const latestRequests = requests;
  const historyRequests = requests;
  const totalPending = latestRequests.length;
  const totalHistory = historyRequests.length;
  const acceptedCount = historyRequests.filter(
    (r) => r.secretaryStatus === "AcceptedByDS"
  ).length;

  return (
    <section className="ds-dashboard">
      <div className="ds-shell">
        {/* LEFT: PROFILE SIDEBAR */}
        <aside className="ds-sidebar">
          <div className="ds-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Pradeshiya Lekam Profile</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          <div className="ds-profile-card">
            <div className="ds-avatar">
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "P"}
              </div>
            </div>
            <h2 className="ds-name">{user.username}</h2>
            <p className="ds-role">
              ප්‍රාදේශීය ලේකම් (Divisional Secretary)
            </p>

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
          </div>

          <div className="ds-info-card">
            <h4 className="sidebar-section-title">Area Information</h4>
            <div className="info-row">
              <span className="info-label">District</span>
              <span className="info-value">{user.district || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Secretary Division</span>
              <span className="info-value">{user.division || "N/A"}</span>
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Pending Requests</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Accepted (DS)</p>
              <p className="stat-value">{acceptedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>

          <div className="sidebar-notes">
            <h4>Key Responsibilities</h4>
            <ul>
              <li>ප්‍රාදේශීය මට්ටමින් ග්‍රාම සංවර්ධන වැඩසටහන් සමනායකත්වය දැරීම.</li>
              <li>ග්‍රාම සංවර්ධන නිලධාරීන් හා සමිතියන් සමඟ සම්බන්ධතාවය තබා ගැනීම.</li>
              <li>දිස්ත්‍රික් හා පලාත් මට්ටමේ වාර්තා සකස් කර ඉදිරිපත් කිරීම.</li>
            </ul>
          </div>
        </aside>

        {/* RIGHT: REQUESTS & HISTORY + DETAIL */}
        <main className="ds-main">
          {/* Latest Requests (from District Officer) */}
          <section className="ds-card">
            <h3 className="card-title">District Officer Forwarded Registrations</h3>
            {loadingRequests ? (
              <p className="muted-text">Loading requests...</p>
            ) : latestRequests.length === 0 ? (
              <p className="muted-text">
                No forwarded registration references for your division.
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
                        <strong>{req.societyName}</strong> ({req.registerNo})
                      </p>
                      <p className="letter-sub">
                        From District: {req.district} | Division:{" "}
                        {req.division}
                      </p>
                      <p className="letter-sub">
                        RDO: {req.ruralOfficerName} ({req.ruralOfficerDecision})
                      </p>
                      <p className="letter-sub">
                        DO: {req.districtOfficerName} ({req.districtDecision})
                      </p>
                      <p className="letter-sub">Date: {req.createdAt}</p>
                      {req.ruralOfficerNote && (
                        <p className="letter-sub">
                          RDO Note: {req.ruralOfficerNote}
                        </p>
                      )}
                      {req.districtNote && (
                        <p className="letter-sub">
                          DO Note: {req.districtNote}
                        </p>
                      )}
                      {req.secretaryStatus &&
                        req.secretaryStatus !== "Pending" && (
                          <p className="letter-sub">
                            DS Status: {req.secretaryStatus}
                          </p>
                        )}
                    </div>
                    <span
                      className={`badge ${
                        req.secretaryStatus === "AcceptedByDS"
                          ? "badge-success"
                          : req.secretaryStatus === "RejectedByDS"
                          ? "badge-danger"
                          : req.secretaryStatus === "ForwardedToSubject"
                          ? "badge-warning"
                          : "badge-warning"
                      }`}
                    >
                      {req.secretaryStatus}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Detail + DS Accept/Reject + Forward */}
          {selectedRequest && (
            <section className="ds-card referral-card">
              <div className="referral-header">
                <h3 className="card-title">
                  Society Registration Details – {selectedRequest.societyName}
                </h3>
                <button
                  type="button"
                  className="btn-close-referral"
                  onClick={() => {
                    setSelectedRequest(null);
                    setDsNote("");
                    setActionError("");
                    setActionSuccess("");
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="referral-body">
                <div className="ref-society-details">
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
                    <strong>Phone:</strong> {selectedRequest.societyPhone}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedRequest.societyEmail}
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
                  <h4>Officer Signatures</h4>
                  <p>
                    <strong>Rural Development Officer:</strong>{" "}
                    {selectedRequest.ruralOfficerName} (
                    {selectedRequest.ruralOfficerId})
                  </p>
                  <p>
                    <strong>RDO Decision:</strong>{" "}
                    {selectedRequest.ruralOfficerDecision}
                  </p>
                  {selectedRequest.ruralOfficerNote && (
                    <p>
                      <strong>RDO Note:</strong>{" "}
                      {selectedRequest.ruralOfficerNote}
                    </p>
                  )}
                  <hr />
                  <p>
                    <strong>District Officer:</strong>{" "}
                    {selectedRequest.districtOfficerName} (
                    {selectedRequest.districtOfficerId})
                  </p>
                  <p>
                    <strong>DO Decision:</strong>{" "}
                    {selectedRequest.districtDecision}
                  </p>
                  {selectedRequest.districtNote && (
                    <p>
                      <strong>DO Note:</strong>{" "}
                      {selectedRequest.districtNote}
                    </p>
                  )}

                  <div className="referral-form" style={{ marginTop: "10px" }}>
                    <h4>Divisional Secretary Decision</h4>
                    <p className="muted-text">
                      You can Accept or Reject only once, then optionally
                      forward to the Subject Officer.
                    </p>

                    <label>Divisional Secretary Note</label>
                    <textarea
                      value={dsNote}
                      onChange={(e) => setDsNote(e.target.value)}
                      rows={3}
                      placeholder="Enter your note..."
                      disabled={
                        selectedRequest.secretaryStatus === "AcceptedByDS" ||
                        selectedRequest.secretaryStatus === "RejectedByDS" ||
                        selectedRequest.secretaryStatus ===
                          "ForwardedToSubject"
                      }
                    />

                    {actionError && (
                      <p className="ds-error">{actionError}</p>
                    )}
                    {actionSuccess && (
                      <p className="ds-success">{actionSuccess}</p>
                    )}

                    {/* Accept / Reject visible only if DS has not yet decided */}
                    {selectedRequest.secretaryStatus === "Pending" && (
                      <div
                        className="referral-actions"
                        style={{ marginTop: 8 }}
                      >
                        <button
                          type="button"
                          className="btn-decline"
                          disabled={actionLoading}
                          onClick={() => handleDsDecision("reject")}
                        >
                          {actionLoading ? "Processing..." : "Reject"}
                        </button>
                        <button
                          type="button"
                          className="btn-accept"
                          disabled={actionLoading}
                          onClick={() => handleDsDecision("accept")}
                        >
                          {actionLoading ? "Processing..." : "Accept"}
                        </button>
                      </div>
                    )}

                    {/* Forward button visible only AFTER DS has decided */}
                    {(selectedRequest.secretaryStatus === "AcceptedByDS" ||
                      selectedRequest.secretaryStatus === "RejectedByDS" ||
                      selectedRequest.secretaryStatus ===
                        "ForwardedToSubject") && (
                      <button
                        type="button"
                        className="btn-accept"
                        style={{ marginTop: 8 }}
                        disabled={
                          actionLoading ||
                          selectedRequest.secretaryStatus ===
                            "ForwardedToSubject"
                        }
                        onClick={handleForwardToSubjectOfficer}
                      >
                        {actionLoading
                          ? "Forwarding..."
                          : selectedRequest.secretaryStatus ===
                            "ForwardedToSubject"
                          ? "Already Forwarded to Subject Officer"
                          : "Forward to Subject Officer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* HISTORY */}
          <section className="ds-card">
            <div className="history-header">
              <h3 className="card-title">Registration History (DS)</h3>
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
                            RDO: {req.ruralOfficerName} | DO:{" "}
                            {req.districtOfficerName}
                          </p>
                          <p className="letter-sub">Date: {req.createdAt}</p>
                          {req.secretaryStatus &&
                            req.secretaryStatus !== "Pending" && (
                              <p className="letter-sub">
                                DS Status: {req.secretaryStatus}
                              </p>
                            )}
                        </div>
                        <span
                          className={`badge ${
                            req.secretaryStatus === "AcceptedByDS"
                              ? "badge-success"
                              : req.secretaryStatus === "RejectedByDS"
                              ? "badge-danger"
                              : req.secretaryStatus === "ForwardedToSubject"
                              ? "badge-warning"
                              : "badge-warning"
                          }`}
                        >
                          {req.secretaryStatus}
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

export default DivisionalSecretary;