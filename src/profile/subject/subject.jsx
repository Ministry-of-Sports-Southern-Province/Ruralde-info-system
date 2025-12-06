import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import "../subject/subject.css";
import { useNavigate } from "react-router-dom";

const Subject = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [requestedLetters, setRequestedLetters] = useState([]);
  const [historyLetters, setHistoryLetters] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // NEW: state for custom sign-out modal
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          setError("User not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
      }
      setLoading(false);
    };

    fetchUser();

    // TODO: replace with Firestore queries filtered by this subject officer
    setRequestedLetters([
      {
        id: "L001",
        type: "ග්‍රාම සංවර්ධන ලිපිය",
        society: "නගදඹ ග්‍රාම සංවර්ධන සමිතිය",
        date: "2025-12-01",
        status: "Pending",
      },
      {
        id: "L002",
        type: "උපදෙස් ලිපිය",
        society: "වඳුරඔ ග්‍රාම සංවර්ධන සමිතිය",
        date: "2025-12-03",
        status: "In Review",
      },
    ]);

    setHistoryLetters([
      {
        id: "H001",
        type: "අනුමත ලිපිය",
        society: "අක්මීමණ ග්‍රාම සංවර්ධන සමිතිය",
        date: "2025-11-10",
        status: "Approved",
      },
      {
        id: "H002",
        type: "උපදෙස් ලිපිය",
        society: "නාගොඩ ග්‍රාම සංවර්ධන සමිතිය",
        date: "2025-10-02",
        status: "Approved",
      },
    ]);
  }, []);

  // open modal instead of direct logout
  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setShowSignOutModal(false);
    navigate("/login");
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!user) return null;

  const totalPending = requestedLetters.length;
  const totalHistory = historyLetters.length;
  const approvedCount = historyLetters.filter(
    (l) => l.status === "Approved"
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
            <h2 className="sidebar-title">Subject Officer</h2>
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
                <strong>Contact:</strong> {user.contactnumber}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Pending Letters</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Approved History</p>
              <p className="stat-value">{approvedCount}</p>
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
              <li>දිනපතා නොමිලේ ලිපි අයදුම් සමාලෝචනය කරන්න.</li>
              <li>අනුමත/ප්‍රතික්ෂේප/සමාලෝචනය යාවත්කාලීන කරන්න.</li>
              <li>දිස්ත්‍රික් හා ග්‍රාම නිලධාරීන් සමඟ සම්බන්ධතාවය තබා ගන්න.</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="subject-main">
          {/* TOP GRID */}
          <section className="subject-grid">
            {/* Requested letters */}
            <div className="sub-widget">
              <h3 className="widget-title">Latest Requested Letters</h3>
              {requestedLetters.length === 0 ? (
                <p className="muted-text">No pending letter requests.</p>
              ) : (
                <ul className="letter-list">
                  {requestedLetters.map((letter) => (
                    <li key={letter.id} className="letter-item">
                      <div>
                        <p className="letter-type">
                          <strong>{letter.type}</strong>
                        </p>
                        <p className="letter-sub">
                          Society: {letter.society}
                        </p>
                        <p className="letter-sub">Date: {letter.date}</p>
                      </div>
                      <span
                        className={`badge ${
                          letter.status === "Approved"
                            ? "badge-success"
                            : letter.status === "Rejected"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {letter.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile summary */}
            <div className="sub-widget">
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
                  <p className="summary-label">Assigned Society</p>
                  <p className="summary-value">
                    {user.society || "Not Assigned"}
                  </p>
                </div>
              </div>
              <p className="summary-note">
                Subject officer is responsible for subject‑wise monitoring,
                reporting, and support for all societies under the assigned area.
              </p>
            </div>
          </section>

          {/* HISTORY SECTION */}
          <section className="subject-history">
            <div className="history-header">
              <h3 className="widget-title">Letter History</h3>
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
                {historyLetters.length === 0 ? (
                  <p className="muted-text">No history records.</p>
                ) : (
                  <ul className="letter-list">
                    {historyLetters.map((letter) => (
                      <li key={letter.id} className="letter-item">
                        <div>
                          <p className="letter-type">
                            <strong>{letter.type}</strong>
                          </p>
                          <p className="letter-sub">
                            Society: {letter.society}
                          </p>
                          <p className="letter-sub">Date: {letter.date}</p>
                        </div>
                        <span
                          className={`badge ${
                            letter.status === "Approved"
                              ? "badge-success"
                              : letter.status === "Rejected"
                              ? "badge-danger"
                              : "badge-warning"
                          }`}
                        >
                          {letter.status}
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

export default Subject;