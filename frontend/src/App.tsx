import React, { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";
import Loader from "./components/Loader";
import "./App.css";

// plain lazy (no artificial delay)
const Hero = lazy(() => import("./components/Hero"));
const Data = lazy(() => import("./components/Data"));

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.main
    className="main"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} // was 0.2
  >
    {children}
  </motion.main>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<div style={{ height: "20vh" }} />}>
      <AnimatePresence mode="sync">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Hero /></Page>} />
          <Route path="/result" element={<Page><Data /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App: React.FC = () => {
  const [introDone, setIntroDone] = useState(false);
  const handleLoaderDone = useCallback(() => setIntroDone(true), []);

  // warm both code-split chunks so going "back" is instant
  useEffect(() => {
    import("./components/Hero");
    import("./components/Data");
  }, []);

  return (
    <div className="app">
      <motion.div
        className="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <BrowserRouter>
          <Header />
          <AnimatedRoutes />
          <Footer />
        </BrowserRouter>
      </motion.div>

      {/* black reveal cover during intro */}
      <AnimatePresence>
        {!introDone && (
          <motion.div
            key="cover"
            className="reveal-cover"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!introDone && (
          <motion.div key="loader" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
            <Loader onDone={handleLoaderDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
