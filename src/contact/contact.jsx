// pages/Contact.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import "../contact/contact.css";

export default function Contact() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active"); // animate only once
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <section id="contact-section" className="contact-wrapper reveal fade-up">
      <div className="contact-container">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }} // <-- NO REVERSE!
        >
          Contact Us / සම්බන්ධ වන්න
        </motion.h2>

        {/* Intro */}
        <motion.p
          className="contact-intro"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          ඔබට ග්‍රාම සංවර්ධන සමිති පිළිබඳ අදහස්, ප්‍රශ්න හෝ යෝජනා
          ඇතුළත් කිරීමට මෙම පිටුව භාවිතා කරන්න.
        </motion.p>

        <div className="contact-content">

          {/* Contact Info Box */}
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3>Contact Information / සම්බන්ධතා තොරතුරු</h3>

            <p><span>📍 Address / ලිපිනය:</span> 03rd Floor, "Dakshinapaya", Ministry Complex, Labuduwa, Galle</p>
            <p><span>📞 Phone / දුරකථන:</span> +94 91 4936740</p>
            <p><span>📠 Fax / ෆැක්ස්:</span> +94 91 4936733</p>
            <p>
              <span>📧 Email / ඊ-මේල්:</span>{" "}
              <a href="mailto:min.ruraldev.sp@gmail.com" className="email-link">
                min.ruraldev.sp@gmail.com
              </a>
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            className="contact-form"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="name">
              Name / නම:
              <input type="text" id="name" name="name" placeholder="Enter your name" required />
            </label>

            <label htmlFor="email">
              Email / ඊ-මේල්:
              <input type="email" id="email" name="email" placeholder="Enter your email" required />
            </label>

            <label htmlFor="message">
              Message / පණිවිඩය:
              <textarea id="message" name="message" placeholder="Type your message here" required></textarea>
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
