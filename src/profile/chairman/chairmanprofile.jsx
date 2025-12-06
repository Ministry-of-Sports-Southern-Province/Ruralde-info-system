import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import "./chairmanprofile.css";
import { useNavigate } from "react-router-dom";

const Chairmanprofile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [requestedLetters, setRequestedLetters] = useState([]);
  const [historyLetters, setHistoryLetters] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          console.error("User not found");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // TODO: replace with real Firestore queries
    setRequestedLetters([
      {
        id: "C-L001",
        type: "දිස්ත්‍රික් වාර්තා ලිපිය",
        from: "ගාල්ල දිස්ත්‍රික් නිලධාරී",
        date: "2025-11-30",
        status: "Pending",
      },
      {
        id: "C-L002",
        type: "ග්‍රාම සංවර්ධන වාර්තා",
        from: "හම්බන්තොට දිස්ත්‍රික් නිලධාරී",
        date: "2025-12-02",
        status: "In Review",
      },
    ]);

    setHistoryLetters([
      {
        id: "C-H001",
        type: "අනුමත වාර්තා ලිපිය",
        from: "මාතර දිස්ත්‍රික් නිලධාරී",
        date: "2025-10-10",
        status: "Approved",
      },
      {
        id: "C-H002",
        type: "පොළිසියට යොමු කරන ලිපිය",
        from: "ගාල්ල දිස්ත්‍රික් නිලධාරී",
        date: "2025-09-21",
        status: "Approved",
      },
    ]);
  }, []);

  const handleSignOut = () => {
    const confirmed = window.confirm("Do you really want to sign out?");
    if (!confirmed) return;

    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>User not found</p>;

  const totalPending = requestedLetters.length;
  const totalHistory = historyLetters.length;
  const approvedCount = historyLetters.filter(
    (l) => l.status === "Approved"
  ).length;

  return (
    <div className="chairman-dashboard">
      <div className="dashboard-shell">
        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
          {/* header with sign out */}
          <div className="sidebar-header">
            <h2 className="sidebar-title">Chairman</h2>
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
              පලාත් සංවර්ධන අධ්‍යක්ෂක <span>(Chairman)</span>
            </p>

            <div className="sidebar-info">
              <p>
                <strong>District:</strong> {user.district || "N/A"}
              </p>
              <p>
                <strong>Division:</strong> {user.division || "N/A"}
              </p>
              <p>
                <strong>Contact:</strong> {user.contactnumber}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          </div>

          {/* Quick stats */}
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

          {/* Responsibilities */}
          <div className="sidebar-notes">
            <h4>Key Responsibilities</h4>
            <ul>
              <li>දිස්ත්‍රික් වාර්තා සමාලෝචනය කිරීම.</li>
              <li>ග්‍රාම සංවර්ධන යෝජනා අනුමත කිරීම.</li>
              <li>සමාජ සංවර්ධන නිලධාරීන් සමඟ සහයෝගයෙන් වැඩ කිරීම.</li>
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="dashboard-main">
          {/* Top row widgets */}
          <section className="dashboard-grid">
            <div className="dash-widget">
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
                        <p className="letter-sub">From: {letter.from}</p>
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
                  <p className="summary-label">Society</p>
                  <p className="summary-value">
                    {user.society || "Not Assigned"}
                  </p>
                </div>
              </div>
              <p className="summary-note">
                Ensure all incoming letters are reviewed and forwarded to
                relevant district officers within the expected timeline.
              </p>
            </div>
          </section>

          {/* History section */}
          <section className="dashboard-history">
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
                          <p className="letter-sub">From: {letter.from}</p>
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

export default Chairmanprofile;