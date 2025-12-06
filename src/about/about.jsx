import React from "react";
import { motion } from "framer-motion";
import "../about/about.css";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut", delay },
  viewport: { once: true, amount: 0.3 },
});

const About = () => {
  return (
    <section className="about-container">
      {/* Title */}
      <motion.h1 {...fadeUp(0)}>
        දක්ෂිණ පළාත් ග්‍රාම සංවර්ධන තොරතුරු පද්ධතිය
        <span className="about-subtitle"> / Rural Development Information System</span>
      </motion.h1>

      {/* Intro */}
      <motion.p {...fadeUp(0.1)}>
        The <strong>Grama Samurdhi Portal</strong> is a centralized digital platform
        established to support rural development activities in the{" "}
        <strong>Southern Province</strong>. It connects provincial, district, and
        village‑level institutions to ensure that development programs reach
        communities efficiently and transparently.
      </motion.p>

      {/* Mission */}
      <motion.h2 className="about-heading" {...fadeUp(0.2)}>
        Our Mission
      </motion.h2>
      <motion.p {...fadeUp(0.25)}>
        To strengthen rural communities in Galle, Matara, and Hambantota by providing
        accurate information, streamlined services, and improved coordination between
        government officers, societies, and citizens.
      </motion.p>

      {/* Key Objectives */}
      <motion.h2 className="about-heading" {...fadeUp(0.3)}>
        Key Objectives
      </motion.h2>
      <motion.ul {...fadeUp(0.35)}>
        <li>Maintain updated records of district, divisional, and village‑level societies.</li>
        <li>Support fair and transparent management of funds, grants, and loans.</li>
        <li>Provide a clear workflow for approvals, reports, and official communication.</li>
        <li>Enable officers to monitor progress and respond quickly to local needs.</li>
      </motion.ul>

      {/* Coverage */}
      <motion.h2 className="about-heading" {...fadeUp(0.4)}>
        Coverage – Southern Province
      </motion.h2>
      <motion.p {...fadeUp(0.45)}>
        This system is designed for use by{" "}
        <strong>provincial directors, district officers, subject officers,</strong>{" "}
        Grama Niladhari‑level development officers, and registered rural societies
        in:
      </motion.p>
      <motion.ul className="about-list-inline" {...fadeUp(0.5)}>
        <li>ගාල්ල දිස්ත්‍රික්කය (Galle)</li>
        <li>මාතර දිස්ත්‍රික්කය (Matara)</li>
        <li>හම්බන්තොට දිස්ත්‍රික්කය (Hambantota)</li>
      </motion.ul>

      {/* Closing */}
      <motion.p {...fadeUp(0.55)}>
        Through this portal, we aim to build{" "}
        <strong>stronger, more resilient rural communities</strong>, supported by
        accurate data, timely services, and close collaboration between citizens and
        government institutions.
      </motion.p>
    </section>
  );
};

export default About;