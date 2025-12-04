import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import "../subject/subject.css";

const Subject = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Requested letters & history (you can later load these from Firestore)
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

    // TODO: replace this dummy data with Firestore queries
    // Example: collection(db, "letters") where("officerId", "==", userId)
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
        society: "වදුරඔ ග්‍රාම සංවර්ධන සමිතිය",
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

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!user) return null;

  return (
    <div className="subject-container">
      <div className="subject-box">
        <h2 className="subject-title">Subject Officer Profile</h2>

        <div className="subject-layout">
          {/* LEFT: Profile info */}
          <div className="subject-profile-column">
            <h3 className="section-title">Profile Information</h3>
            <div className="profile-info">
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Contact Number:</strong> {user.contactnumber}</p>
              <p><strong>Position:</strong> {user.position}</p>
              <p><strong>District:</strong> {user.district}</p>
              <p><strong>Division:</strong> {user.division || "N/A"}</p>
              <p><strong>Society:</strong> {user.society || "N/A"}</p>
              <p><strong>Identity Number:</strong> {user.identitynumber}</p>
            </div>

            {/* Recommended extra info for officer */}
            <div className="profile-recommendations">
              <h4>Officer Notes</h4>
              <ul>
                <li>Check new letter requests daily.</li>
                <li>Update status (Approved / Rejected / In Review) promptly.</li>
                <li>Maintain communication with district and society officers.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Requested letters + History */}
          <div className="subject-letters-column">
            <h3 className="section-title">Requested Letters</h3>

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
                      <p className="letter-sub">
                        Date: {letter.date}
                      </p>
                    </div>
                    <span
                      className={`letter-status badge ${
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

            <button
              type="button"
              className="history-toggle-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>

            {showHistory && (
              <div className="history-section">
                <h3 className="section-title small">Letter History</h3>
                {historyLetters.length === 0 ? (
                  <p className="muted-text">No history records.</p>
                ) : (
                  <ul className="letter-list history-list">
                    {historyLetters.map((letter) => (
                      <li key={letter.id} className="letter-item">
                        <div>
                          <p className="letter-type">
                            <strong>{letter.type}</strong>
                          </p>
                          <p className="letter-sub">
                            Society: {letter.society}
                          </p>
                          <p className="letter-sub">
                            Date: {letter.date}
                          </p>
                        </div>
                        <span
                          className={`letter-status badge ${
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subject;