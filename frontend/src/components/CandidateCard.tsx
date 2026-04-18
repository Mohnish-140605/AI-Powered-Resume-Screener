import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, XCircle, Zap, Briefcase, Code2, Brain } from "lucide-react";
import { CandidateResult } from "../types";

interface CandidateCardProps {
  candidate: CandidateResult;
  rank: number;
  isTop: boolean;
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function getScoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

function getScoreStroke(tier: "high" | "mid" | "low"): string {
  if (tier === "high") return "#06b6d4";
  if (tier === "mid") return "#c0c1ff";
  return "#464554";
}

function getScoreTextColor(tier: "high" | "mid" | "low"): string {
  if (tier === "high") return "text-neon-cyan";
  if (tier === "mid") return "text-neon-indigo";
  return "text-ink-faint";
}

function getGradeStyle(grade: string): string {
  if (grade === "A+" || grade === "A")
    return "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan";
  if (grade === "B+" || grade === "B")
    return "bg-neon-indigo/10 border-neon-indigo/30 text-neon-indigo";
  if (grade === "C")
    return "bg-neon-amber/10 border-neon-amber/30 text-neon-amber";
  return "bg-void-highest border-white/10 text-ink-faint";
}

// ─── Mini score bar ───────────────────────────────────────────────────────────

interface ScoreBarProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  color: string;
}

function ScoreBar({ label, score, icon, color }: ScoreBarProps): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex-shrink-0 ${color}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {label}
          </span>
          <span className={`text-[11px] font-black tabular-nums ${color}`}>{score}</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color.startsWith("#") ? color : undefined }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background:
                  score >= 75
                    ? "linear-gradient(90deg, #06b6d4, #22d3ee)"
                    : score >= 50
                    ? "linear-gradient(90deg, #6366f1, #c0c1ff)"
                    : "linear-gradient(90deg, #3f3e4e, #464554)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CandidateCard({ candidate, rank, isTop }: CandidateCardProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(rank === 1);

  // 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 25 });
  const springY = useSpring(y, { stiffness: 350, damping: 25 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <motion.div
      style={{ perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card-3d-wrap w-full"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={`
          relative rounded-xl overflow-hidden
          transition-shadow duration-300
          ${
            isTop
              ? "border-gradient-top shadow-[0_0_32px_rgba(192,193,255,0.12)]"
              : "bg-void-mid border border-white/[0.06] hover:border-white/[0.12] hover:shadow-card"
          }
        `}
      >
        {isTop && (
          <div className="absolute inset-0 bg-gradient-to-br from-neon-indigo/[0.04] to-neon-cyan/[0.02] pointer-events-none" />
        )}

        {/* ── Header row ── */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer relative z-10"
          onClick={() => setExpanded((p) => !p)}
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Left: rank + name + grade */}
          <div className="flex items-center gap-4 min-w-0">
            <span
              className={`text-xl font-black flex-shrink-0 tabular-nums ${
                isTop
                  ? "text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                  : rank === 2
                  ? "text-neon-indigo/80"
                  : "text-ink-faint"
              }`}
            >
              #{rank}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-ink-high truncate">
                  {candidate.candidate_name}
                </h3>
                <span
                  className={`pill text-[10px] font-black border ${getGradeStyle(
                    candidate.evaluation_grade
                  )}`}
                >
                  {candidate.evaluation_grade}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-0.5">
                {isTop && (
                  <span className="inline-flex items-center gap-1 pill bg-gradient-to-r from-neon-indigo/20 to-neon-cyan/20 border border-neon-indigo/30 text-neon-indigo">
                    ✦ Prime Match
                  </span>
                )}
                {candidate.experience_years > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-ink-faint font-medium">
                    <Briefcase className="w-3 h-3" />
                    {candidate.experience_years}y exp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: score ring + chevron */}
          <div
            className="flex items-center gap-3 flex-shrink-0"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  className="stroke-white/10"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={R}
                  strokeWidth="4"
                  fill="none"
                  stroke={getScoreStroke(tier)}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="score-ring-fill"
                  style={{
                    filter:
                      tier === "high"
                        ? "drop-shadow(0 0 4px rgba(6,182,212,0.6))"
                        : tier === "mid"
                        ? "drop-shadow(0 0 4px rgba(192,193,255,0.4))"
                        : undefined,
                  }}
                />
              </svg>
              <span
                className={`absolute text-sm font-black tabular-nums ${getScoreTextColor(tier)}`}
              >
                {candidate.match_score}
              </span>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-ink-faint transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* ── Expanded detail ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-5 pb-5 pt-1 border-t border-white/[0.05] space-y-4"
                style={{ transform: "translateZ(10px)" }}
              >
                {/* Score reasoning */}
                {candidate.score_reasoning && (
                  <p className="text-xs text-ink-mid leading-relaxed italic border-l-2 border-neon-indigo/40 pl-3">
                    {candidate.score_reasoning}
                  </p>
                )}

                {/* Sub-score bars */}
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-faint flex items-center gap-2">
                    <Zap className="w-3 h-3 text-neon-amber" />
                    Score Breakdown
                  </h4>
                  <ScoreBar
                    label="Experience"
                    score={candidate.experience_score}
                    icon={<Briefcase className="w-3 h-3" />}
                    color={candidate.experience_score >= 75 ? "text-neon-cyan" : candidate.experience_score >= 50 ? "text-neon-indigo" : "text-ink-faint"}
                  />
                  <ScoreBar
                    label="Skills"
                    score={candidate.skills_score}
                    icon={<Code2 className="w-3 h-3" />}
                    color={candidate.skills_score >= 75 ? "text-neon-cyan" : candidate.skills_score >= 50 ? "text-neon-indigo" : "text-ink-faint"}
                  />
                  <ScoreBar
                    label="Semantic Fit"
                    score={candidate.semantic_score}
                    icon={<Brain className="w-3 h-3" />}
                    color={candidate.semantic_score >= 75 ? "text-neon-cyan" : candidate.semantic_score >= 50 ? "text-neon-indigo" : "text-ink-faint"}
                  />
                </div>

                {/* Matched / Missing skills */}
                {(candidate.matched_skills?.length > 0 || candidate.missing_skills?.length > 0) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {candidate.matched_skills?.length > 0 && (
                      <div className="rounded-lg bg-neon-emerald/[0.04] border border-neon-emerald/15 p-3">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-neon-emerald mb-2">
                          ✓ Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.matched_skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {candidate.missing_skills?.length > 0 && (
                      <div className="rounded-lg bg-neon-amber/[0.04] border border-neon-amber/15 p-3">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-neon-amber mb-2">
                          ✗ Missing Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.missing_skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-neon-amber/10 border border-neon-amber/20 text-neon-amber/80"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                <p className="text-sm text-ink-mid leading-relaxed italic border-l-2 border-neon-indigo/40 pl-4">
                  {candidate.summary}
                </p>

                {/* Strengths + Gaps */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-neon-emerald/[0.05] border border-neon-emerald/15 p-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neon-emerald mb-3">
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Core Strengths
                    </h4>
                    <ul className="space-y-2">
                      {candidate.strengths.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink-mid">
                          <span className="text-neon-emerald/60 mt-0.5 flex-shrink-0 text-xs">▸</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg bg-neon-amber/[0.05] border border-neon-amber/15 p-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neon-amber mb-3">
                      <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Identified Gaps
                    </h4>
                    <ul className="space-y-2">
                      {candidate.gaps.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink-mid">
                          <span className="text-neon-amber/60 mt-0.5 flex-shrink-0 text-xs">▸</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
