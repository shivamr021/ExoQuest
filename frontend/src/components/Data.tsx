import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  Variants,
  Transition,
} from "framer-motion";
import "./Data.css";
import axios, { AxiosError } from "axios";

const API_BASE = "https://shatakshi021-exo-quest.hf.space";

const bounds = {
  koi_period: {
    min: 0.53,
    max: 551,
    step: 1,
    label: "Orbital Period",
    unit: "days",
  },
  koi_depth: {
    min: 24,
    max: 417000,
    step: 1000,
    label: "Transit Depth",
    unit: "ppm",
  },
  koi_duration: {
    min: 0.8,
    max: 30.05,
    step: 0.1,
    label: "Transit Duration",
    unit: "hours",
  },
  koi_prad: {
    min: 0.52,
    max: 369.2,
    step: 1,
    label: "Planet Radius",
    unit: "Earth radii",
  },
  koi_teq: {
    min: 196,
    max: 4106,
    step: 10,
    label: "Equilibrium Temperature",
    unit: "K",
  },
  // advanced
  koi_impact: {
    min: 0,
    max: 100.81,
    step: 1,
    label: "Impact Parameter",
    unit: "",
  },
  koi_time0bk: {
    min: 120.52,
    max: 1472.52,
    step: 10,
    label: "Transit Epoch",
    unit: "BKJD",
  },
  koi_model_snr: {
    min: 0,
    max: 9054.7,
    step: 100,
    label: "Model SNR",
    unit: "",
  },
  koi_steff: {
    min: 2661,
    max: 15896,
    step: 100,
    label: "Stellar Effective Temp",
    unit: "K",
  },
  koi_srad: {
    min: 0.109,
    max: 229.91,
    step: 1,
    label: "Stellar Radius",
    unit: "Solar radii",
  },
} as const;

type Keys = keyof typeof bounds;

type ApiUnknown = Record<string, any>;
type ApiSuccess = {
  prediction?: string | number;
  label?: string;
  class?: string | number;
  probability?: number;
  proba?: number;
  confidence?: number;
  [k: string]: any;
};
type ApiError = { detail?: string | { msg?: string }[] } | ApiUnknown;

