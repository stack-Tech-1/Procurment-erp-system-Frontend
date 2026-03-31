"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Sparkles, X, Send, Bot, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const QUICK_QUESTIONS = [
  "Top 3 vendors for HVAC work",
  "Potential savings on active projects",
  "Which vendors have expiring documents?",
  "Show overdue tasks summary",
  "Which RFQs need evaluation?",
  "Vendor performance this month",
];

export default function AIAssistant() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async (question) => {
    const text = (question || input).trim();
    if (!text || isTyping) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
    });
    setInput("");
    setIsTyping(true);

    const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/assistant`,
        { question: text, context: ["vendors", "rfqs", "tasks", "kpis"] },
        { headers: { Authorization: `Bearer ${token}`, "Accept-Language": lang } }
      );
      const aiText = res.data.answer || "No response received.";
      setMessages((prev) => {
        const updated = [...prev, { role: "ai", text: aiText }];
        return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
      });
    } catch (err) {
      const status = err.response?.status;
      const errorText =
        status === 429
          ? "You've sent too many messages. Please wait a moment."
          : "I'm having trouble connecting right now. Please try again.";
      setMessages((prev) => {
        const updated = [...prev, { role: "ai", text: errorText, isError: true }];
        return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
      });
    } finally {
      setIsTyping(false);
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
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: "#B8960A" }}
        title="AI Assistant"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ width: 320, height: 480, bottom: "calc(56px + 1.5rem)", right: "1.5rem" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ backgroundColor: "#0A1628" }}>
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">AI Assistant</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setMessages([])}
                className="text-gray-400 hover:text-white transition"
                title="Clear chat"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.length === 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-8 h-8 p-1 rounded-full bg-gray-100 text-gray-500 shrink-0" />
                  <p className="text-xs text-gray-500">
                    Hi! I'm your procurement assistant. Ask me anything or pick a question below.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) =>
              msg.role === "user" ? (
                <div key={idx} className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 text-xs text-white"
                    style={{ backgroundColor: "#0A1628" }}
                  >
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-start gap-2">
                  <Bot className="w-6 h-6 p-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 mt-0.5" />
                  <div
                    className={`max-w-[80%] rounded-2xl rounded-tl-sm px-3 py-2 text-xs ${
                      msg.isError
                        ? "bg-red-50 border border-red-200 text-red-700"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <Bot className="w-6 h-6 p-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 mt-0.5" />
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-yellow-400 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                dir="auto"
                className="flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="text-white rounded-lg p-1 disabled:opacity-40 transition"
                style={{ backgroundColor: "#B8960A" }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
