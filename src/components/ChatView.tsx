import React, { useState, useEffect, useRef } from "react";
import { Message } from "../types";

interface ChatViewProps {
  messages: Message[];
  isChatLoading: boolean;
  onSendMessage: (text: string) => void;
  quickPrompt?: string;
  onClearQuickPrompt?: () => void;
}

export default function ChatView({
  messages,
  isChatLoading,
  onSendMessage,
  quickPrompt,
  onClearQuickPrompt
}: ChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [visualMode, setVisualMode] = useState(true);
  const [citeSources, setCiteSources] = useState(true);
  const [selectedStyleAdvice, setSelectedStyleAdvice] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quickPrompt) {
      setInputText(quickPrompt);
      if (onClearQuickPrompt) {
        onClearQuickPrompt();
      }
    }
  }, [quickPrompt, onClearQuickPrompt]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isChatLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Report transcript copied to clipboard.", "success");
  };

  const samplePrompts = [
    "Analyze the architectural trends of the next decade, focusing on bio-mimicry and sustainable vertical urbanism. Compare this with current smart-city implementations.",
    "Formulate an efficiency projection for micro-grid autonomy and self-healing structures.",
    "Draft a contextual layout evaluation for a quantum UI design."
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-180px)] pb-32">
      
      {/* Dynamic Glassmorphic Toast Notifications */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#12192a]/95 border border-[#c0c1ff]/30 text-[#dae2fd] text-xs font-semibold shadow-[0_0_30px_rgba(192,193,255,0.2)] animate-fade-in pointer-events-none select-none">
          <span className="material-symbols-outlined text-[#ffb95f] text-base font-bold material-symbols-fill animate-pulse">auto_awesome</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Stream Messages Container */}
      <div className="flex-1 space-y-10 no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center fade-in-up">
            <div className="w-16 h-16 rounded-full bg-[#c0c1ff]/10 flex items-center justify-center border border-[#c0c1ff]/20 mb-6">
              <span className="material-symbols-outlined text-[#c0c1ff] text-3xl">forum</span>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">ASTRA Workspace</h2>
            <p className="text-[#c7c4d7]/70 max-w-md text-sm mb-8 leading-relaxed">
              Initiate a session to analyze complex parameters, calculate projections, or explore learned context memories.
            </p>
            <div className="w-full max-w-2xl grid grid-cols-1 gap-3.5 px-4">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(p);
                  }}
                  className="glass-card hover:bg-white/5 hover:border-[#c0c1ff]/30 text-[#dae2fd] text-xs font-normal text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#ffb95f] text-sm shrink-0">bolt</span>
                  <span className="line-clamp-2 leading-relaxed">{p}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {messages.map((message) => {
              const isUser = message.sender === "user";

              if (isUser) {
                return (
                  <div key={message.id} className="flex flex-col items-start gap-2 max-w-4xl mx-auto pl-5 border-l-2 border-l-[#ffb95f]/60 fade-in-up py-1 mt-6">
                    <div className="flex items-center gap-2 select-none mb-1">
                      <span className="text-[9px] font-mono font-bold text-[#ffb95f] tracking-widest uppercase bg-[#ffb95f]/15 px-2.5 py-0.5 rounded-full">
                        Operator Inquiry Node
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f]/60 animate-ping"></span>
                    </div>
                    <p className="text-lg md:text-xl font-light text-white leading-relaxed tracking-wide pl-0.5">
                      {message.text}
                    </p>
                  </div>
                );
              }

              // render AI output
              return (
                <div key={message.id} className="flex gap-4 items-start max-w-3xl fade-in-up mt-6">
                  {/* AI Icon Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#c0c1ff]/15 border border-[#c0c1ff]/30 flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-[18px] text-[#c0c1ff] material-symbols-fill">auto_awesome</span>
                  </div>

                  {/* AI Bubble Card */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="glass-card p-6 rounded-3xl rounded-tl-none shadow-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#c0c1ff]/5 blur-2xl rounded-full pointer-events-none"></div>
                      
                      {/* Copy Action Floating Button */}
                      <div className="absolute top-4 right-4 flex gap-1">
                        <button
                          onClick={() => handleCopyText(message.text)}
                          title="Copy message text"
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#c7c4d7]/70 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[15px]">content_copy</span>
                        </button>
                      </div>

                      {/* AI Markdown Text */}
                      <div className="text-sm text-[#dae2fd]/95 leading-relaxed whitespace-pre-wrap pr-6">
                        {message.text}
                      </div>

                      {/* Dynamic Grounding Citations */}
                      {citeSources && message.citations && message.citations.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-white/5">
                          <span className="text-[9px] font-bold text-[#ffb95f] tracking-widest uppercase block mb-2 font-mono">
                            Sources Calibrated
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {message.citations.map((c, idx) => (
                              <a
                                key={idx}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 hover:bg-[#c0c1ff]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all"
                              >
                                <span className="material-symbols-outlined text-[11px]">link</span>
                                <span className="truncate max-w-[150px]">{c.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI response: Thinking / Running operations animation */}
        {isChatLoading && (
          <div className="space-y-6 fade-in-up">
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full glass-card-light flex items-center justify-center animate-spin">
                <span className="material-symbols-outlined text-[16px] text-[#c0c1ff] material-symbols-fill">auto_awesome</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3.5 py-1 rounded-full glass-card text-xs text-[#ddb7ff] border border-[#ddb7ff]/20 animate-pulse">
                  Analyzing Source Materials
                </span>
                <span className="px-3.5 py-1 rounded-full glass-card text-xs text-[#ffb95f] border border-[#ffb95f]/20 animate-pulse delay-75">
                  Modeling Projections
                </span>
              </div>
            </div>

            {/* Simulated subtle glowing preview card */}
            <div className="glass-card p-6 rounded-3xl opacity-40 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
                 <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        )}

        {/* Anchor point to scroll screen */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Prompt Input Field Section */}
      <div className="fixed bottom-0 left-0 right-0 md:left-72 pb-8 pt-4 px-4 z-40 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          
          <form onSubmit={handleSubmit} className="relative w-full">
            {/* Soft Ambient glowing flare */}
            <div className="absolute inset-0 bg-[#c0c1ff]/15 blur-[60px] -z-10 rounded-full"></div>
            
            <div className="glass-card-light rounded-full p-2 pl-6 pr-2 flex items-center gap-3 border border-white/20 shadow-2xl focus-within:scale-[1.01] transition-transform duration-300">
              <button
                type="button"
                onClick={() => showToast("Cognitive attachments initialized. Document layers configured globally.", "info")}
                title="Attach source file"
                className="text-[#c7c4d7] hover:text-[#c0c1ff] hover:scale-110 transition-all cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-xl">attach_file</span>
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isChatLoading}
                placeholder="Imagine something, calculate metrics, or ask a question..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-[#c7c4d7]/40 text-sm py-4"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("Microphone sequence loaded. ASTRA listening node launched...", "info")}
                  title="Voice command"
                  className="w-10 h-10 rounded-full glass-card hover:bg-white/5 text-[#ddb7ff] hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">mic</span>
                </button>
                <button
                  type="submit"
                  disabled={isChatLoading || !inputText.trim()}
                  className="bg-[#c0c1ff] hover:bg-white disabled:bg-white/10 disabled:text-white/20 text-[#1000a9] p-3.5 rounded-full shadow-lg transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base font-bold material-symbols-fill">auto_awesome</span>
                </button>
              </div>
            </div>
          </form>

          {/* Underneath Aux Toggles */}
          <div className="mt-3.5 flex justify-center gap-6 text-[11px] font-bold text-[#c7c4d7]/70 uppercase tracking-widest select-none">
            <button
              onClick={() => {
                setCiteSources(!citeSources);
                showToast(`Grounding citations ${!citeSources ? "enabled" : "disabled"}.`);
              }}
              className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${citeSources ? "text-[#c0c1ff]" : ""}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              Cite Sources
            </button>

            <button
              onClick={() => {
                showToast("System context logs synchronized with Active Memory Nexus.");
              }}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              Context Settings
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
