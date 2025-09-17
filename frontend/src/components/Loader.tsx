// src/components/Loader.tsx
import React, { useEffect } from "react";
import { motion, useAnimationControls, type Variants } from "framer-motion";
import "./Loader.css";

type Props = { onDone?: () => void };

const rocketVariants: Variants = {
  initial: { y: 0, opacity: 1, rotate: 0 },
  shake: {
    y: [-2, 2, -3, 3, 0],
    rotate: [-5, 5, -5, 5, 0],
    transition: { duration: 1, ease: "easeInOut" },
  },
  launch: {
    y: -520,
    opacity: 0,
    transition: { duration: 1.2, ease: "easeIn" },
  },
};

const Loader: React.FC<Props> = ({ onDone }) => {
  const controls = useAnimationControls();

  useEffect(() => {
    (async () => {
      await controls.start("shake");
      await controls.start("launch");
      onDone?.(); // 👉 animation khatam होते ही inform
    })();
  }, [controls, onDone]);

  return (
    <div className="loader-container">
      <motion.div
        className="loader-rocket"
        variants={rocketVariants}
        initial="initial"
        animate={controls}
      >
        🚀
      </motion.div>
    </div>
  );
};

export default Loader;
