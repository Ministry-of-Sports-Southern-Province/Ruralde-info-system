import React from "react";
import { motion } from "framer-motion";
import "../about/about.css";

const About = () => {
  return (
    <div className="about-container">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}   // <-- animate ONCE only
      >
        About Us
      </motion.h1>

      {/* Paragraph 1 */}
      <motion.p
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        Welcome to the Grama Samurdhi Portal. This platform provides resources related 
        to rural development and community welfare. Our mission is to empower local 
        communities through support programs.
      </motion.p>

      {/* Paragraph 2 */}
      <motion.p
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        We are committed to transparency, inclusivity, and sustainable development. 
        Our team collaborates with local authorities and community leaders.
      </motion.p>

      {/* Paragraph 3 */}
      <motion.p
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        Thank you for visiting our portal. Explore the available resources — together 
        we can build stronger, more resilient communities.
      </motion.p>

    </div>
  );
};

export default About;
