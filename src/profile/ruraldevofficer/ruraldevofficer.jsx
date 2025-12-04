import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import "../ruraldevofficer/ruraldevofficer.css";
const Ruraldevofficer = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Rural Development Officer Profile</h2>

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
      </div>
    </div>
  );
};

export default Ruraldevofficer;
