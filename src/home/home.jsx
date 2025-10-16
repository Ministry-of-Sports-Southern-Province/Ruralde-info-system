import React from "react";
import { Link } from "react-router-dom";
import "../home/home.css"; // optional for styling

export default function Home() {
  return (
    <div className="page container">
      <h1 className="page-title">ආරම්භක පිටුව / Home</h1>
      <p>Welcome to the Grama Samurdhi Portal. Choose a form to start:</p>

      <div className="card-grid">
        <Link to="/develop" className="card">
          <h3>ග්‍රාම සංවර්ධන සමිති ගිණුමෙන් මුදල් නිදහස් කර ගැනීම සඳහා ඉල්ලුම් පත්‍රය</h3>
        </Link>
        <Link to="/member" className="card">
          <h3>ග්‍රාම සංවර්ධන සමිති ගිණුමෙන් ණය ඉල්ලුම් කරන සාමාජිකයින්ගේ තොරතුරු</h3>
        </Link>
        <Link to="/society" className="card">
          <h3>සමිති ගිණුම - ණය යෙදවුම් වාර්තාව</h3>
        </Link>
         <Link to="/student" className="card">
          <h3>ගැමිසෙත ශිෂ්‍යත්ව අයදුම් පත්‍රය</h3>
        </Link>
      </div>
    </div>
  );
}
