// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBzSQ-G6CaPLSKik4AflPuGDXImEhel7FI",
  authDomain: "office-60c13.firebaseapp.com",
  projectId: "office-60c13",
  storageBucket: "office-60c13.firebasestorage.app",
  messagingSenderId: "177908766787",
  appId: "1:177908766787:web:132a70b1130f9a88645cf6",
  measurementId: "G-81ZB52LSCT",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Optional: Add analytics (only in browser)
let analytics;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

// ✅ Export the Firestore database
export { db };
