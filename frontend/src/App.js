import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, BarChart3 } from "lucide-react";
import { ChatPanel } from "./components/ChatPanel";
import { Leaderboard } from "./components/Leaderboard";
import { UploadZone } from "./components/UploadZone";
import { useUpload } from "./hooks/useUpload";
export default function App() {
    const [appLoaded, setAppLoaded] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [useBrowserAI, setUseBrowserAI] = useState(true);
    const [isLightMode, setIsLightMode] = useState(() => {
        return localStorage.getItem("theme") !== "dark";
    });
    const leaderboardRef = useRef(null);
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
        }
        else {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "dark");
        }
    }, [isLightMode]);
    const { files, setFiles, jobDescription, setJobDescription, results, loading, error, submitScreening } = useUpload(useBrowserAI);
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
    return (_jsxs(_Fragment, { children: [_jsx(AnimatePresence, { children: !appLoaded && (_jsxs(motion.div, { exit: { opacity: 0 }, transition: { duration: 0.4 }, className: "fixed inset-0 z-50 flex flex-col items-center justify-center", style: { backgroundColor: "var(--bg-highest)", color: "var(--text-high)" }, children: [_jsx("div", { className: "absolute top-0 left-0 w-full h-1 bg-transparent overflow-hidden", children: _jsx(motion.div, { className: "h-full", style: { background: "var(--accent)" }, initial: { width: "0%", x: "-100%" }, animate: { width: "100%", x: "0%" }, transition: { duration: 1.5, ease: "easeInOut", repeat: Infinity } }) }), _jsx(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.3 }, className: "flex flex-col items-center", children: _jsx("div", { className: "w-14 h-14 rounded-md flex items-center justify-center mb-4", style: { background: "var(--accent)" }, children: _jsx("span", { className: "text-white font-bold text-3xl tracking-tighter", children: "tm" }) }) })] }, "startup-loader")) }), _jsxs("div", { className: "app-shell", style: { opacity: appLoaded ? 1 : 0, transition: "opacity 0.3s ease-in" }, children: [_jsxs("div", { className: "fixed inset-0 overflow-hidden pointer-events-none z-[-1]", children: [_jsx(motion.div, { animate: {
                                    x: ["0vw", "8vw", "-4vw", "0vw"],
                                    y: ["0vh", "6vh", "-8vh", "0vh"],
                                    scale: [1, 1.1, 0.95, 1],
                                }, transition: { duration: 25, repeat: Infinity, ease: "easeInOut" }, style: {
                                    position: "absolute",
                                    top: "-10%", left: "10%",
                                    width: "50vw", height: "50vw",
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, var(--accent-glow), transparent 60%)",
                                    filter: "blur(80px)",
                                    opacity: 0.7
                                } }), _jsx(motion.div, { animate: {
                                    x: ["0vw", "-10vw", "6vw", "0vw"],
                                    y: ["0vh", "-12vh", "8vh", "0vh"],
                                    scale: [1, 0.9, 1.05, 1],
                                }, transition: { duration: 30, repeat: Infinity, ease: "easeInOut" }, style: {
                                    position: "absolute",
                                    bottom: "-20%", right: "5%",
                                    width: "60vw", height: "60vw",
                                    borderRadius: "50%",
                                    background: "radial-gradient(circle, var(--accent-dim), transparent 60%)",
                                    filter: "blur(100px)",
                                    opacity: 0.6
                                } })] }), _jsxs(motion.header, { className: "app-header", initial: { opacity: 0, y: -12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, children: [_jsxs("div", { className: "brand", children: [_jsx("div", { className: "w-8 h-8 rounded-md flex items-center justify-center", style: { background: "var(--accent)" }, children: _jsx("span", { className: "text-white font-bold text-[18px] tracking-tighter", children: "tm" }) }), _jsxs("div", { children: [_jsx("div", { className: "brand-title", children: "TalentMatch" }), _jsx("div", { className: "brand-sub", children: "Recruiter Candidate Analysis" })] })] }), _jsxs("div", { style: { display: "flex", gap: "16px", alignItems: "center" }, children: [_jsx("button", { onClick: () => setIsLightMode(!isLightMode), style: {
                                            background: "var(--bg-mid)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px",
                                            padding: "6px",
                                            cursor: "pointer",
                                            color: "var(--text-high)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }, "aria-label": "Toggle theme", children: isLightMode ? _jsx(Moon, { size: 16 }) : _jsx(Sun, { size: 16 }) }), _jsxs("div", { className: "toggle-pill", children: [_jsx("span", { className: `toggle-label ${!useBrowserAI ? "active" : ""}`, children: "Cloud API" }), _jsx("button", { id: "ai-mode-toggle", type: "button", onClick: () => setUseBrowserAI((v) => !v), "aria-label": "Toggle AI mode", className: `toggle-switch ${useBrowserAI ? "on" : ""}`, style: { border: "none", cursor: "pointer" }, children: _jsx("span", { className: "toggle-thumb" }) }), _jsxs("span", { className: `toggle-label ${useBrowserAI ? "active" : ""}`, style: { display: "flex", alignItems: "center", gap: 6 }, children: ["Local Processing", _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", className: "text-emerald-500", children: [_jsx("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), _jsx("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })] })] })] })] })] }), _jsxs("div", { className: "bento-container", children: [_jsxs("div", { className: "bento-top", children: [_jsx(motion.div, { className: "bento-top-left", initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }, children: _jsx(UploadZone, { files: files, setFiles: setFiles, jobDescription: jobDescription, setJobDescription: setJobDescription, loading: loading, error: error, submitScreening: submitScreening }) }), _jsx(motion.div, { className: "bento-top-right", initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }, children: _jsx(ChatPanel, { resumeContext: results, disabled: results.length === 0, useBrowserAI: useBrowserAI }) })] }), _jsx(motion.div, { ref: leaderboardRef, className: "bento-bottom", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }, children: results.length > 0 ? (_jsx(Leaderboard, { results: results })) : (_jsxs("div", { className: "card flex flex-col items-center justify-center p-12 text-center border border-dashed border-ink-faint/30 min-h-[300px]", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-void-highest/50 flex items-center justify-center mb-4 border border-ink-faint/10", children: _jsx(BarChart3, { size: 28, className: "text-ink-mid" }) }), _jsx("h3", { className: "text-lg font-semibold text-ink-high mb-2", children: "No Candidates Analyzed" }), _jsx("p", { className: "text-sm text-ink-mid max-w-sm", children: "Upload resumes and provide a job description above to generate the candidate ranking matrix." })] })) }), _jsx("div", { className: "footer-label", children: "TalentMatch AI \u00B7 Recruiter Dashboard" })] })] })] }));
}
