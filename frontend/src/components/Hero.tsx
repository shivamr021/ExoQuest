import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./Hero.css";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  const hasMounted = useRef(false);
  useEffect(() => { hasMounted.current = true; }, []);

  const baseInitial = hasMounted.current ? false : { opacity: 0, y: 20 };

  return (
    <section className="hero">
      <div className="hero-container">
        <motion.div
          className="hero-content"
          initial={baseInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.07 }}
        >
          <motion.h1
            className="hero-title"
            initial={hasMounted.current ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            MYSTERIES OF THE UNIVERSE
          </motion.h1>

          <motion.div
            className="hero-subtitle"
            initial={hasMounted.current ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <motion.span
              className="rocket-emoji"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            >
              🚀
            </motion.span>
            <span>Exoplanet Detector with AI</span>
          </motion.div>

          <motion.div
            className="hero-description"
            initial={hasMounted.current ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
          >
            <p>Using NASA data and AI to discover planets beyond our solar system.</p>
            <p>Detecting new worlds faster and helping astronomers reduce false positives.</p>
          </motion.div>

          <Link to="/result" className="try-now-btn">Try Now</Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
