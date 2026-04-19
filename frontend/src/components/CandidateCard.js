import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, XCircle, Briefcase, Code2, Brain } from "lucide-react";
// ─── Score helpers ────────────────────────────────────────────────────────────
function getScoreTier(score) {
    if (score >= 75)
        return "high";
    if (score >= 50)
        return "mid";
    return "low";
}
function getScoreStroke(tier) {
    if (tier === "high")
        return "var(--cyan)";
    if (tier === "mid")
        return "var(--accent)";
    return "var(--text-faint)";
}
function getScoreTextColor(tier) {
    if (tier === "high")
        return "text-neon-cyan";
    if (tier === "mid")
        return "text-neon-indigo";
    return "text-ink-faint";
}
function getGradeStyle(grade) {
    if (grade === "A+" || grade === "A")
        return "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan";
    if (grade === "B+" || grade === "B")
        return "bg-neon-indigo/10 border-neon-indigo/30 text-neon-indigo";
    if (grade === "C")
        return "bg-neon-amber/10 border-neon-amber/30 text-neon-amber";
    return "bg-void-highest border-ink-faint/20 text-ink-faint";
}
function ScoreBar({ label, score, icon, color }) {
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `flex-shrink-0 ${color}`, children: icon }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "text-[10px] font-semibold uppercase tracking-wider text-ink-faint", children: label }), _jsx("span", { className: `text-[11px] font-black tabular-nums ${color}`, children: score })] }), _jsx("div", { className: "h-1 w-full rounded-full bg-ink-faint/20 overflow-hidden", children: _jsx(motion.div, { className: "h-full rounded-full", style: { backgroundColor: color.startsWith("#") ? color : undefined }, initial: { width: 0 }, animate: { width: `${score}%` }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, children: _jsx("div", { className: "h-full w-full rounded-full", style: {
                                    background: score >= 75
                                        ? "linear-gradient(90deg, var(--cyan), var(--emerald))"
                                        : score >= 50
                                            ? "linear-gradient(90deg, var(--accent), var(--violet))"
                                            : "linear-gradient(90deg, var(--text-faint), var(--text-low))",
                                } }) }) })] })] }));
}
// ─── Component ────────────────────────────────────────────────────────────────
export function CandidateCard({ candidate, rank, isTop }) {
    const [expanded, setExpanded] = useState(rank === 1);
    // 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 350, damping: 25 });
    const springY = useSpring(y, { stiffness: 350, damping: 25 });
    const rotateX = useTransform(springY, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-4deg", "4deg"]);
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };
    const tier = getScoreTier(candidate.match_score);
    const R = 20;
    const circumference = 2 * Math.PI * R;
    const dashOffset = circumference - (candidate.match_score / 100) * circumference;
    return (_jsx(motion.div, { style: { perspective: 1200 }, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, className: "card-3d-wrap w-full", children: _jsxs(motion.div, { style: { rotateX, rotateY, transformStyle: "preserve-3d" }, className: `
          relative rounded-xl overflow-hidden
          transition-shadow duration-300
          ${isTop
                ? "bg-void-high border border-neon-cyan/50 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)] ring-1 ring-neon-cyan/20"
                : "bg-void-mid border border-ink-faint/20 hover:border-ink-faint/40 hover:shadow-card"}
        `, children: [isTop && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-neon-indigo/[0.04] to-neon-cyan/[0.02] pointer-events-none" })), _jsxs("div", { className: "flex items-center justify-between gap-4 px-5 py-4 cursor-pointer relative z-10", onClick: () => setExpanded((p) => !p), style: { transform: "translateZ(20px)" }, children: [_jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [_jsxs("span", { className: `text-xl font-bold flex-shrink-0 tabular-nums ${isTop
                                        ? "text-ink-high"
                                        : "text-ink-mid"}`, children: ["#", rank] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h3", { className: "text-base font-bold text-ink-high truncate", children: candidate.candidate_name }), _jsx("span", { className: `pill text-[10px] font-black border ${getGradeStyle(candidate.evaluation_grade)}`, children: candidate.evaluation_grade })] }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [isTop && (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-[10px] font-semibold text-accent", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "Top Applicant"] })), candidate.experience_years > 0 && (_jsxs("span", { className: "flex items-center gap-1 text-[10px] text-ink-faint font-medium", children: [_jsx(Briefcase, { className: "w-3 h-3" }), candidate.experience_years, "y exp"] }))] })] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", style: { transform: "translateZ(30px)" }, children: [_jsxs("div", { className: "relative flex items-center justify-center w-14 h-14", children: [_jsxs("svg", { className: "w-full h-full -rotate-90", viewBox: "0 0 64 64", children: [_jsx("circle", { cx: "32", cy: "32", r: R, className: "stroke-ink-faint/30", strokeWidth: "4", fill: "none" }), _jsx("circle", { cx: "32", cy: "32", r: R, strokeWidth: "4", fill: "none", stroke: getScoreStroke(tier), strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: dashOffset, className: "score-ring-fill transition-all duration-700" })] }), _jsx("span", { className: `absolute text-sm font-bold tabular-nums text-ink-high`, children: candidate.match_score })] }), _jsx(ChevronDown, { className: `w-4 h-4 text-ink-faint transition-transform duration-300 ${expanded ? "rotate-180" : ""}` })] })] }), _jsx(AnimatePresence, { initial: false, children: expanded && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, className: "overflow-hidden", children: _jsxs("div", { className: "px-5 pb-5 pt-1 border-t border-ink-faint/20 space-y-4", style: { transform: "translateZ(10px)" }, children: [candidate.score_reasoning && (_jsx("p", { className: "text-sm text-ink-high leading-relaxed border-l-2 border-neon-indigo/40 pl-3", children: candidate.score_reasoning })), _jsxs("div", { className: "rounded-xl bg-void-highest/40 p-4 space-y-4", children: [_jsx("h4", { className: "text-xs font-semibold text-ink-high flex items-center gap-2", children: "Score Breakdown" }), _jsx(ScoreBar, { label: "Experience", score: candidate.experience_score, icon: _jsx(Briefcase, { className: "w-4 h-4 text-ink-mid" }), color: "text-ink-high" }), _jsx(ScoreBar, { label: "Skills", score: candidate.skills_score, icon: _jsx(Code2, { className: "w-4 h-4 text-ink-mid" }), color: "text-ink-high" }), _jsx(ScoreBar, { label: "Semantic Fit", score: candidate.semantic_score, icon: _jsx(Brain, { className: "w-4 h-4 text-ink-mid" }), color: "text-ink-high" })] }), (candidate.matched_skills?.length > 0 || candidate.missing_skills?.length > 0) && (_jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [candidate.matched_skills?.length > 0 && (_jsxs("div", { className: "rounded-xl border border-border p-4 bg-emerald-500/5", children: [_jsxs("h4", { className: "text-xs font-semibold text-ink-high mb-3 flex items-center gap-1.5", children: [_jsx(CheckCircle, { className: "w-3.5 h-3.5 text-emerald-500" }), " Matched Skills"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: candidate.matched_skills.map((skill) => (_jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20", children: skill }, skill))) })] })), candidate.missing_skills?.length > 0 && (_jsxs("div", { className: "rounded-xl border border-border p-4 bg-void-highest/20", children: [_jsxs("h4", { className: "text-xs font-semibold text-ink-high mb-3 flex items-center gap-1.5", children: [_jsx(XCircle, { className: "w-3.5 h-3.5 text-ink-mid" }), " Missing Skills"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: candidate.missing_skills.map((skill) => (_jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-md bg-void-highest text-ink-mid font-medium border border-border", children: skill }, skill))) })] }))] })), _jsx("p", { className: "text-sm text-ink-high leading-relaxed pl-4 border-l-[3px] border-accent/60 bg-accent/[0.02] py-2 rounded-r-md", children: candidate.summary }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-xl border border-border p-5", children: [_jsx("h4", { className: "flex items-center gap-2 text-xs font-semibold text-ink-high mb-4", children: "Core Strengths" }), _jsx("ul", { className: "space-y-3", children: candidate.strengths.map((item) => (_jsxs("li", { className: "flex items-start gap-3 text-sm text-ink-mid", children: [_jsx("span", { className: "text-emerald-500 mt-1 flex-shrink-0", children: _jsx(CheckCircle, { className: "w-3.5 h-3.5" }) }), item] }, item))) })] }), _jsxs("div", { className: "rounded-xl border border-border p-5", children: [_jsx("h4", { className: "flex items-center gap-2 text-xs font-semibold text-ink-high mb-4", children: "Identified Gaps" }), _jsx("ul", { className: "space-y-3", children: candidate.gaps.map((item) => (_jsxs("li", { className: "flex items-start gap-3 text-sm text-ink-mid", children: [_jsx("span", { className: "text-ink-faint mt-1 flex-shrink-0", children: _jsx(XCircle, { className: "w-3.5 h-3.5" }) }), item] }, item))) })] })] })] }) }, "detail")) })] }) }));
}
