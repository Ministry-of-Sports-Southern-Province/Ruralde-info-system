// pages/Contact.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../contact/contact.css"; // Make sure this path matches your project

export default function Contact() {
  return (
    <div className="contact-container">
      <h2>Contact Us / සම්බන්ධ වන්න</h2>
      <p>
        ඔබට ග්‍රාම සංවර්ධන සමිති පිළිබඳව අදහස්, ප්‍රශ්න හෝ යෝජනා ඇතුළත් කිරීමට
        මෙම පිටුව භාවිතා කරන්න.
      </p>

      <div className="contact-content">
        <div className="contact-info">
          <h3>Contact Information / සම්බන්ධතා තොරතුරු</h3>
          <p>Address / ලිපිනය: 03 "floor," "Dakshinapaya",Ministry Complex,Labuduwa,Galle</p>
          <p>Phone / දුරකථන: +91 4936740 </p>
          <p>Fax / ෆැක්ස් : +91 4936733</p>
          <p>Email / ඊ-මේල්:min.ruraldev.sp@gmail.com</p>
          
        </div>

        {/* Contact Form */}
        <form className="contact-form">
          <label>
            Name / නම:
            <input type="text" placeholder="Enter your name" />
          </label>

          <label>
            Email / ඊ-මේල්:
            <input type="email" placeholder="Enter your email" />
          </label>

          <label>
            Message / පණිවිඩය:
            <textarea placeholder="Type your message here"></textarea>
          </label>

          <button type="submit" className="submit-btn">
            Send / යවන්න
          </button>
         
        </form>
       </div>
    </div>
  );
}
