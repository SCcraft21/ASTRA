import React, { useState, useEffect } from "react";
import { ContextLayer, LearnedInsight } from "../types";

interface MemoryViewProps {
  contexts: ContextLayer[];
  insights: LearnedInsight[];
  onToggleContext: (id: string) => void;
  onInjectContext: (title: string, desc: string) => void;
  onModifyMemory: (feedback: string) => void;
  isMemoryLoading: boolean;
}

export default function MemoryView({
  contexts,
  insights,
  onToggleContext,
  onInjectContext,
  onModifyMemory,
  isMemoryLoading
}: MemoryViewProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [newLayerTitle, setNewLayerTitle] = useState("");
  const [newLayerDesc, setNewLayerDesc] = useState("");
  const [showInjectForm, setShowInjectForm] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string>("layer_1");

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isMemoryLoading) return;
    onModifyMemory(feedbackText);
    setFeedbackText("");
  };

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLayerTitle.trim() || !newLayerDesc.trim()) return;
    onInjectContext(newLayerTitle, newLayerDesc);
    setNewLayerTitle("");
    setNewLayerDesc("");
    setShowInjectForm(false);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 space-y-12">
      
      {/* Top Header Group */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <span className="text-[10px] font-bold text-[#ddb7ff] tracking-widest uppercase">
            Cognitive Core
          </span>
          <h2 className="text-3xl font-light text-white tracking-tight">
            The Memory Nexus
          </h2>
          <p className="text-sm text-[#c7c4d7]/70 mt-1 max-w-xl">
            Audit and toggle ASTRA's dynamic context models. Injected layers formulate the conceptual boundary for system instruction prompts on subsequent chats.
          </p>
        </div>
        <button
          onClick={() => setShowInjectForm(!showInjectForm)}
          className="bg-[#c0c1ff] hover:bg-white text-[#1000a9] px-6 py-2.5 rounded-full text-xs font-semibold shadow-md shrink-0 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Inject New Layer
        </button>
      </div>

      {/* Layer Injector Panel */}
      {showInjectForm && (
        <div className="glass-card p-6 rounded-3xl border border-[#c0c1ff]/30 shadow-xl fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-semibold text-white">Inject Active Context Layer</p>
            <button
              onClick={() => setShowInjectForm(false)}
              className="text-[#c7c4d7] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onSubmit={handleInjectSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#c7c4d7]/80 uppercase tracking-wider mb-1">
                Context Name
              </label>
              <input
                type="text"
                placeholder="e.g. React 19 Strict Guidelines"
                value={newLayerTitle}
                onChange={(e) => setNewLayerTitle(e.target.value)}
                required
                className="w-full bg-[#20273a]/50 text-white rounded-xl py-2.5 px-4 text-sm border border-white/10 focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c7c4d7]/80 uppercase tracking-wider mb-1">
                Details & Boundaries
              </label>
              <textarea
                rows={3}
                placeholder="User prefers async components without hooks hydration mismatches..."
                value={newLayerDesc}
                onChange={(e) => setNewLayerDesc(e.target.value)}
                required
                className="w-full bg-[#20273a]/50 text-white rounded-xl py-2.5 px-4 text-sm border border-white/10 focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#ffb95f] text-[#2a1700] hover:bg-[#ffddb8] px-6 py-2 rounded-full text-xs font-semibold shadow-inner cursor-pointer"
            >
              Inject Layer
            </button>
          </form>
        </div>
      )}

      {/* Connected Neural Cluster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Neural connected SVG Panel */}
        <div className="lg:col-span-5 glass-card rounded-[40px] p-8 flex flex-col justify-between min-h-[420px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c0c1ff]/5 blur-3xl pointer-events-none rounded-full"></div>
          
          <div>
            <span className="text-[10px] font-semibold text-[#ffb95f] uppercase tracking-widest block mb-1">
              Live Topology Graph
            </span>
            <p className="text-xs text-[#c7c4d7]/60 leading-tight">
              Interactive structural connection paths between activated context modules.
            </p>
          </div>

          {/* Connected Grid (rendered visually in interactive SVG) */}
          <div className="relative w-full h-56 my-6 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Connected Lines with pulsing animation */}
              <line x1="25%" y1="30%" x2="75%" y2="30%" stroke="rgba(192,193,255,0.4)" strokeWidth="1.5" />
              <line x1="25%" y1="30%" x2="50%" y2="75%" stroke="rgba(192,193,255,0.4)" strokeWidth="1.5" />
              <line x1="75%" y1="30%" x2="50%" y2="75%" stroke="rgba(192,193,255,0.4)" strokeWidth="1.5" />
              
              {/* Indicator glow points */}
              <circle cx="50%" cy="45%" r="30" fill="none" stroke="rgba(255,185,95,0.15)" strokeWidth="4" />
            </svg>

            {/* Actual Interactive Graph Click Nodes mapping to contexts toggles */}
            {/* Design Preferences Node */}
            <button
              onClick={() => setActiveNodeId("layer_1")}
              className={`absolute top-[15%] left-[10%] w-24 h-24 rounded-full flex flex-col items-center justify-center p-2.5 text-center text-[9px] font-bold uppercase transition-all shadow-md cursor-pointer border ${
                activeNodeId === "layer_1" 
                  ? "bg-[#c0c1ff]/30 text-white border-[#c0c1ff]" 
                  : "bg-[#222a3d]/40 text-[#c7c4d7] border-white/5 hover:border-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-base mb-1">palette</span>
              Design Prefs
              {contexts[0]?.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f] mt-1"></span>
              )}
            </button>

            {/* Project Constraints Node */}
            <button
              onClick={() => setActiveNodeId("layer_2")}
              className={`absolute top-[15%] right-[10%] w-24 h-24 rounded-full flex flex-col items-center justify-center p-2.5 text-center text-[9px] font-bold uppercase transition-all shadow-md cursor-pointer border ${
                activeNodeId === "layer_2" 
                  ? "bg-[#c0c1ff]/30 text-white border-[#c0c1ff]" 
                  : "bg-[#222a3d]/40 text-[#c7c4d7] border-white/5 hover:border-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-base mb-1">gavel</span>
              Constraints
              {contexts[1]?.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f] mt-1"></span>
              )}
            </button>

            {/* External API Node */}
            <button
              onClick={() => setActiveNodeId("layer_3")}
              className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full flex flex-col items-center justify-center p-2.5 text-center text-[9px] font-bold uppercase transition-all shadow-md cursor-pointer border ${
                activeNodeId === "layer_3" 
                  ? "bg-[#c0c1ff]/30 text-white border-[#c0c1ff]" 
                  : "bg-[#222a3d]/40 text-[#c7c4d7] border-white/5 hover:border-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-base mb-1">api</span>
              API Specs
              {contexts[2]?.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb95f] mt-1"></span>
              )}
            </button>
          </div>

          <div className="text-[10px] text-[#c7c4d7]/70 leading-relaxed bg-[#20273a]/50 p-4 rounded-2xl border border-white/5">
            {activeNodeId === "layer_1" && (
              <p>Active parameters calibrated for: <strong>Design Aesthetic</strong>. Focuses on minimal, high-contrast layouts and ambient gradients during next generation rounds.</p>
            )}
            {activeNodeId === "layer_2" && (
              <p>Active parameters calibrated for: <strong>Project Constraints</strong>. Requires eco-consciousness, carbon efficiency, and low-latency system feedback.</p>
            )}
            {activeNodeId === "layer_3" && (
              <p>Active parameters calibrated for: <strong>API Interface Scopes</strong>. Manages OAuth secure configurations and system endpoints tokens.</p>
            )}
          </div>
        </div>

        {/* Right Dynamic Layers List with switch controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-[40px] p-8 space-y-6">
            <h3 className="text-xl font-light text-white tracking-tight">Active Context Modules</h3>
            <div className="space-y-4">
              {contexts.map((layer) => (
                <div 
                  key={layer.id} 
                  className={`p-5 rounded-3xl transition-all border ${
                    layer.active 
                      ? "bg-[#222a3d]/45 border-[#c0c1ff]/20" 
                      : "bg-[#161d2d]/20 border-white/5"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{layer.title}</p>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          layer.active 
                            ? "bg-[#c0c1ff]/20 text-[#c0c1ff] border border-[#c0c1ff]/10" 
                            : "bg-white/5 text-[#c7c4d7]/60"
                        }`}>
                          {layer.active ? "Enabled" : "Hibernating"}
                        </span>
                      </div>
                      <p className="text-xs text-[#c7c4d7]/85 mt-1.5 leading-relaxed">{layer.description}</p>
                      <span className="text-[10px] text-[#c7c4d7]/50 block mt-2">Last Mod: {layer.updated}</span>
                    </div>

                    {/* Styled sliding toggle switch */}
                    <button
                      onClick={() => onToggleContext(layer.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        layer.active ? "bg-[#c0c1ff]" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-[#0b1326] transition-transform ${
                          layer.active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Second main block: Learned Insights (Semantic memories feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Memories feedback form */}
        <div className="lg:col-span-5 glass-card rounded-[40px] p-8 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-[#ffb95f] tracking-widest uppercase block mb-1">
              Active Integration
            </span>
            <h3 className="text-xl font-light text-white tracking-tight">Ask ASTRA to recall or modify a memory...</h3>
            <p className="text-xs text-[#c7c4d7]/70 mt-1 lines-relaxed">
              Synthesize experiences by communicating with ASTRA's semantic controller. Provide natural instructions to update learned priorities.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <textarea
              rows={4}
              disabled={isMemoryLoading}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Optimize our layout criteria to prioritize asymmetrical grid frames and violet accents. Make sure model respects React 19 rules."
              className="w-full bg-[#20273a]/40 text-white rounded-2xl py-3 px-4 text-xs font-medium border border-white/10 focus:outline-none focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff] placeholder-[#c7c4d7]/30 leading-relaxed"
            />
            <button
              type="submit"
              disabled={isMemoryLoading || !feedbackText.trim()}
              className="w-full bg-[#ffb95f] hover:bg-[#ffddb8] disabled:bg-[#ffb95f]/30 disabled:text-neutral-500 text-[#2a1700] hover:scale-[1.01] font-semibold py-3 rounded-full text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isMemoryLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                  Calibrating System Memory...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm font-bold">psychology</span>
                  Calibrate Experience
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Learned Insights Feed */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-light text-white tracking-tight">Learned Insights</h3>
            <span className="text-[10px] font-bold text-[#c7c4d7]/70 font-mono">CONFIDENCE THRESHOLD &gt; 60%</span>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="glass-card rounded-3xl p-6 hover:border-white/15 transition-all relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[9px] font-bold text-[#ffb95f] uppercase tracking-widest bg-[#ca8100]/15 px-2.5 py-0.5 rounded-full border border-[#ffb95f]/10 mb-2 inline-block">
                      System Calibrated
                    </span>
                    <h4 className="text-base font-semibold text-white">{insight.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-[#c0c1ff]">{insight.match}%</span>
                    <span className="text-[9px] text-[#c7c4d7]/50 block">MATCH</span>
                  </div>
                </div>

                <p className="text-xs text-[#c7c4d7]/85 leading-relaxed">{insight.content}</p>

                {/* Matching Progress Indicator line */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 bg-white/5 rounded-full h-1 relative">
                    <div 
                      className="bg-gradient-to-r from-[#c0c1ff] to-[#ddb7ff] h-1 rounded-full"
                      style={{ width: `${insight.match}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-[#c7c4d7]/50 whitespace-nowrap">{insight.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
