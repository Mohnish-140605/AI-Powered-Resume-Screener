import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { CandidateCard } from "./CandidateCard";
import { motion } from "framer-motion";
import { ArrowDownAZ, ArrowDown10, Download, Sparkles } from "lucide-react";
export function Leaderboard({ results }) {
    const [sortMode, setSortMode] = useState("score");
    const sortedResults = useMemo(() => {
        const copied = [...results];
        if (sortMode === "name")
            return copied.sort((a, b) => a.candidate_name.localeCompare(b.candidate_name));
        return copied.sort((a, b) => b.match_score - a.match_score);
    }, [results, sortMode]);
    const exportCsv = () => {
        const headers = [
            "Final Rank", "Candidate Full Name", "Match Grade", "Overall Fit Score",
            "Experience Alignment", "Technical Skills Match", "Semantic Context Score",
            "Years of Experience", "AI's Reasoning for this Score",
            "Skills They Have", "Skills They Are Missing",
            "AI Executive Summary", "Top Strengths to Note", "Areas for Improvement (Gaps)"
        ];
        const rows = sortedResults.map((c, i) => [
            `#${i + 1}`, c.candidate_name, c.evaluation_grade, `${c.match_score}% Match`,
            `${c.experience_score}/100`, `${c.skills_score}/100`, `${c.semantic_score}/100`,
            `${c.experience_years} Years`, c.score_reasoning,
            (c.matched_skills ?? []).join(" • "), (c.missing_skills ?? []).join(" • "),
            c.summary, c.strengths.join("\n- "), c.gaps.join("\n- ")
        ]);
        const csvText = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "TalentMatch_AI_Candidate_Report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };
    return (_jsxs("section", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [_jsxs("div", { className: "leaderboard-header", children: [_jsxs("div", { className: "lb-title", children: [_jsx(Sparkles, { size: 16, strokeWidth: 1.5, style: { color: "var(--violet)" } }), _jsx("span", { className: "lb-title-text", children: "Analysis Matrix" }), _jsxs("span", { className: "lb-count", children: [results.length, " Candidates"] })] }), _jsxs("div", { className: "lb-actions", children: [_jsx("button", { id: "sort-toggle-btn", type: "button", className: "btn-sort", onClick: () => setSortMode((p) => p === "score" ? "name" : "score"), children: sortMode === "score" ? _jsxs(_Fragment, { children: [_jsx(ArrowDownAZ, { size: 14 }), " Sort A\u2013Z"] }) : _jsxs(_Fragment, { children: [_jsx(ArrowDown10, { size: 14 }), " Sort by Score"] }) }), _jsxs("button", { id: "export-csv-btn", type: "button", className: "btn-export", onClick: exportCsv, children: [_jsx(Download, { size: 14 }), " Export CSV"] })] })] }), _jsx(motion.div, { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
                    gap: "16px",
                    alignItems: "start"
                }, initial: "hidden", animate: "visible", variants: { visible: { transition: { staggerChildren: 0.08 } } }, children: sortedResults.map((candidate, index) => (_jsx(motion.div, { layout: true, variants: {
                        hidden: { opacity: 0, y: 30, scale: 0.95 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: { type: "spring", stiffness: 140, damping: 12, mass: 0.8 }
                        }
                    }, children: _jsx(CandidateCard, { candidate: candidate, rank: sortMode === "score" ? index + 1 : results.indexOf(candidate) + 1, isTop: sortMode === "score" ? index === 0 : results.indexOf(candidate) === 0 }) }, candidate.file_hash))) })] }));
}
