// pages/Contact.jsx
import React from "react";
import "../contact/contact.css";

export default function Contact() {
  return (
    <section className="contact-container">
      <h2>Contact Us / සම්බන්ධ වන්න</h2>
      <p className="contact-intro">
        ඔබට ග්‍රාම සංවර්ධන සමිති පිළිබඳ අදහස්, ප්‍රශ්න හෝ යෝජනා ඇතුළත් කිරීමට
        මෙම පිටුව භාවිතා කරන්න.
      </p>

      <div className="contact-content">
        {/* === Contact Information === */}
        <div className="contact-info">
          <h3>Contact Information / සම්බන්ධතා තොරතුරු</h3>
          <p>
            <span>📍 Address / ලිපිනය:</span> 03rd Floor, "Dakshinapaya",
            Ministry Complex, Labuduwa, Galle
          </p>
          <p>
            <span>📞 Phone / දුරකථන:</span> +94 91 4936740
          </p>
          <p>
            <span>📠 Fax / ෆැක්ස්:</span> +94 91 4936733
          </p>
          <p>
            <span>📧 Email / ඊ-මේල්:</span>{" "}
            <a
              href="mailto:min.ruraldev.sp@gmail.com"
              className="email-link"
            >
              min.ruraldev.sp@gmail.com
            </a>
          </p>
        </div>

        {/* === Contact Form === */}
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="name">
            Name / නම:
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              required
            />
          </label>

          <label htmlFor="email">
            Email / ඊ-මේල්:
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </label>

          <label htmlFor="message">
            Message / පණිවිඩය:
            <textarea
              id="message"
              name="message"
              placeholder="Type your message here"
              required
            ></textarea>
          </label>

          <button type="submit" className="submit-btn">
            Send / යවන්න
          </button>
        </form>
      </div>
    </section>
  );
}
