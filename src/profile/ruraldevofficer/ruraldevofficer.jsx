import React, { useEffect, useState } from "react";
import "./ruraldevofficer.css";
import { db } from "../../firebase.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Ruraldevofficer = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  // societies / registration decisions (your existing logic)
  const [historyDecisions, setHistoryDecisions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [societiesError, setSocietiesError] = useState("");

  const [selectedSociety, setSelectedSociety] = useState(null);
  const [referralNote, setReferralNote] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralSuccess, setReferralSuccess] = useState("");
  const [referralError, setReferralError] = useState("");

  const [decidedSocietyIds, setDecidedSocietyIds] = useState([]);
  const [selectedAlreadyDecided, setSelectedAlreadyDecided] = useState(false);
  const [selectedDecidedStatus, setSelectedDecidedStatus] = useState("");

  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Tabs: pending | history | analytics
  const [activeTab, setActiveTab] = useState("pending");

  // NEW: applications forwarded to RDO
  const [pendingApps, setPendingApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appsError, setAppsError] = useState("");

  useEffect(() => {
    const fetchUserAndData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user logged in.");
        setLoadingUser(false);
        return;
      }

      try {
        // 1) Fetch officer user profile
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

        // 2) Fetch societies for this officer's district + division
        if (userData.district && userData.division) {
          setLoadingSocieties(true);
          setSocietiesError("");

          try {
            const societiesRef = collection(db, "societies");
            const qSoc = query(
              societiesRef,
              where("district", "==", userData.district),
              where("division", "==", userData.division)
            );

            const snap = await getDocs(qSoc);
            const list = [];
            snap.forEach((socDoc) => {
              list.push({ id: socDoc.id, ...socDoc.data() });
            });

            setSocieties(list);
          } catch (socErr) {
            console.error("Error fetching societies for officer:", socErr);
            setSocietiesError("Failed to load registered societies.");
          } finally {
            setLoadingSocieties(false);
          }
        }

        // 3) Load decision history from Firestore for this officer
        if (userData.identitynumber) {
          setLoadingHistory(true);
          try {
            const histRef = collection(db, "districtRequests");
            const qHist = query(
              histRef,
              where("referredByOfficerId", "==", userData.identitynumber)
            );
            const histSnap = await getDocs(qHist);

            const hist = [];
            const decidedIds = [];

            histSnap.forEach((snapDoc) => {
              const d = snapDoc.data();
              hist.push({
                id: snapDoc.id,
                societyId: d.societyId || null,
                societyName: d.societyName || "Unnamed Society",
                registerNo: d.registerNo || "N/A",
                decision: d.status || "Pending",
                note: d.note || "",
                date:
                  d.createdAt && d.createdAt.toDate
                    ? d.createdAt.toDate().toLocaleString()
                    : "",
              });
              if (d.societyId) decidedIds.push(d.societyId);
            });

            hist.sort(
              (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
            );
            setHistoryDecisions(hist);
            setDecidedSocietyIds(decidedIds);
          } catch (histErr) {
            console.error("Error loading history:", histErr);
          } finally {
            setLoadingHistory(false);
          }
        }

        // 4) NEW: Load applications forwarded to this RDO
        if (userData.district && userData.division) {
          setLoadingApps(true);
          setAppsError("");

          try {
            const loansRef = collection(db, "loanApplications");
            const qLoans = query(
              loansRef,
              where("currentRole", "==", "rural_officer"),
              where("societyContext.district", "==", userData.district),
              where("societyContext.divisionName", "==", userData.division)
            );
            const loanSnap = await getDocs(qLoans);
            const apps = [];
            loanSnap.forEach((d) => {
              const data = d.data();
              apps.push({
                id: d.id,
                ...data,
                createdAt:
                  data.createdAt && data.createdAt.toDate
                    ? data.createdAt.toDate().toLocaleString()
                    : "",
              });
            });

            // You can also load scholarshipApplications / fundReleaseApplications
            // and push into same apps array (with a "type" field) if needed.

            setPendingApps(apps);
          } catch (appErr) {
            console.error("Error loading RDO applications:", appErr);
            setAppsError("Failed to load forwarded applications.");
          } finally {
            setLoadingApps(false);
          }
        }
      } catch (err) {
        console.error(err);
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

  // From main list: "View / Decide" (registration referrals)
  const handleSelectSociety = async (soc) => {
    setSelectedSociety(soc);
    setReferralNote("");
    setReferralError("");
    setReferralSuccess("");
    setSelectedAlreadyDecided(false);
    setSelectedDecidedStatus("");
    setSelectedHistoryItem(null);
    setActiveTab("pending");

    if (!user || !user.identitynumber) return;

    try {
      const histRef = collection(db, "districtRequests");
      const qCheck = query(
        histRef,
        where("referredByOfficerId", "==", user.identitynumber),
        where("societyId", "==", soc.id)
      );
      const snap = await getDocs(qCheck);

      if (!snap.empty) {
        const d = snap.docs[0].data();
        setSelectedAlreadyDecided(true);
        setSelectedDecidedStatus(d.status || "Already decided");
      }
    } catch (err) {
      console.error("Error checking decision:", err);
    }
  };

  // From history click – read-only view
  const handleHistoryClick = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setReferralNote("");
    setReferralError("");
    setReferralSuccess("");
    setActiveTab("history");

    let soc = null;
    if (historyItem.societyId) {
      soc = societies.find((s) => s.id === historyItem.societyId);
    }

    if (soc) {
      setSelectedSociety(soc);
    } else {
      setSelectedSociety({
        id: historyItem.societyId || "unknown",
        registerNo: historyItem.registerNo,
        societyName: historyItem.societyName,
        address: "",
        phone: "",
        email: "",
        memberCount: null,
        positions: {},
      });
    }

    setSelectedAlreadyDecided(true);
    setSelectedDecidedStatus(historyItem.decision);
  };

  // Submit referral to DO with Accept / Decline (registration)
  const handleSubmitReferral = async (e, decision) => {
    e.preventDefault();
    if (!user || !selectedSociety) return;

    setReferralError("");
    setReferralSuccess("");
    setReferralLoading(true);

    try {
      const histRef = collection(db, "districtRequests");
      const qCheck = query(
        histRef,
        where("referredByOfficerId", "==", user.identitynumber || ""),
        where("societyId", "==", selectedSociety.id)
      );
      const snap = await getDocs(qCheck);

      if (!snap.empty) {
        const d = snap.docs[0].data();
        setSelectedAlreadyDecided(true);
        setSelectedDecidedStatus(d.status || "Already decided");
        setReferralError(
          "මෙම ලියාපදිංචිය සදහා ඔබ දැනටමත් තීරණයක් ලබා දී ඇත. නැවත Accept/Decline නොහැක."
        );
        setReferralLoading(false);
        return;
      }

      const createdAtLocal = new Date();

      const newRef = await addDoc(collection(db, "districtRequests"), {
        type: "society_registration_reference",
        district: user.district || null,
        division: user.division || null,
        referredByOfficerId: user.identitynumber || null,
        referredByName: user.username || null,
        officerPosition: user.position || "village_officer",

        societyId: selectedSociety.id,
        societyName: selectedSociety.societyName || null,
        registerNo: selectedSociety.registerNo || null,
        societyAddress: selectedSociety.address || null,
        societyPhone: selectedSociety.phone || null,
        societyEmail: selectedSociety.email || null,
        memberCount: selectedSociety.memberCount || null,
        positions: selectedSociety.positions || null,

        note: referralNote || "",
        status: decision === "accept" ? "Accepted" : "Declined",
        createdAt: serverTimestamp(),
      });

      const decisionItem = {
        id: newRef.id,
        societyId: selectedSociety.id,
        societyName: selectedSociety.societyName || "Unnamed Society",
        registerNo: selectedSociety.registerNo || "N/A",
        decision: decision === "accept" ? "Accepted" : "Declined",
        note: referralNote || "",
        date: createdAtLocal.toLocaleString(),
      };

      setHistoryDecisions((prev) => [decisionItem, ...prev]);
      setDecidedSocietyIds((prev) => [...prev, selectedSociety.id]);
      setSelectedAlreadyDecided(true);
      setSelectedDecidedStatus(decisionItem.decision);

      setReferralSuccess(
        decision === "accept"
          ? "සමිතිය (Accepted) ලෙස දිස්ත්‍රික් නිලධාරීට යොමු කිරීම සාර්ථකයි."
          : "සමිතිය (Declined) ලෙස දිස්ත්‍රික් නිලධාරීට යොමු කිරීම සාර්ථකයි."
      );
      setReferralNote("");
    } catch (err) {
      console.error("Error sending referral:", err);
      setReferralError(
        "යොමු කිරීමේදී දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සහ කරන්න."
      );
    } finally {
      setReferralLoading(false);
    }
  };

  // NEW: Forward RDO-handled application to District Officer
  const handleForwardAppToDistrictOfficer = async (appId) => {
    if (!user) return;
    setAppsError("");
    setActionError("");
    setActionSuccess("");

    try {
      const ref = doc(db, "loanApplications", appId); // here we handle loans; add others if needed
      await updateDoc(ref, {
        currentRole: "district_officer",
        status: "ForwardedToDistrictOfficer",
        lastActionBy: user.username || user.email || "RuralOfficer",
        lastActionAt: new Date(),
      });

      setPendingApps((prev) => prev.filter((a) => a.id !== appId));
      setActionSuccess("අයදුම්පත දිස්ත්‍රික් නිලධාරී (District Officer) වෙත යොමු කරන ලදී.");
    } catch (err) {
      console.error("Error forwarding to DO:", err);
      setActionError("District Officer වෙත යොමු කිරීමේදී දෝෂයක් සිදු විය.");
    }
  };

  if (loadingUser) return <p className="rural-loading">Loading profile...</p>;
  if (error) return <p className="rural-error">{error}</p>;
  if (!user) return null;

  const totalHistory = historyDecisions.length;
  const approvedCount = historyDecisions.filter(
    (d) => d.decision === "Accepted"
  ).length;
  const declinedCount = historyDecisions.filter(
    (d) => d.decision === "Declined"
  ).length;

  const societiesToShow = societies.filter(
    (s) => !decidedSocietyIds.includes(s.id)
  );

  const chairman = selectedSociety?.positions?.chairman || {};
  const secretary = selectedSociety?.positions?.secretary || {};
  const treasurer = selectedSociety?.positions?.treasurer || {};

  const actionDisabled =
    referralLoading || selectedAlreadyDecided || !!selectedHistoryItem;

  return (
    <section className="rural-dashboard">
      <div className="rural-shell">
        {/* LEFT: PROFILE SIDEBAR */}
        {/* (unchanged profile sidebar, same as your code) */}
        {/* ... keep everything in the sidebar exactly as you have ... */}

        {/* I skip re-pasting to keep this short – use your existing sidebar code here */}

        {/* RIGHT: TABBED MAIN AREA */}
        <main className="rural-main">
          {/* Tabs */}
          {/* ... your existing tab bar & headers ... */}

          {activeTab === "pending" && (
            <>
              {/* Your existing "තීරණයට බාකි ලියාපදිංචි සමිති" section */}
              {/* ... keep all that registration-related UI ... */}

              {/* NEW: Applications forwarded to RDO */}
              <section className="rural-card" style={{ marginTop: 16 }}>
                <h3 className="card-title">
                  ඔබ වෙත යොමු වූ ණය අයදුම්පත් (Applications at RDO)
                </h3>
                <p className="muted-text">
                  Society Officer / Chairman / Secretary / Treasurer මඟින්
                  &quot;Forward to Rural Officer&quot; කරන ලද ණය අයදුම්පත් මෙහි
                  පෙන්වයි. තීරණයෙන් පසු District Officer වෙත යොමු කරන්න.
                </p>

                {loadingApps ? (
                  <p className="muted-text">අයදුම්පත් රදිමින්...</p>
                ) : appsError ? (
                  <p className="rural-error">{appsError}</p>
                ) : pendingApps.length === 0 ? (
                  <p className="muted-text">
                    දැනට ඔබ වෙත යොමු කරන ලද ණය අයදුම්පත් නොමැත.
                  </p>
                ) : (
                  <table className="society-table">
                    <thead>
                      <tr>
                        <th>ඉල්ලුම්කරුගේ නම</th>
                        <th>ඉල්ලුම් කරන ණය මුදල (රු.)</th>
                        <th>ව්‍යාපෘතිය</th>
                        <th>Submitted</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApps.map((app) => (
                        <tr key={app.id}>
                          <td>{app.borrowerName || "-"}</td>
                          <td>{app.loanAmount || "-"}</td>
                          <td>{app.projectType || "-"}</td>
                          <td>{app.createdAt || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-accept"
                              onClick={() =>
                                handleForwardAppToDistrictOfficer(app.id)
                              }
                            >
                              Forward to District Officer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {actionError && (
                  <p className="rural-error" style={{ marginTop: 8 }}>
                    {actionError}
                  </p>
                )}
                {actionSuccess && (
                  <p className="rural-success" style={{ marginTop: 8 }}>
                    {actionSuccess}
                  </p>
                )}
              </section>
            </>
          )}

          {/* History & Analytics tabs remain as in your existing file */}
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

export default Ruraldevofficer;