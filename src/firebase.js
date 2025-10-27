// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzSQ-G6CaPLSKik4AflPuGDXImEhel7FI",
  authDomain: "office-60c13.firebaseapp.com",
  projectId: "office-60c13",
  storageBucket: "office-60c13.firebasestorage.app",
  messagingSenderId: "177908766787",
  appId: "1:177908766787:web:132a70b1130f9a88645cf6",
  measurementId: "G-81ZB52LSCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);