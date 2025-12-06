import React from "react";
import { motion } from "framer-motion";
import "../contact/contact.css";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut", delay },
  viewport: { once: true, amount: 0.3 },
});

const slideIn = (direction = "left", delay = 0) => {
  const x = direction === "left" ? -80 : 80;
  return {
    initial: { opacity: 0, x },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut", delay },
    viewport: { once: true, amount: 0.3 },
  };
};

export default function Contact() {
  return (
    <section id="contact-section" className="contact-wrapper">
      <div className="contact-container">
        {/* Heading */}
        <motion.h2 {...fadeUp(0)}>
          Contact Us / <span className="contact-subtitle">සම්බන්ධ වන්න</span>
        </motion.h2>

        {/* Intro */}
        <motion.p className="contact-intro" {...fadeUp(0.1)}>
          ඔබට ග්‍රාම සංවර්ධන සමිති, වැඩසටහන් හෝ පද්ධතිය පිළිබඳ{" "}
          <strong>උපදෙස්, යෝජනා, හෝ පැමිණිලි</strong> ඉදිරිපත් කිරීම සඳහා
          මෙම සම්බන්ධතා පිටුව භාවිතා කළ හැක. ඔබගේ අදහස්, සේවාවේ තත්ත්වය
          වැඩි දියුණු කිරීමට උදව් වේ.
        </motion.p>

        <div className="contact-content">
          {/* Contact Info Box */}
          <motion.div className="contact-info" {...slideIn("left", 0.15)}>
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

            <p className="contact-note">
              Office hours: Monday – Friday, 8.30 AM – 4.15 PM (excluding
              public holidays).
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            className="contact-form"
            {...slideIn("right", 0.2)}
            onSubmit={(e) => {
              e.preventDefault();
              // You can add real submit logic here (email service / backend)
              alert("Your message has been recorded. Thank you!");
            }}
          >
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
          </motion.form>
        </div>
      </div>
    </section>
  );
}