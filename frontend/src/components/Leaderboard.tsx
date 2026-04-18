import { useMemo, useState } from "react";
import { CandidateResult } from "../types";
import { CandidateCard } from "./CandidateCard";
import { motion } from "framer-motion";
import { ArrowDownAZ, ArrowDown10, Download, Sparkles } from "lucide-react";

interface LeaderboardProps {
  results: CandidateResult[];
}

type SortMode = "score" | "name";

export function Leaderboard({ results }: LeaderboardProps): JSX.Element {
  const [sortMode, setSortMode] = useState<SortMode>("score");

  const sortedResults = useMemo(() => {
    const copied = [...results];
    if (sortMode === "name") return copied.sort((a, b) => a.candidate_name.localeCompare(b.candidate_name));
    return copied.sort((a, b) => b.match_score - a.match_score);
  }, [results, sortMode]);

  const exportCsv = (): void => {
    const headers = ["Rank","Name","Grade","Overall Score","Experience Score","Skills Score","Semantic Score","Experience Years","Score Reasoning","Matched Skills","Missing Skills","Summary","Strengths","Gaps"];
    const rows = sortedResults.map((c, i) => [
      String(i + 1), c.candidate_name, c.evaluation_grade, `${c.match_score}/100`,
      `${c.experience_score}/100`, `${c.skills_score}/100`, `${c.semantic_score}/100`,
      String(c.experience_years), c.score_reasoning,
      (c.matched_skills ?? []).join("; "), (c.missing_skills ?? []).join("; "),
      c.summary, c.strengths.join(" | "), c.gaps.join(" | "),
    ]);
    const csvText = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "resume_screener_results.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="leaderboard-header">
        <div className="lb-title">
          <Sparkles size={16} strokeWidth={1.5} style={{ color: "var(--violet)" }} />
          <span className="lb-title-text">Analysis Matrix</span>
          <span className="lb-count">{results.length} Candidates</span>
        </div>
        <div className="lb-actions">
          <button id="sort-toggle-btn" type="button" className="btn-sort" onClick={() => setSortMode((p) => p === "score" ? "name" : "score")}>
            {sortMode === "score" ? <><ArrowDownAZ size={14} /> Sort A–Z</> : <><ArrowDown10 size={14} /> Sort by Score</>}
          </button>
          <button id="export-csv-btn" type="button" className="btn-export" onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <motion.div
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {sortedResults.map((candidate, index) => (
          <motion.div
            key={candidate.file_hash}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } } }}
          >
            <CandidateCard
              candidate={candidate}
              rank={sortMode === "score" ? index + 1 : results.indexOf(candidate) + 1}
              isTop={sortMode === "score" ? index === 0 : results.indexOf(candidate) === 0}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
