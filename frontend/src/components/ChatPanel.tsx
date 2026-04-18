import { useEffect, useMemo, useRef, useState } from "react";
import { CandidateResult } from "../types";
import { useChat } from "../hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BrainCircuit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatPanelProps {
  resumeContext: CandidateResult[];
  disabled: boolean;
  useBrowserAI: boolean;
}

const SUGGESTED = [
  "Who has the most Python experience?",
  "Compare the top 2 candidates",
  "Who is best for a leadership role?",
  "Which candidate has the weakest technical skills?",
];

export function ChatPanel({ resumeContext, disabled, useBrowserAI }: ChatPanelProps): JSX.Element {
  const { messages, streaming, sendMessage, clearChat } = useChat(useBrowserAI);
  const [input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const showCursor = useMemo(() => {
    if (!streaming || messages.length === 0) return false;
    return messages[messages.length - 1].role === "assistant";
  }, [messages, streaming]);

  const handleSend = async (value: string): Promise<void> => {
    const trimmed = value.trim();
    if (!trimmed || disabled || streaming) return;
    setInput("");
    await sendMessage(trimmed, resumeContext);
  };

  return (
    <section className="chat-panel">
      <div className="chat-accent-bar" />

      {/* Header */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-title-icon"><BrainCircuit size={16} strokeWidth={1.5} /></div>
          <span className="chat-title-text">AI Analyst</span>
        </div>
        <div className="chat-status">
          {messages.length > 0 && !streaming && (
            <button
              onClick={clearChat}
              className="suggestion-chip"
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", marginRight: "8px" }}
              aria-label="Clear chat"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          {!disabled && <span className="pulse-dot" />}
          <span className={`status-text ${disabled ? "offline" : "online"}`}>
            {disabled ? "AWAITING DATA" : "ONLINE"}
          </span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="suggestions">
        {SUGGESTED.map((q) => (
          <button key={q} type="button" className="suggestion-chip" disabled={disabled || streaming} onClick={() => void handleSend(q)}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon"><BrainCircuit size={28} strokeWidth={1} /></div>
            <p className="chat-empty-text">
              {disabled ? "Screen resumes first to unlock AI consultation" : "Ask anything about the screened candidates"}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              className={`msg-row ${msg.role}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className={`msg-bubble ${msg.role} prose-sm`}>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p style={{margin: "0 0 0.5em 0"}} {...props} />,
                    ul: ({node, ...props}) => <ul style={{margin: "0 0 0.5em 0", paddingLeft: "1.5em"}} {...props} />,
                    li: ({node, ...props}) => <li style={{margin: "0"}} {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                {showCursor && i === messages.length - 1 && <span className="typing-cursor" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} style={{ height: 4 }} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-row">
          <input
            id="chat-input"
            type="text"
            className="chat-input"
            value={input}
            disabled={disabled || streaming}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleSend(input); } }}
            placeholder={disabled ? "Screen resumes to unlock..." : "Ask about the candidates..."}
          />
          <button
            id="chat-send-btn"
            type="button"
            className="chat-send-btn"
            disabled={disabled || streaming || !input.trim()}
            onClick={() => void handleSend(input)}
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Locked overlay */}
      <AnimatePresence>
        {disabled && (
          <motion.div className="chat-locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="chat-locked-icon"><BrainCircuit size={32} strokeWidth={1} /></div>
            <div>
              <p className="chat-locked-title">Awaiting Neural Input</p>
              <p className="chat-locked-sub">Upload &amp; screen resumes to activate</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
