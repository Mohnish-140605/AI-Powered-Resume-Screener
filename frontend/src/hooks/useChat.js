import { useState } from "react";
export function useChat(useBrowserAI) {
    const [messages, setMessages] = useState([]);
    const [streaming, setStreaming] = useState(false);
    const sendMessage = async (userInput, resumeContext) => {
        const trimmed = userInput.trim();
        if (!trimmed || streaming) {
            return;
        }
        const userMessage = { role: "user", content: trimmed };
        const outgoingMessages = [...messages, userMessage];
        setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
        setStreaming(true);
        try {
            if (!useBrowserAI) {
                // Backend streaming approach
                const apiUrl = import.meta.env.VITE_API_URL;
                const payload = {
                    messages: outgoingMessages,
                    resume_context: resumeContext,
                };
                const response = await fetch(`${apiUrl}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!response.ok || !response.body) {
                    throw new Error("Chat request failed.");
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";
                let doneReading = false;
                while (!doneReading) {
                    const { value, done } = await reader.read();
                    doneReading = done;
                    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
                    const events = buffer.split("\n\n");
                    buffer = events.pop() || "";
                    for (const event of events) {
                        if (!event.startsWith("data: ")) {
                            continue;
                        }
                        const chunk = event.slice(6);
                        if (chunk === "[DONE]") {
                            continue;
                        }
                        setMessages((prev) => {
                            const updated = [...prev];
                            if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = {
                                    ...last,
                                    content: last.content + chunk,
                                };
                            }
                            return updated;
                        });
                    }
                }
            }
            else {
                // Free Browser AI streaming approach via Puter.js
                if (!window.puter) {
                    throw new Error("Puter SDK not found.");
                }
                let conversationContent = `You are a recruitment assistant. The following candidates have been screened:\n${JSON.stringify(resumeContext, null, 2)}\nAnswer recruiter questions about these candidates concisely and clearly.\n\nConversation History:\n`;
                for (const msg of outgoingMessages) {
                    conversationContent += `${msg.role.toUpperCase()}: ${msg.content}\n\n`;
                }
                conversationContent += "ASSISTANT: ";
                const responseStream = await window.puter.ai.chat(conversationContent, { model: 'gemini-3.1-pro-preview', stream: true });
                for await (const part of responseStream) {
                    if (part?.text) {
                        setMessages((prev) => {
                            const updated = [...prev];
                            if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
                                const last = updated[updated.length - 1];
                                updated[updated.length - 1] = {
                                    ...last,
                                    content: last.content + part.text,
                                };
                            }
                            return updated;
                        });
                    }
                }
            }
        }
        catch (error) {
            setMessages((prev) => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: "I could not process that request right now. Please try again.",
                    };
                }
                return updated;
            });
        }
        finally {
            setStreaming(false);
        }
    };
    const clearChat = () => {
        if (!streaming) {
            setMessages([]);
        }
    };
    return { messages, streaming, sendMessage, clearChat };
}
