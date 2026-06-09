import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, ChevronDown } from "lucide-react";
import { API_ENDPOINTS } from "../config/api";

const WELCOME_MSG = {
    role: "assistant",
    content: "Hi! I'm your FinRisk AI assistant. I can help you understand your portfolio, risk scores, and provide financial insights. What would you like to know?"
};

function formatMessage(content) {
    const lines = content.split("\n");
    const elements = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed === "") {
            if (inList) {
                inList = false;
                elements.push(<br key={`br-${i}`} />);
            }
            continue;
        }

        if (trimmed.startsWith("- ")) {
            const parts = [];
            let lastIndex = 0;
            const regex = /\*\*(.*?)\*\*/g;
            let match;
            let text = trimmed.slice(2);

            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(text.slice(lastIndex, match.index));
                }
                parts.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < text.length) {
                parts.push(text.slice(lastIndex));
            }

            if (!inList) {
                inList = true;
            }
            elements.push(
                <div key={`line-${i}`} className="flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">•</span>
                    <span>{parts.length > 0 ? parts : text}</span>
                </div>
            );
        } else {
            if (inList) {
                inList = false;
            }

            const parts = [];
            let lastIndex = 0;
            const regex = /\*\*(.*?)\*\*/g;
            let match;

            while ((match = regex.exec(line)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(line.slice(lastIndex, match.index));
                }
                parts.push(<strong key={`b-${i}-${match.index}`}>{match[1]}</strong>);
                lastIndex = match.index + match[0].length;
            }
            if (lastIndex < line.length) {
                parts.push(line.slice(lastIndex));
            }

            elements.push(
                <div key={`line-${i}`} className={i > 0 && lines[i - 1] === "" ? "mt-2" : ""}>
                    {parts.length > 0 ? parts : line}
                </div>
            );
        }
    }

    return elements;
}

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem("chatbot_history");
            return saved ? JSON.parse(saved) : [WELCOME_MSG];
        } catch {
            return [WELCOME_MSG];
        }
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    })();
    const userEmail = user.email || "";

    const settings = (() => {
        try { return JSON.parse(localStorage.getItem('settings') || '{}'); }
        catch { return {}; }
    })();

    useEffect(() => {
        localStorage.setItem("chatbot_history", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [open]);

    if (settings.chatbotEnabled === false) return null;

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setInput("");
        const newMessages = [...messages, { role: "user", content: text }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const historyForApi = newMessages.slice(0, -1).map(m => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content
            }));

            const res = await fetch(API_ENDPOINTS.AI.CHATBOT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    message: text,
                    history: historyForApi
                })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response || "Sorry, I couldn't process that." }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I'm having trouble connecting. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[calc(100vh-180px)] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-slate-700/50 bg-gradient-to-r from-blue-600/90 to-indigo-600/90">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">FinRisk AI</p>
                                <p className="text-[10px] text-blue-200">Financial Risk Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <ChevronDown size={16} className="text-white/80" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${msg.role === "user"
                                        ? "bg-blue-500"
                                        : "bg-indigo-500"
                                        }`}>
                                        {msg.role === "user" ? (
                                            <User size={14} className="text-white" />
                                        ) : (
                                            <Bot size={14} className="text-white" />
                                        )}
                                    </div>
                                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-blue-500 text-white rounded-tr-sm"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm border border-white/20 dark:border-slate-700/30"
                                        }`}>
                                        {msg.role === "user" ? msg.content : formatMessage(msg.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center mt-0.5">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white dark:bg-slate-800 shadow-sm border border-white/20 dark:border-slate-700/30">
                                        <div className="flex gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your portfolio..."
                                className="flex-1 px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center animate-pulse-glow"
            >
                {open ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </>
    );
}