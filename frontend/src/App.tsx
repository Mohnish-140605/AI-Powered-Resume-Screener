import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Moon, Sun } from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Leaderboard } from "./components/Leaderboard";
import { UploadZone } from "./components/UploadZone";
import { useUpload } from "./hooks/useUpload";

export default function App(): JSX.Element {
  const [useBrowserAI, setUseBrowserAI] = useState<boolean>(true);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    }
  }, [isLightMode]);

  const { files, setFiles, jobDescription, setJobDescription, results, loading, error, submitScreening } =
    useUpload(useBrowserAI);

  return (
    <div className="app-shell">
      <div className="ambient-bg" />

      {/* ── Header ── */}
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="brand">
          <div className="brand-icon">
            <BrainCircuit size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div className="brand-title">Resume Screener AI</div>
            <div className="brand-sub">Neural Candidate Analysis</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {/* Theme toggle */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            style={{
              background: "var(--bg-mid)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              color: "var(--text-high)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Toggle theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* AI Mode toggle */}
          <div className="toggle-pill">
          <span className={`toggle-label ${!useBrowserAI ? "active" : ""}`}>Backend API</span>
          <button
            id="ai-mode-toggle"
            type="button"
            onClick={() => setUseBrowserAI((v) => !v)}
            aria-label="Toggle AI mode"
            className={`toggle-switch ${useBrowserAI ? "on" : ""}`}
            style={{ border: "none", cursor: "pointer" }}
          >
            <span className="toggle-thumb" />
          </button>
          <span className={`toggle-label ${useBrowserAI ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Neural Browser
            {useBrowserAI && <span className="pulse-dot" />}
          </span>
        </div>
        </div>
      </motion.header>

      {/* ── Content ── */}
      <div className="content-grid">
        {/* Left column */}
        <motion.div
          className="left-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <UploadZone
            files={files}
            setFiles={setFiles}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            loading={loading}
            error={error}
            submitScreening={submitScreening}
          />

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Leaderboard results={results} />
            </motion.div>
          )}

          <div className="footer-label">Resume Screener AI · Neural Browser AI</div>
        </motion.div>

        {/* Right column — Chat */}
        <motion.div
          className="right-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <ChatPanel resumeContext={results} disabled={results.length === 0} useBrowserAI={useBrowserAI} />
        </motion.div>
      </div>
    </div>
  );
}
