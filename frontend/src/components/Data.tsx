import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants, Transition } from "framer-motion";
import "./Data.css";

const bounds = {
  koi_period:  { min: 0.53,   max: 551,    step: 1,   label: "Orbital Period",            unit: "days" },
  koi_depth:   { min: 24,     max: 417000, step: 1000,label: "Transit Depth",             unit: "ppm" },
  koi_duration:{ min: 0.8,    max: 30.05,  step: 0.1, label: "Transit Duration",          unit: "hours" },
  koi_prad:    { min: 0.52,   max: 369.2,  step: 1,   label: "Planet Radius",             unit: "Earth radii" },
  koi_teq:     { min: 196,    max: 4106,   step: 10,  label: "Equilibrium Temperature",   unit: "K" },

  // advanced
  koi_impact:  { min: 0,      max: 100.81, step: 1,   label: "Impact Parameter",          unit: "" },
  koi_time0bk: { min: 120.52, max: 1472.52,step: 10,  label: "Transit Epoch",             unit: "BKJD" },
  koi_model_snr:{min: 0,      max: 9054.7, step: 100, label: "Model SNR",                 unit: "" },
  koi_steff:   { min: 2661,   max: 15896,  step: 100, label: "Stellar Effective Temp",    unit: "K" },
  koi_srad:    { min: 0.109,  max: 229.91, step: 1,   label: "Stellar Radius",            unit: "Solar radii" },
} as const;

type Keys = keyof typeof bounds;

