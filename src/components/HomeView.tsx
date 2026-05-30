import React, { useState } from "react";
import { AppTab } from "../types";
import AstraLogo from "./AstraLogo";

interface HomeViewProps {
  onNavigate: (tab: AppTab) => void;
  onLaunchPrompt: (prompt: string) => void;
}

export default function HomeView({ onNavigate, onLaunchPrompt }: HomeViewProps) {
  const [quickPrompt, setQuickPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      onLaunchPrompt(quickPrompt);
      setQuickPrompt("");
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-6 py-10 flex flex-col items-center">
      
      {/* Background soft ambient grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,193,255,0.03)_0,transparent_60%)] pointer-events-none"></div>

      {/* Hero Image Focus Section with interactive slow-glowing iris */}
      <div className="relative mb-12 flex justify-center items-center">
        <div className="absolute w-72 h-72 bg-[#c0c1ff]/15 blur-[100px] rounded-full scale-125 opacity-60"></div>
        <AstraLogo className="w-40 h-40 md:w-56 md:h-56 relative z-10 logo-pulse" />
      </div>

      {/* Typography Main Cluster */}
      <div className="max-w-4xl text-center mb-16 px-4 relative z-10">
        <span className="text-[11px] font-bold text-[#c0c1ff] tracking-[0.25em] uppercase bg-[#c0c1ff]/10 px-4 py-1.5 rounded-full border border-white/5 mb-6 inline-block">
          ASTRA INTEGRATED COGNITIVE CORE
        </span>
        <h1 className="text-4xl md:text-7xl font-extralight tracking-tight text-white mb-6 leading-tight">
          Intelligence that <span className="text-[#ffb95f] font-semibold">Breathes.</span>
        </h1>
        <p className="text-base md:text-lg text-[#c7c4d7]/85 max-w-2xl mx-auto leading-relaxed mb-10">
          Experience the next evolution of human-AI collaboration. ASTRA translates complex user feedback into organic cognitive insights, moving beyond standard computation into true atmospheric partnership.
        </p>

        {/* Action center buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onNavigate("chat")}
            className="w-full sm:w-auto bg-[#c0c1ff] text-[#1000a9] hover:bg-white font-bold px-10 py-4 rounded-full shadow-[0_0_50px_rgba(192,193,255,0.25)] hover:scale-[1.03] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm font-bold">chat_bubble</span>
            Launch Session
          </button>
          <button
            onClick={() => onNavigate("memory")}
            className="w-full sm:w-auto bg-white/5 text-white hover:bg-white/10 font-bold px-10 py-4 rounded-full border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">psychology</span>
            Configure Nexus
          </button>
        </div>
      </div>

      {/* Bento Grid Showcase Panels */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pb-12 relative z-10">
        
        {/* Core Card: Contextual Fluidity */}
        <div className="md:col-span-8 bg-gradient-to-br from-[#12192a]/80 to-[#0b1326]/90 border border-white/5 p-8 rounded-[36px] flex flex-col justify-end min-h-[360px] relative overflow-hidden group hover:border-[#c0c1ff]/20 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/40 to-transparent z-10"></div>
          <img
            alt="Fluid dynamic flow background representing neural pathways"
            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNYD9-Kp2eOcEF-CTJaZF4yPyzLE61FtxtJMYh2YxY_khP0aDI0hHpGwKzYdzoCr2OKAvqCwkimzBEw4JBU167yUJsnZqlY4Qb4Lw6azkX7XqfSyOBVes_hht8Mt8pxMFaVQDoqn45M-B5vzniDIVimqfRv0zogkyp3X6oE2Qdlhkz16wDNYseMyms2ge0OstXZ900nQYZSPfbYFuTSInOdqUMRXpgD-H9RZrfXGy6jzhtCEIhmiB51BRr3zrzYeGChrWxo0d7nx0"
          />
          <div className="relative z-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#ffb95f] mb-2 block">
              Cognitive Architecture
            </span>
            <h3 className="text-2xl md:text-3xl font-light text-white mb-2 leading-tight">
              Adaptive Context Engine
            </h3>
            <p className="text-sm text-[#c7c4d7]/90 max-w-md leading-relaxed">
              Our neural pipeline adapts perfectly to your custom prompt requests, absorbing context layers dynamically and generating customized results with premium quality.
            </p>
          </div>
        </div>

        {/* Ethics Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#12192a]/80 to-[#0b1326]/90 border border-[#c0c1ff]/15 p-8 rounded-[36px] flex flex-col justify-between hover:border-[#c0c1ff]/30 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#c0c1ff]/10 flex items-center justify-center border border-[#c0c1ff]/20 mb-6">
            <span className="material-symbols-outlined text-[#c0c1ff] text-2xl">gavel</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#ffb95f] tracking-widest uppercase block mb-1">
              Safety Protocols
            </span>
            <h3 className="text-xl font-light text-white mb-2">Ethics-First Pipeline</h3>
            <p className="text-xs text-[#c7c4d7]/85 leading-relaxed">
              Every analytical generation is structured with carbon-transparency and deep human agency in mind, prioritizing safety and auditability above pure inference.
            </p>
          </div>
        </div>

        {/* System Optimal Status */}
        <div className="md:col-span-4 bg-[#222a3d]/20 border border-white/5 border-l-4 border-l-[#ffb95f] p-6 rounded-[36px] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffb95f] thinking-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffb95f]">System Optimal</span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-light text-white leading-tight">
              Real-time calibration across all environment logs.
            </p>
            <p className="text-xs text-[#c7c4d7]/70 mt-1.5 leading-relaxed">
              Active local nodes and model components configured: 100% compliant.
            </p>
          </div>
        </div>

        {/* Memory Nexus Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#12192a]/80 to-[#222a3d]/20 border border-white/5 p-6 rounded-[36px] flex flex-col justify-between hover:border-[#c0c1ff]/15 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#c0c1ff]/10 flex items-center justify-center border border-[#c0c1ff]/20 mb-6">
            <span className="material-symbols-outlined text-[#c0c1ff] text-2xl">psychology</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#c0c1ff] tracking-widest uppercase block mb-1">
              CALIBRATED PERSISTENCE
            </span>
            <h3 className="text-xl font-light text-white mb-2">Memory Nexus</h3>
            <p className="text-xs text-[#c7c4d7]/70 leading-relaxed mb-4">
              Configure project contextual constraints and toggle neural insights that formulate subsequent generations.
            </p>
            <button
              onClick={() => onNavigate("memory")}
              className="text-[11px] font-bold text-[#c0c1ff] flex items-center gap-1 hover:translate-x-1.5 transition-transform cursor-pointer"
            >
              EXPLORE MEMORY <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* API Provision Credentials Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#12192a]/80 to-[#222a3d]/20 border border-white/5 p-6 rounded-[36px] flex flex-col justify-between hover:border-[#c0c1ff]/15 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-[#ffb95f]/10 flex items-center justify-center border border-[#ffb95f]/25 mb-6">
            <span className="material-symbols-outlined text-[#ffb95f] text-2xl">vpn_key</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#ffb95f] tracking-widest uppercase block mb-1">
              EXTERNAL CLIENTS
            </span>
            <h3 className="text-xl font-light text-white mb-2">API Provision Portal</h3>
            <p className="text-xs text-[#c7c4d7]/70 leading-relaxed mb-4">
              Secure authorization credentials to request ASTRA's cognitive services from custom third-party integrations.
            </p>
            <button
              onClick={() => onNavigate("api-keys")}
              className="text-[11px] font-bold text-[#ffb95f] flex items-center gap-1 hover:translate-x-1.5 transition-transform cursor-pointer"
            >
              PROVISION KEYS <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>

      {/* Persistent Bottom Prompt Field */}
      <div className="w-full max-w-2xl mt-12 mb-6">
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="absolute inset-0 bg-[#c0c1ff]/10 blur-2xl -z-10 rounded-full"></div>
          <div className="glass-card-light rounded-full p-2 pl-6 pr-2 flex items-center gap-4 border border-white/20 shadow-xl focus-within:scale-[1.01] transition-all duration-300">
            <span className="material-symbols-outlined text-[#c0c1ff] select-none">auto_awesome</span>
            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ask ASTRA to start a session or make a projection..."
              className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-[#c7c4d7]/40 text-sm font-medium py-3"
            />
            <button
              type="submit"
              className="bg-[#c0c1ff] hover:bg-white text-[#1000a9] p-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
