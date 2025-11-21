import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
import "./chairmanprofile.css";
const Chairmanprofile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!user) return <p style={{ textAlign: "center" }}>User not found</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* Profile Photo */}
        <div className="profile-image">
          <img
            src={user.photoURL || "https://via.placeholder.com/120"}
            alt="Profile"
          />
        </div>

        {/* Profile Details */}
        <h2 className="profile-name">{user.username}</h2>
        <p className="profile-role">පලාත් සංවර්ධන අධ්‍යක්ශක (Chairman)</p>

        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Contact:</strong> {user.contactnumber}</p>
          <p><strong>District:</strong> {user.district}</p>
          <p><strong>Division:</strong> {user.division}</p>
          <p><strong>Society:</strong> {user.society}</p>
        </div>

      </div>
    </div>
  );
};

export default Chairmanprofile;
