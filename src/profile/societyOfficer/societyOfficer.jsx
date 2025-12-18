import React, { useEffect, useState } from "react";
import "./societyOfficer.css";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const positionLabels = {
  society_chairman: "සභාපති / Society Chairman",
  society_secretary: "ලේකම් / Society Secretary",
  society_treasurer: "භාණ්ඩාගාරික / Society Treasurer",
};

const SocietyOfficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [requestedLetters, setRequestedLetters] = useState([]);
  const [historyLetters, setHistoryLetters] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUser(snap.data());
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error("Error loading society officer:", err);
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Dummy data – replace with Firestore later
    setRequestedLetters([
      {
        id: "S-L001",
        type: "සභා වෙනස් කිරීමේ ලිපිය",
        date: "2025-11-30",
        status: "Pending",
      },
      {
        id: "S-L002",
        type: "ණය ඉල්ලුම් වාර්තාව",
        date: "2025-12-05",
        status: "In Review",
      },
    ]);

    setHistoryLetters([
      {
        id: "S-H001",
        type: "සමිතිය වාර්ෂික වාර්තාව",
        date: "2025-10-10",
        status: "Approved",
      },
      {
        id: "S-H002",
        type: "ගිණුම් තහවුරු කිරීමේ ලිපිය",
        date: "2025-09-22",
        status: "Approved",
      },
    ]);
  }, []);

  const handleSignOut = () => {
    const ok = window.confirm("Do you really want to sign out?");
    if (!ok) return;
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  if (loading) return <p className="society-loading">Loading profile...</p>;
  if (error) return <p className="society-error">{error}</p>;
  if (!user) return null;

  const label = positionLabels[user.position] || "Society Officer";
  const created =
    user.createdAt && user.createdAt.toDate
      ? user.createdAt.toDate().toLocaleDateString()
      : "";

  const totalPending = requestedLetters.length;
  const totalHistory = historyLetters.length;
  const approvedCount = historyLetters.filter(
    (l) => l.status === "Approved"
  ).length;

  return (
    <section className="society-dashboard">
      <div className="society-shell">
        {/* LEFT: PROFESSIONAL PROFILE COLUMN */}
        <aside className="society-sidebar">
          {/* Top bar */}
          <div className="society-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development Society Officer</span>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>

          {/* Profile card */}
          <div className="society-profile-card">
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
          <div className="society-info-card">
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
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Pending / In Review</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Approved Letters</p>
              <p className="stat-value">{approvedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT: LETTERS COLUMN */}
        <main className="society-main">
          {/* Requested letters */}
          <section className="society-card">
            <h4 className="card-title">Requested Letters</h4>
            {requestedLetters.length === 0 ? (
              <p className="muted-text">No pending letter requests.</p>
            ) : (
              <ul className="letter-list">
                {requestedLetters.map((l) => (
                  <li key={l.id} className="letter-item">
                    <div>
                      <p className="letter-type">
                        <strong>{l.type}</strong>
                      </p>
                      <p className="letter-sub">Date: {l.date}</p>
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
          </section>

          {/* History */}
          <section className="society-card">
            <div className="history-header">
              <h4 className="card-title">Letter History</h4>
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
                {historyLetters.length === 0 ? (
                  <p className="muted-text">No history records.</p>
                ) : (
                  <ul className="letter-list">
                    {historyLetters.map((l) => (
                      <li key={l.id} className="letter-item">
                        <div>
                          <p className="letter-type">
                            <strong>{l.type}</strong>
                          </p>
                          <p className="letter-sub">Date: {l.date}</p>
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
        </main>
      </div>
    </section>
  );
};

export default SocietyOfficer;