const Data: React.FC = () => {
  const [formData, setFormData] = useState<
    Record<Keys | "advancedSettings", string | number | boolean>
  >({
    koi_period: "",
    koi_depth: "",
    koi_duration: "",
    koi_prad: "",
    koi_teq: "",
    koi_impact: "",
    koi_time0bk: "",
    koi_model_snr: "",
    koi_steff: "",
    koi_srad: "",
    advancedSettings: false,
  });

  const [touched, setTouched] = useState<Record<Keys, boolean>>({
    koi_period: false,
    koi_depth: false,
    koi_duration: false,
    koi_prad: false,
    koi_teq: false,
    koi_impact: false,
    koi_time0bk: false,
    koi_model_snr: false,
    koi_steff: false,
    koi_srad: false,
  });

  const [errors, setErrors] = useState<Record<Keys, string>>({
    koi_period: "",
    koi_depth: "",
    koi_duration: "",
    koi_prad: "",
    koi_teq: "",
    koi_impact: "",
    koi_time0bk: "",
    koi_model_snr: "",
    koi_steff: "",
    koi_srad: "",
  });

  // NEW: request + UI state
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const [result, setResult] = useState<ApiSuccess | null>(null);
  const [rawResult, setRawResult] = useState<ApiUnknown | null>(null);

  // motion prefs + mount guard
  const reduceMotion = useReducedMotion();
  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // transitions
  const easeOut: Transition["ease"] = [0.16, 1, 0.3, 1];
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: reduceMotion ? 0 : 0.07,
      },
    },
  };
  const field: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOut } },
  };
  const advSection: Variants = {
    collapsed: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    expanded: {
      opacity: 1,
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 0.3, ease: easeOut },
    },
  };
  const errorFx: Variants = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : -4,
      clipPath: "inset(0 0 100% 0)",
    },
    show: {
      opacity: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 0.22, ease: easeOut },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -4,
      clipPath: "inset(0 0 100% 0)",
      transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as Keys;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, String(formData[name]));
  };

  const validateField = (key: Keys, raw: string) => {
    const { min, max } = bounds[key];
    const num = Number(raw);
    let msg = "";
    if (raw === "" || Number.isNaN(num) || !Number.isFinite(num))
      msg = "Required";
    else if (num < min) msg = `Must be ≥ ${min}`;
    else if (num > max) msg = `Must be ≤ ${max}`;
    setErrors((prev) => ({ ...prev, [key]: msg }));
    return msg === "";
  };

  const requiredKeys: Keys[] = useMemo(
    () =>
      formData.advancedSettings
        ? (Object.keys(bounds) as Keys[])
        : ([
            "koi_period",
            "koi_depth",
            "koi_duration",
            "koi_prad",
            "koi_teq",
          ] as Keys[]),
    [formData.advancedSettings]
  );

  const validateAll = () =>
    requiredKeys.every((k) => validateField(k, String(formData[k])));
  // interpret result for summary
  const interpret = (data: any) => {
    const rawLabel = data?.prediction_label; // 0 or 1 (could be string)
    const labelNum = typeof rawLabel === "number" ? rawLabel : Number(rawLabel);

    const confidence =
      typeof data?.prediction_probability_of_being_exoplanet === "number"
        ? data.prediction_probability_of_being_exoplanet
        : undefined;

    let verdict: "negative" | "positive" | "unknown" = "unknown";
    let title = "Unknown";
    let subtitle = "Model returned an unexpected label.";

    if (labelNum === 0) {
      verdict = "negative";
      title = "False Positive";
      subtitle = "This signal is unlikely to be an exoplanet.";
    } else if (labelNum === 1) {
      verdict = "positive";
      title = "Planet Candidate";
      subtitle = "This target is a promising exoplanet candidate.";
    }

    return { verdict, title, subtitle, confidence };
  };
  // maps verdict string → css class
  const verdictClass = (v: "negative" | "positive" | "unknown") =>
    v === "positive"
      ? "verdict positive"
      : v === "negative"
      ? "verdict negative"
      : "verdict";

  // formats a number like 0.87 → "87.0%"
  const fmtPct = (n?: number) =>
    typeof n === "number" ? `${(n <= 1 ? n * 100 : n).toFixed(1)}%` : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setResult(null);
    setRawResult(null);

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

    const controller = new AbortController();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/predict`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30_000,
        signal: controller.signal,
        withCredentials: false,
      });

      const data: ApiUnknown = res.data ?? {};
      setRawResult(data);

      // best-effort friendly summary
      const summary = interpret(data as ApiSuccess);
      setResult(summary);
    } catch (err) {
      const ax = err as AxiosError<ApiError>;
      if (ax.code === "ERR_CANCELED") return;
      if (ax.response?.data) {
        const d = ax.response.data;
        // FastAPI style errors
        const detail =
          (typeof d.detail === "string" && d.detail) ||
          (Array.isArray(d.detail) &&
            d.detail
              .map((x: any) => x.msg)
              .filter(Boolean)
              .join("; ")) ||
          JSON.stringify(d);
        setServerError(detail || `Server error (${ax.response.status}).`);
      } else if (ax.message) {
        setServerError(ax.message);
      } else {
        setServerError("Unexpected error contacting the model API.");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  const isFormValid = () =>
    requiredKeys.every(
      (k) => errors[k] === "" && String(formData[k]).trim() !== ""
    );

  const renderField = useCallback(
    (key: Keys) => {
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
          <div className="helper">
            Range: {cfg.min} – {cfg.max} • Step: {cfg.step}
          </div>

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
    },
    [errors, field, formData, touched]
  );

  // simple number formatter for confidence %


  return (
    <motion.section
      className="abc"
      variants={container}
      initial={hasMounted.current ? false : "hidden"}
      animate="show"
    >
      <div className="bg-stars" aria-hidden />
      <div
        className="exoplanet-form"
        role="region"
        aria-labelledby="exoplanet-title"
      >
        <header className="form-header">
          <h1 id="exoplanet-title" className="form-title">
            FIND YOUR EXOPLANET
          </h1>
          <p className="form-subtitle">Set Parameters</p>
        </header>

        <form
          className="form-container"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
        >
          <div className="form-section parameters-section">
            <h2 className="section-title">Parameters</h2>

            <motion.div
              className="form-grid"
              variants={container}
              initial={hasMounted.current ? false : "hidden"}
              animate="show"
            >
              {(
                [
                  "koi_period",
                  "koi_depth",
                  "koi_duration",
                  "koi_prad",
                  "koi_teq",
                ] as Keys[]
              ).map(renderField)}
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
                <motion.span
                  className="switch-slider"
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
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
                    {(
                      [
                        "koi_impact",
                        "koi_time0bk",
                        "koi_model_snr",
                        "koi_steff",
                        "koi_srad",
                      ] as Keys[]
                    ).map(renderField)}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="form-actions">
            <motion.button
              type="submit"
              className="stellar-button large"
              disabled={!isFormValid() || loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ duration: 0.14 }}
            >
              {loading ? "Analyzing..." : "ANALYZE DATA"}
            </motion.button>
            <p className="disclaimer">
              We’ll validate values before running the model.
            </p>
          </div>
        </form>

        {/* Result / Error area */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              key="err"
              className="result-card error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
              role="alert"
            >
              <strong>Request Failed:</strong> {serverError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {rawResult && (
            <motion.div
              key="res"
              className="result-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            >
              {/* Styled Verdict Banner */}
              {(() => {
                const { verdict, title, subtitle, confidence } = interpret(
                  rawResult as any
                );
                return (
                  <motion.div
                    className={verdictClass(verdict)}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="verdict-icon" aria-hidden>
                      {verdict === "positive"
                        ? "🪐"
                        : verdict === "negative"
                        ? "🚫"
                        : "ℹ️"}
                    </div>
                    <div className="verdict-content">
                      <div className="verdict-title">{title}</div>
                      <div className="verdict-subtitle">{subtitle}</div>
                      {typeof confidence === "number" && (
                        <div className="verdict-meta">
                          Confidence: <strong>{fmtPct(confidence)}</strong>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Raw JSON (collapsible) */}
              <details className="result-raw">
                <summary>Raw response</summary>
                <pre>{JSON.stringify(rawResult, null, 2)}</pre>
              </details>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default Data;