const Data: React.FC = () => {
  const [formData, setFormData] = useState<Record<Keys | "advancedSettings", string | number | boolean>>({
    koi_period: "", koi_depth: "", koi_duration: "", koi_prad: "", koi_teq: "",
    koi_impact: "", koi_time0bk: "", koi_model_snr: "", koi_steff: "", koi_srad: "",
    advancedSettings: false,
  });

  const [touched, setTouched] = useState<Record<Keys, boolean>>({
    koi_period: false, koi_depth: false, koi_duration: false, koi_prad: false, koi_teq: false,
    koi_impact: false, koi_time0bk: false, koi_model_snr: false, koi_steff: false, koi_srad: false,
  });

  const [errors, setErrors] = useState<Record<Keys, string>>({
    koi_period: "", koi_depth: "", koi_duration: "", koi_prad: "", koi_teq: "",
    koi_impact: "", koi_time0bk: "", koi_model_snr: "", koi_steff: "", koi_srad: "",
  });

  // motion prefs + mount guard
  const reduceMotion = useReducedMotion();
  const hasMounted = useRef(false);
  useEffect(() => { hasMounted.current = true; }, []);

  // transitions
  const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: reduceMotion ? 0 : 0.07 },
    },
  };
  const field: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } },
  };
  // advanced section — type-safe (clipPath instead of height:auto)
  const advSection: Variants = {
    collapsed: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    expanded:  { opacity: 1, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.3, ease: easeOut } },
  };
  // error block — also using clipPath to avoid TS issues with height:"auto"
  const errorFx: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : -4, clipPath: "inset(0 0 100% 0)" },
    show:   { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.22, ease: easeOut } },
    exit:   { opacity: 0, y: reduceMotion ? 0 : -4, clipPath: "inset(0 0 100% 0)", transition: { duration: 0.18, ease: [0.4,0,1,1] } },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as Keys;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, String(formData[name]));
  };

  const validateField = (key: Keys, raw: string) => {
    const { min, max } = bounds[key];
    const num = Number(raw);
    let msg = "";
    if (raw === "" || Number.isNaN(num) || !Number.isFinite(num)) msg = "Required";
    else if (num < min) msg = `Must be ≥ ${min}`;
    else if (num > max) msg = `Must be ≤ ${max}`;
    setErrors(prev => ({ ...prev, [key]: msg }));
    return msg === "";
  };

  const requiredKeys: Keys[] = useMemo(
    () =>
      (formData.advancedSettings
        ? (Object.keys(bounds) as Keys[])
        : (["koi_period", "koi_depth", "koi_duration", "koi_prad", "koi_teq"] as Keys[])),
    [formData.advancedSettings]
  );

  const validateAll = () => requiredKeys.every(k => validateField(k, String(formData[k])));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const payload: Record<string, number | boolean> = {
      koi_period: Number(formData.koi_period),
      koi_depth: Number(formData.koi_depth),
      koi_duration: Number(formData.koi_duration),
      koi_prad: Number(formData.koi_prad),
      koi_teq: Number(formData.koi_teq),
      advancedSettings: Boolean(formData.advancedSettings),
    };

    if (formData.advancedSettings) {
      payload.koi_impact = Number(formData.koi_impact);
      payload.koi_time0bk = Number(formData.koi_time0bk);
      payload.koi_model_snr = Number(formData.koi_model_snr);
      payload.koi_steff = Number(formData.koi_steff);
      payload.koi_srad = Number(formData.koi_srad);
    }

    // hook up to your API/nav as needed
    console.log("Submitting payload", payload);
  };

  const isFormValid = () =>
    requiredKeys.every(k => errors[k] === "" && String(formData[k]).trim() !== "");

  const renderField = useCallback((key: Keys) => {
    const cfg = bounds[key];
    const value = String(formData[key] ?? "");
    const err = errors[key];
    const fieldId = `${key}-input`;
    const showErr = touched[key] && !!err;

    return (
      <motion.div
        key={key}
        variants={field}
        layout="position"
        className={`form-group ${showErr ? "invalid" : ""}`}
        initial={hasMounted.current ? false : "hidden"}
        animate="show"
      >
        <label className="label mb-2" htmlFor={fieldId}>
          {cfg.label} <span className="unit">({cfg.unit})</span>
        </label>
        <input
          id={fieldId}
          type="number"
          className="form-control"
          name={key}
          placeholder={`e.g. ${cfg.min}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={cfg.min}
          max={cfg.max}
          step={cfg.step}
          aria-invalid={showErr}
        />
        <div className="helper">Range: {cfg.min} – {cfg.max} • Step: {cfg.step}</div>

        <AnimatePresence initial={false} mode="popLayout">
          {showErr && (
            <motion.div
              className="error-text"
              variants={errorFx}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ overflow: "hidden" }}
            >
              {err}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [errors, field, formData, touched, errorFx]);

  return (
    <motion.section
      className="abc"
      variants={container}
      initial={hasMounted.current ? false : "hidden"}
      animate="show"
    >
      <div className="bg-stars" aria-hidden />
      <div className="exoplanet-form" role="region" aria-labelledby="exoplanet-title">
        <header className="form-header">
          <h1 id="exoplanet-title" className="form-title">FIND YOUR EXOPLANET</h1>
          <p className="form-subtitle">Set Parameters</p>
        </header>

        <form className="form-container" onSubmit={handleSubmit} noValidate autoComplete="off">
          <div className="form-section parameters-section">
            <h2 className="section-title">Parameters</h2>

            <motion.div
              className="form-grid"
              variants={container}
              initial={hasMounted.current ? false : "hidden"}
              animate="show"
            >
              {(["koi_period","koi_depth","koi_duration","koi_prad","koi_teq"] as Keys[]).map(renderField)}
            </motion.div>

            <div className="form-row">
              <span className="label">Advanced Settings</span>
              <label className="switch">
                <input
                  type="checkbox"
                  name="advancedSettings"
                  checked={Boolean(formData.advancedSettings)}
                  onChange={handleChange}
                  aria-label="Toggle advanced settings"
                />
                <motion.span className="switch-slider" layout transition={{ type: "spring", stiffness: 400, damping: 28 }} />
              </label>
            </div>

            <AnimatePresence initial={false}>
              {formData.advancedSettings && (
                <motion.div
                  className="advanced-section"
                  key="advanced"
                  variants={advSection}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  style={{ overflow: "hidden" }}
                  layout
                >
                  <h2 className="section-title">Advanced Parameters</h2>
                  <motion.div
                    className="form-grid advanced-grid"
                    variants={container}
                    initial={hasMounted.current ? false : "hidden"}
                    animate="show"
                  >
                    {(["koi_impact","koi_time0bk","koi_model_snr","koi_steff","koi_srad"] as Keys[]).map(renderField)}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="form-actions">
            <motion.button
              type="submit"
              className="stellar-button large"
              disabled={!isFormValid()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.14 }}
            >
              ANALYZE DATA
            </motion.button>
            <p className="disclaimer">We’ll validate values before running the model.</p>
          </div>
        </form>
      </div>
    </motion.section>
  );
};

export default Data;
