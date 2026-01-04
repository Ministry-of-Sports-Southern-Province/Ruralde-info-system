import React, { useEffect, useState } from "react";
import "./societyOfficer.css";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const positionLabels = {
  society_officer: "Society Officer",
  society_chairman: "සභාපති / Society Chairman",
  society_secretary: "ලේකම් / Society Secretary",
  society_treasurer: "භාණ්ඩාගාරික / Society Treasurer",
};

const SocietyOfficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  // Pending applications by type
  const [scholarshipApps, setScholarshipApps] = useState([]);
  const [loanApps, setLoanApps] = useState([]);
  const [fundApps, setFundApps] = useState([]);
  const [memberLists, setMemberLists] = useState([]);

  const [loadingApps, setLoadingApps] = useState(false);

  const [historyApps, setHistoryApps] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    const fetchUserAndApps = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingProfile(false);
        return;
      }

      try {
        // 1. Load user profile
        const ref = doc(db, "users", userId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("User not found.");
          setLoadingProfile(false);
          return;
        }

        const u = snap.data();
        console.log("SocietyOfficer user profile:", u);
        setUser(u);
        setLoadingProfile(false);

        if (!u.societyRegisterNo) {
          console.warn(
            "SocietyOfficer: 'societyRegisterNo' missing on user document. " +
              "Startup must update this; it should match societyContext.registerNo in applications."
          );
        }
        if (!u.position) {
          console.warn(
            "SocietyOfficer: 'position' missing on user document. " +
              "Set position = 'society_officer', 'society_chairman', etc."
          );
        }

        setLoadingApps(true);

        const regNo = u.societyRegisterNo || null;
        const role = u.position || null;

        // ----------------------
        // SCHOLARSHIP APPLICATIONS
        // ----------------------
        const schRef = collection(db, "scholarshipApplications");

        // Base query: all scholarship apps (we'll filter in JS)
        const schSnap = await getDocs(schRef);
        const schListRaw = schSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Filter logic:
        const schList = schListRaw
          .filter((app) => {
            // If we have registerNo, prefer that
            if (regNo && app.societyContext?.registerNo) {
              return app.societyContext.registerNo === regNo;
            }
            // Backward compatibility: if no societyContext, show all for this user
            // (you can restrict later when all data has societyContext)
            return true;
          })
          .filter((app) => {
            // If app has currentRole and we know this user's role, use it
            if (role && app.currentRole) {
              return app.currentRole === role;
            }
            // If app has no currentRole, still show it (legacy data)
            return true;
          })
          .map((data) => ({
            id: data.id,
            type: "scholarship",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        // ----------------------
        // LOAN APPLICATIONS
        // ----------------------
        const loanRef = collection(db, "loanApplications");
        const loanSnap = await getDocs(loanRef);
        const loanListRaw = loanSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const loanList = loanListRaw
          .filter((app) => {
            if (regNo && app.societyContext?.registerNo) {
              return app.societyContext.registerNo === regNo;
            }
            return true;
          })
          .filter((app) => {
            if (role && app.currentRole) {
              return app.currentRole === role;
            }
            return true;
          })
          .map((data) => ({
            id: data.id,
            type: "loan",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        // ----------------------
        // FUND RELEASE APPLICATIONS
        // ----------------------
        const fundRef = collection(db, "fundReleaseApplications");
        const fundSnap = await getDocs(fundRef);
        const fundListRaw = fundSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const fundList = fundListRaw
          .filter((app) => {
            if (regNo && app.societyContext?.registerNo) {
              return app.societyContext.registerNo === regNo;
            }
            return true;
          })
          .filter((app) => {
            if (role && app.currentRole) {
              return app.currentRole === role;
            }
            return true;
          })
          .map((data) => ({
            id: data.id,
            type: "fund",
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          }));

        // ----------------------
        // MEMBER LISTS (FO/04)
        // ----------------------
        const memberRef = collection(db, "societyMemberLists");
        const qMember = regNo
          ? query(memberRef, where("societyContext.registerNo", "==", regNo))
          : memberRef;
        const memberSnap = await getDocs(qMember);
        const memberListObjs = memberSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleString()
                : "",
          };
        });

        console.log("Loaded for this profile:", {
          regNo,
          role,
          scholarshipApps: schList.length,
          loanApps: loanList.length,
          fundApps: fundList.length,
          memberLists: memberListObjs.length,
        });

        setScholarshipApps(schList);
        setLoanApps(loanList);
        setFundApps(fundList);
        setMemberLists(memberListObjs);
        setHistoryApps([]); // still placeholder
      } catch (err) {
        console.error("Error loading society officer or applications:", err);
        setError("Failed to load profile or applications.");
      } finally {
        setLoadingApps(false);
      }
    };

    fetchUserAndApps();
  }, []);

  const handleSignOut = () => {
    const ok = window.confirm("Do you really want to sign out?");
    if (!ok) return;
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // Forward to another society position (chairman / secretary / treasurer)
  const handleForward = async (collectionName, appId, targetRole) => {
    if (!user) return;

    setActionError("");
    setActionSuccess("");

    try {
      const ref = doc(db, collectionName, appId);
      await updateDoc(ref, {
        currentRole: targetRole,
        status: `ForwardedTo_${targetRole}`,
        lastActionBy: user.username || user.email || "SocietyOfficer",
        lastActionAt: new Date(),
      });

      if (collectionName === "scholarshipApplications") {
        setScholarshipApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "loanApplications") {
        setLoanApps((prev) => prev.filter((a) => a.id !== appId));
      } else if (collectionName === "fundReleaseApplications") {
        setFundApps((prev) => prev.filter((a) => a.id !== appId));
      }

      setActionSuccess(
        targetRole === "society_chairman"
          ? "අයදුම්පත සභාපති (Chairman) වෙත යොමු කරන ලදී."
          : targetRole === "society_secretary"
          ? "අයදුම්පත ලේකම් (Secretary) වෙත යොමු කරන ලදී."
          : "අයදුම්පත භාණ්ඩාගාරික (Treasurer) වෙත යොමු කරන ලදී."
      );
    } catch (err) {
      console.error("Error forwarding application:", err);
      setActionError("Forward කිරීමේදී දෝෂයක් සිදු විය.");
    }
  };

  if (loadingProfile)
    return <p className="society-loading">Loading profile...</p>;
  if (error) return <p className="society-error">{error}</p>;
  if (!user) return null;

  const label = positionLabels[user.position] || "Society Officer";
  const created =
    user.createdAt && user.createdAt.toDate
      ? user.createdAt.toDate().toLocaleDateString()
      : "";

  const totalPending =
    scholarshipApps.length + loanApps.length + fundApps.length;
  const totalHistory = historyApps.length;
  const approvedCount = historyApps.filter(
    (l) => l.status === "Approved"
  ).length;

  return (
    <section className="society-dashboard">
      <div className="society-shell">
        {/* LEFT: PROFILE / SUMMARY */}
        <aside className="society-sidebar">
          <div className="society-sidebar-topbar">
            <div className="sidebar-brand">
              <p>දකුණු පළාත් ග්‍රාම සංවර්ධන දෙපාර්තමේන්තුව</p>
              <span>Rural Development Society – Officer Panel</span>
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
            <div className="info-row">
              <span className="info-label">Reg. No</span>
              <span className="info-value">
                {user.societyRegisterNo || "N/A"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <p className="stat-label">Pending Applications</p>
              <p className="stat-value">{totalPending}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Approved (History)</p>
              <p className="stat-value">{approvedCount}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total History</p>
              <p className="stat-value">{totalHistory}</p>
            </div>
          </div>
        </aside>

        {/* RIGHT: APPLICATIONS */}
        <main className="society-main">
          {/* Pending – Scholarship */}
          <section className="society-card">
            <h4 className="card-title">Pending Scholarship Applications</h4>
            {loadingApps ? (
              <p className="muted-text">අයදුම්පත් රදිමින්...</p>
            ) : scholarshipApps.length === 0 ? (
              <p className="muted-text">
                දැනට {label} මට්ටමට යොමු වූ ශිෂ්‍යත්ව අයදුම්පත් නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {scholarshipApps.map((app) => (
                  <li key={app.id} className="letter-item">
                    <div>
                      <p className="letter-type">
                        <strong>{app.fullName}</strong> – O/L {app.examYear}
                      </p>
                      <p className="letter-sub">
                        Address: {app.address?.slice(0, 80)}...
                      </p>
                      {app.createdAt && (
                        <p className="letter-sub">
                          Submitted: {app.createdAt}
                        </p>
                      )}
                    </div>

                    {user.position === "society_officer" && (
                      <div className="letter-actions">
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "scholarshipApplications",
                              app.id,
                              "society_chairman"
                            )
                          }
                        >
                          Forward to Chairman
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "scholarshipApplications",
                              app.id,
                              "society_secretary"
                            )
                          }
                        >
                          Forward to Secretary
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "scholarshipApplications",
                              app.id,
                              "society_treasurer"
                            )
                          }
                        >
                          Forward to Treasurer
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pending – Loan applications */}
          <section className="society-card">
            <h4 className="card-title">Pending Loan Applications</h4>
            {loadingApps ? (
              <p className="muted-text">අයදුම්පත් රදිමින්...</p>
            ) : loanApps.length === 0 ? (
              <p className="muted-text">
                දැනට {label} මට්ටමට යොමු වූ ණය අයදුම්පත් නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {loanApps.map((app) => (
                  <li key={app.id} className="letter-item">
                    <div>
                      <p className="letter-type">
                        <strong>{app.borrowerName}</strong> – Loan:{" "}
                        {app.loanAmount} රු.
                      </p>
                      <p className="letter-sub">
                        Project: {app.projectType || "N/A"}
                      </p>
                      {app.createdAt && (
                        <p className="letter-sub">
                          Submitted: {app.createdAt}
                        </p>
                      )}
                    </div>

                    {user.position === "society_officer" && (
                      <div className="letter-actions">
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "loanApplications",
                              app.id,
                              "society_chairman"
                            )
                          }
                        >
                          Forward to Chairman
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "loanApplications",
                              app.id,
                              "society_secretary"
                            )
                          }
                        >
                          Forward to Secretary
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "loanApplications",
                              app.id,
                              "society_treasurer"
                            )
                          }
                        >
                          Forward to Treasurer
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pending – Fund release applications */}
          <section className="society-card">
            <h4 className="card-title">Pending Fund Release Applications</h4>
            {loadingApps ? (
              <p className="muted-text">අයදුම්පත් රදිමින්...</p>
            ) : fundApps.length === 0 ? (
              <p className="muted-text">
                දැනට {label} මට්ටමට යොමු වූ මුදල් නිදහස් කිරීමේ අයදුම්පත්
                නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {fundApps.map((app) => (
                  <li key={app.id} className="letter-item">
                    <div>
                      <p className="letter-type">
                        <strong>{app.societyName || "Society"}</strong> –{" "}
                        Request: {app.requestedAmount || "N/A"} රු.
                      </p>
                      <p className="letter-sub">
                        District: {app.district} | Division:{" "}
                        {app.divisionName}
                      </p>
                      {app.createdAt && (
                        <p className="letter-sub">
                          Submitted: {app.createdAt}
                        </p>
                      )}
                    </div>

                    {user.position === "society_officer" && (
                      <div className="letter-actions">
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "fundReleaseApplications",
                              app.id,
                              "society_chairman"
                            )
                          }
                        >
                          Forward to Chairman
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "fundReleaseApplications",
                              app.id,
                              "society_secretary"
                            )
                          }
                        >
                          Forward to Secretary
                        </button>
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() =>
                            handleForward(
                              "fundReleaseApplications",
                              app.id,
                              "society_treasurer"
                            )
                          }
                        >
                          Forward to Treasurer
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {actionError && (
              <p className="society-error" style={{ marginTop: 8 }}>
                {actionError}
              </p>
            )}
            {actionSuccess && (
              <p className="society-success" style={{ marginTop: 8 }}>
                {actionSuccess}
              </p>
            )}
          </section>

          {/* Member lists (FO/04) */}
          <section className="society-card">
            <h4 className="card-title">
              Society Member Loan Requests (FO/04 Lists)
            </h4>
            {loadingApps ? (
              <p className="muted-text">Loading member lists...</p>
            ) : memberLists.length === 0 ? (
              <p className="muted-text">
                දැනට මෙම සමිතිය සඳහා සාමාජික ණය ලැයිස්තු (FO/04) සුරක්ෂිත කර
                නොමැත.
              </p>
            ) : (
              <ul className="letter-list">
                {memberLists.map((list) => (
                  <li key={list.id} className="letter-item">
                    <div>
                      <p className="letter-type">
                        Member list – {list.members?.length || 0} members
                      </p>
                      {list.createdAt && (
                        <p className="letter-sub">
                          Submitted: {list.createdAt}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* History placeholder */}
          <section className="society-card">
            <div className="history-header">
              <h4 className="card-title">Application History</h4>
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
                {historyApps.length === 0 ? (
                  <p className="muted-text">No history records yet.</p>
                ) : (
                  <ul className="letter-list">
                    {historyApps.map((l) => (
                      <li key={l.id} className="letter-item">
                        <div>
                          <p className="letter-type">
                            <strong>{l.fullName || l.borrowerName}</strong>
                          </p>
                          {l.examYear && (
                            <p className="letter-sub">
                              Exam Year: {l.examYear}
                            </p>
                          )}
                          {l.loanAmount && (
                            <p className="letter-sub">
                              Loan: {l.loanAmount} රු.
                            </p>
                          )}
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