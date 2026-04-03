import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader, ChevronDown } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/*
 * SYSTEM PROMPT (enforced on server):
 * "Act as the BioDex Agent. You are an expert wildlife biologist.
 *  Only answer questions related to animals, nature, and biodiversity.
 *  Keep answers under 3 sentences."
 */

const FACT_PILLS = [
  "🦚 What makes a peacock's tail special?",
  "🐯 How fast can a Bengal Tiger run?",
  "🐬 Do dolphins sleep?",
  "🌿 What is biodiversity?",
  "🦋 Why do butterflies migrate?",
  "🐘 How do elephants communicate?",
];

async function callBioDexAPI(message, history) {
  const response = await axios.post(`${API_URL}/api/chat`, { message, history });
  return response.data.reply;
}

export default function BioDexAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hello! I'm your BioDex Agent 🌿 Ask me anything about wildlife, animals, or biodiversity.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const query = text?.trim() || input.trim();
    if (!query || isLoading) return;

    const newMsg = { role: "user", text: query };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await callBioDexAPI(query, messages);
      setMessages((prev) => [...prev, { role: "agent", text: reply }]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Couldn't connect to BioDex Agent. Is the server running?";
      setMessages((prev) => [...prev, { role: "agent", text: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* ── Chat Window ─────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-[340px] md:w-[400px] bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col"
            style={{ maxHeight: "560px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-900">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-none ring-2 ring-emerald-300 dark:ring-emerald-700">
                <img src="/eco-ball.png" alt="BioDex Agent" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">BioDex Agent</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-zinc-500">Wildlife Expert · Powered by Gemini</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "agent" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-50 flex-none mr-2 mt-0.5 ring-1 ring-emerald-200 dark:ring-emerald-800 shrink-0">
                      <img src="/eco-ball.png" alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-50 ring-1 ring-emerald-200 flex-none shrink-0">
                    <img src="/eco-ball.png" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Fact Pill Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 shrink-0">
                <p className="text-[11px] text-zinc-400 mb-2 ml-1">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {FACT_PILLS.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(pill.replace(/^\S+\s/, ""))}
                      className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any animal or plant..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all flex-none"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Button (Bigger + Glowing) ──────────── */}
      <div className="relative">
        {/* Glow ring behind the button */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400/30 dark:bg-emerald-500/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          animate={{ scale: isOpen ? 1 : [1, 1.05, 1] }}
          transition={
            isOpen
              ? { duration: 0.2 }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 focus:outline-none hover:scale-110 transition-transform"
          title="Ask BioDex Agent"
        >
          <img
            src="/eco-ball.png"
            alt="BioDex Agent"
            className="w-full h-full object-cover"
          />
        </motion.button>
      </div>
    </div>
  );
}
