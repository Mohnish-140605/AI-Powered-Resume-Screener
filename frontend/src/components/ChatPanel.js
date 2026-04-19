import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BrainCircuit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
const SUGGESTED = [
    "Who has the most Python experience?",
    "Compare the top 2 candidates",
    "Who is best for a leadership role?",
    "Which candidate has the weakest technical skills?",
];
export function ChatPanel({ resumeContext, disabled, useBrowserAI }) {
    const { messages, streaming, sendMessage, clearChat } = useChat(useBrowserAI);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streaming]);
    const showCursor = useMemo(() => {
        if (!streaming || messages.length === 0)
            return false;
        return messages[messages.length - 1].role === "assistant";
    }, [messages, streaming]);
    const handleSend = async (value) => {
        const trimmed = value.trim();
        if (!trimmed || disabled || streaming)
            return;
        setInput("");
        await sendMessage(trimmed, resumeContext);
    };
    return (_jsxs("section", { className: "chat-panel", children: [_jsx("div", { className: "chat-accent-bar" }), _jsxs("div", { className: "chat-header", children: [_jsxs("div", { className: "chat-title", children: [_jsx("div", { className: "chat-title-icon", children: _jsx(BrainCircuit, { size: 16, strokeWidth: 1.5 }) }), _jsx("span", { className: "chat-title-text", children: "AI Analyst" })] }), _jsxs("div", { className: "chat-status", children: [messages.length > 0 && !streaming && (_jsxs("button", { onClick: clearChat, className: "suggestion-chip", style: { display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", marginRight: "8px" }, "aria-label": "Clear chat", children: [_jsx(Trash2, { size: 12 }), " Clear"] })), !disabled && _jsx("span", { className: "pulse-dot" }), _jsx("span", { className: `status-text ${disabled ? "offline" : "online"}`, children: disabled ? "AWAITING DATA" : "ONLINE" })] })] }), _jsx("div", { className: "suggestions", children: SUGGESTED.map((q) => (_jsx("button", { type: "button", className: "suggestion-chip", disabled: disabled || streaming, onClick: () => void handleSend(q), children: q }, q))) }), _jsxs("div", { className: "messages", children: [messages.length === 0 && (_jsxs("div", { className: "chat-empty", children: [_jsx("div", { className: "chat-empty-icon", children: _jsx(BrainCircuit, { size: 28, strokeWidth: 1 }) }), _jsx("p", { className: "chat-empty-text", children: disabled ? "Screen resumes first to unlock AI consultation" : "Ask anything about the screened candidates" })] })), _jsx(AnimatePresence, { initial: false, children: messages.map((msg, i) => (_jsx(motion.div, { className: `msg-row ${msg.role}`, initial: { opacity: 0, y: 8, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { type: "spring", stiffness: 300, damping: 24 }, children: _jsxs("div", { className: `msg-bubble ${msg.role} prose-sm`, children: [_jsx(ReactMarkdown, { components: {
                                            p: ({ node, ...props }) => _jsx("p", { style: { margin: "0 0 0.5em 0", display: "inline" }, ...props }),
                                            ul: ({ node, ...props }) => _jsx("ul", { style: { margin: "0 0 0.5em 0", paddingLeft: "1.5em" }, ...props }),
                                            li: ({ node, ...props }) => _jsx("li", { style: { margin: "0" }, ...props })
                                        }, children: msg.content }), showCursor && i === messages.length - 1 && (_jsxs("span", { className: "typing-dots-inline", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }))] }) }, `${msg.role}-${i}`))) }), _jsx("div", { ref: bottomRef, style: { height: 4 } })] }), _jsx("div", { className: "chat-input-bar", children: _jsxs("div", { className: "chat-input-row", children: [_jsx("input", { id: "chat-input", type: "text", className: "chat-input", value: input, disabled: streaming, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSend(input);
                            } }, placeholder: "Ask about the candidates..." }), _jsx(motion.button, { id: "chat-send-btn", type: "button", className: "chat-send-btn", disabled: streaming || !input.trim(), onClick: () => void handleSend(input), "aria-label": "Send message", whileHover: !(streaming || !input.trim()) ? { scale: 1.05 } : {}, whileTap: !(streaming || !input.trim()) ? { scale: 0.9 } : {}, children: _jsx(Send, { size: 16, strokeWidth: 2 }) })] }) })] }));
}
