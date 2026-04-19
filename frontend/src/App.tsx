import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Moon, Sun, BarChart3 } from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Leaderboard } from "./components/Leaderboard";
import { UploadZone } from "./components/UploadZone";
import { useUpload } from "./hooks/useUpload";

export default function App(): JSX.Element {
  const [appLoaded, setAppLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [useBrowserAI, setUseBrowserAI] = useState<boolean>(true);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") !== "dark";
  });

  const leaderboardRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    // Cinematic multi-step loading sequence
    const t1 = setTimeout(() => setLoadingStep(1), 600);
    const t2 = setTimeout(() => setLoadingStep(2), 1400);
    const t3 = setTimeout(() => setLoadingStep(3), 2200);
    const t4 = setTimeout(() => setAppLoaded(true), 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

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

  useEffect(() => {
    if (results.length > 0 && leaderboardRef.current) {
      setTimeout(() => {
        leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [results]);

  const getLoadingText = () => {
    switch (loadingStep) {
      case 0: return "ESTABLISHING SECURE CONNECTION...";
      case 1: return "VERIFYING ENCRYPTION PROTOCOLS...";
      case 2: return "LOADING TALENTMATCH ENGINE...";
      case 3: return "SYSTEM READY.";
      default: return "";
    }
  };

  return (
    <>
      <AnimatePresence>
        {!appLoaded && (
          <motion.div
            key="startup-loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg-highest)", color: "var(--text-high)" }}
          >
            {/* LinkedIn style top progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-transparent overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ background: "var(--accent)" }}
                initial={{ width: "0%", x: "-100%" }}
                animate={{ width: "100%", x: "0%" }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              />
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {/* TM Logo mimicking LinkedIn "in" logo */}
              <div className="w-14 h-14 rounded-md flex items-center justify-center mb-4" style={{ background: "var(--accent)" }}>
                <span className="text-white font-bold text-3xl tracking-tighter">tm</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-shell" style={{ opacity: appLoaded ? 1 : 0, transition: "opacity 0.3s ease-in" }}>
        
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <motion.div
            animate={{
              x: ["0vw", "8vw", "-4vw", "0vw"],
              y: ["0vh", "6vh", "-8vh", "0vh"],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-10%", left: "10%",
              width: "50vw", height: "50vw",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--accent-glow), transparent 60%)",
              filter: "blur(80px)",
              opacity: 0.7
            }}
          />
          <motion.div
            animate={{
              x: ["0vw", "-10vw", "6vw", "0vw"],
              y: ["0vh", "-12vh", "8vh", "0vh"],
              scale: [1, 0.9, 1.05, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: "-20%", right: "5%",
              width: "60vw", height: "60vw",
              borderRadius: "50%",
              background: "radial-gradient(circle, var(--accent-dim), transparent 60%)",
              filter: "blur(100px)",
              opacity: 0.6
            }}
          />
        </div>

      {/* ── Header ── */}
      <motion.header
        className="app-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="brand">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <span className="text-white font-bold text-[18px] tracking-tighter">tm</span>
          </div>
          <div>
            <div className="brand-title">TalentMatch</div>
            <div className="brand-sub">Recruiter Candidate Analysis</div>
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
            <span className={`toggle-label ${!useBrowserAI ? "active" : ""}`}>Cloud API</span>
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
              Local Processing
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── Content ── */}
      <div className="bento-container">
        {/* Top Half: Upload + Chat */}
        <div className="bento-top">
          {/* Top Left: Upload & JD */}
          <motion.div
            className="bento-top-left"
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
          </motion.div>

          {/* Top Right: Chat Panel */}
          <motion.div
            className="bento-top-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChatPanel resumeContext={results} disabled={results.length === 0} useBrowserAI={useBrowserAI} />
          </motion.div>
        </div>

        {/* Bottom Half: Leaderboard */}
        <motion.div
          ref={leaderboardRef}
          className="bento-bottom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {results.length > 0 ? (
            <Leaderboard results={results} />
          ) : (
            <div className="card flex flex-col items-center justify-center p-12 text-center border border-dashed border-ink-faint/30 min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-void-highest/50 flex items-center justify-center mb-4 border border-ink-faint/10">
                <BarChart3 size={28} className="text-ink-mid" />
              </div>
              <h3 className="text-lg font-semibold text-ink-high mb-2">No Candidates Analyzed</h3>
              <p className="text-sm text-ink-mid max-w-sm">
                Upload resumes and provide a job description above to generate the candidate ranking matrix.
              </p>
            </div>
          )}
        </motion.div>

        <div className="footer-label">TalentMatch AI · Recruiter Dashboard</div>
      </div>
      </div>
    </>
  );
}
