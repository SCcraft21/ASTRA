import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, CrewMember, MissionLog, TelemetryMetrics, ViewType } from "../types";
import { 
  Bot, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Globe, 
  Maximize2, 
  Heart, 
  Settings, 
  Info, 
  Cpu, 
  TrendingUp, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import Sidebar from "./Sidebar";

interface DashboardViewProps {
  pilotName: string;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
}

export default function DashboardView({ pilotName, onViewChange, onSignOut }: DashboardViewProps) {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "model",
      content: `Commander, orbital trajectory for ASTRA One-Alpha is nominal. However, I am detecting minor micro-debris interference in Sector 7-G. Shall I recalibrate the deflector shields to compensate?`,
      date: "T-MINUS 04:00:00"
    },
    {
      id: "msg-2",
      role: "user",
      content: `Yes, recalibrate to 104%. Also, pull up the latest telemetry data for the main engine cluster.`,
    },
    {
      id: "msg-3",
      role: "model",
      content: `Deflectors recalibrated. Here is the requested telemetry for the main engine cluster. Efficiency remains stable at 98.4%.`,
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Drift states for telemetry
  const [altitude, setAltitude] = useState(408);
  const [velocity, setVelocity] = useState(7.66);
  const [engineCoreTemp, setEngineCoreTemp] = useState(4200);
  const [engineOutput, setEngineOutput] = useState(98.4);

  // Jump animation state
  const [isJumping, setIsJumping] = useState(false);

  // Crew state
  const [crew, setCrew] = useState<CrewMember[]>([
    {
      id: "crew-1",
      name: "Cmdr. Alpha",
      title: "Pilot In Command",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGn6SvNBl9dnzY03G4zw0lMvbyuxrdNSCQ8KPmlU-GEwuEOIjDmqkB8lC0hdX-PI3hNyI2JH6qxnk-BT5Gp3yygXt20-KsV0lKWXybQs73NNSa7UwBl7pJYjkMWBqfjYyMA6Aup-4gaN5zsoCHk1jQHCh1fWE2_GY6Af1LyLk0FXIz7kT1Ls5HSB-vWcVFopSqdpVA9YKz70qvX9iMyqbLb37bj16VgvQgSjCAqN4GYNtqt7tq41tS5PuWXf5OQ15mBoq5Y2ihGDo",
      hr: 72,
      o2: 99,
      isFavorite: false
    }
  ]);

  // Mission logs
  const [logs, setLogs] = useState<MissionLog[]>([
    {
      id: "log-1",
      title: "Mission Advisory: Micro-Debris Avoidance Maneuver",
      desc: "Automated shields have been recalibrated to 104% capacity following AI recommendations. Deflector grid is holding steady. No immediate course correction required at this time. Monitoring Sector 7-G closely.",
      rawTime: "T-MINUS 03:45:12"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Autoscroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle subtle visual telemetric drifting to feel alive
  useEffect(() => {
    if (isJumping) return;
    const interval = setInterval(() => {
      setAltitude(prev => Number((prev + (Math.random() * 0.4 - 0.2)).toFixed(1)));
      setVelocity(prev => Number((prev + (Math.random() * 0.006 - 0.003)).toFixed(3)));
      setEngineCoreTemp(prev => Math.floor(prev + (Math.random() * 6 - 3)));
    }, 3000);
    return () => clearInterval(interval);
  }, [isJumping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Package conversation and send to server API proxy
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data && data.text) {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-ai`,
          role: "model",
          content: data.text,
          date: `UTC ${new Date().toISOString().split("T")[1].slice(0, 8)}`
        }]);

        // Intercept specific state recommendations from AI and sync UI metrics
        if (data.text.includes("104%")) {
          setEngineOutput(104);
        }
      } else {
        throw new Error(data.error || "Void transit failed.");
      }
    } catch (error) {
      console.error("Chat transmission error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-err`,
        role: "model",
        content: "Warning: Telemetry uplink experiencing scintillation. Dynamic consciousness is limited. Please authenticate operational API channels in your Developer Console.",
        date: "SYSTEM ERROR"
      }]);
    }
  };

  const toggleFavoriteCrew = (id: string) => {
    setCrew(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const handleInitiateJump = () => {
    if (isJumping) return;
    setIsJumping(true);
    
    // Add custom jumping logs
    const jumpLogId = `log-${Date.now()}`;
    const newLog: MissionLog = {
      id: jumpLogId,
      title: "CRITICAL ALERT: Hyper-Jump Sequence Armed",
      desc: "Initiating main FTL engine cluster pre-charge. Quantum fold anchors deploying. Accessing ASTRA AI pathfinding matrix. Shield emitters locking to maximum frequency.",
      rawTime: "T-MINUS 00:00:03"
    };
    
    setLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      // Fluctuated telemetry during hyper jump
      setAltitude(999);
      setVelocity(299792.4); // Speed of light
      setIsJumping(false);
      
      const completeLog: MissionLog = {
        id: `log-${Date.now()}-done`,
        title: "Mission Update: Hyperspace Fold Complete",
        desc: "ASTRA One-Alpha has completed folding through Sector 7-G. Re-establishing baseline planetary orbit. Coordinates locked. Telemetry nominal.",
        rawTime: "T-MINUS 00:00:00"
      };

      setLogs(prev => [completeLog, ...prev]);
    }, 4000);
  };

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-[#0e0e0e] text-[#e5e2e1]">
      {/* Sidebar - Desktop Only */}
      <Sidebar 
        currentView="dashboard" 
        onViewChange={onViewChange} 
        pilotName={pilotName} 
        onSignOut={onSignOut} 
        onInitiateJump={handleInitiateJump}
      />

      {/* Top Navbar for Mobile/Tablet */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02]">
            <span className="font-display-lg text-lg text-white italic font-light lowercase">a</span>
          </div>
          <span className="font-display-lg text-xl text-white tracking-tight">ASTRA</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewChange("developer-console")}
            className="text-[#c4c7c8] hover:text-white transition-colors text-xs font-mono uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded"
          >
            console
          </button>
          <button onClick={onSignOut} className="text-red-400 hover:text-red-300 transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content Grid */}
      <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden md:ml-64 pt-16 md:pt-0">
        
        {/* =========================================================================
             1. LEFT/MIDDLE COLUMN: ASTRA AI Chat Companion Interface (~42% Width)
           ========================================================================= */}
        <section className="w-full lg:w-[42%] flex flex-col h-full border-r border-white/[0.06] bg-[#131313] shrink-0">
          
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-white/[0.06] bg-[#111111]/80 backdrop-blur">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-white/[0.1] bg-white/[0.02] shadow-[0_0_15px_rgba(255,255,255,0.03)]">
                <Bot className="w-5 h-5 text-white opacity-80" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#131313] animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="font-sans text-sm text-white font-medium tracking-wide">ASTRA AI</h2>
                <span className="font-mono text-[9px] text-[#c4c7c8]/40 uppercase tracking-widest leading-none mt-1">
                  Online • Orbital Processing
                </span>
              </div>
            </div>
            
            <button className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/[0.03] cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          </header>

          {/* Chat scrolling thread */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            
            {/* Centered Connection Secured Banner */}
            <div className="flex justify-center my-4">
              <div className="relative flex items-center justify-center px-6 py-2 rounded-full border border-white/[0.04] bg-white/[0.01]">
                <span className="font-mono text-[9px] text-[#c4c7c8]/30 uppercase tracking-[0.2em] font-light">
                  Connection Secured - T-MINUS 04:00:00
                </span>
              </div>
            </div>

            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3.5 max-w-[88%] ${m.role === "user" ? "self-end flex-row-reverse ml-auto" : "self-start"}`}>
                
                {/* Avatar */}
                {m.role === "model" ? (
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4 text-white opacity-70" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-zinc-800 shrink-0 overflow-hidden mt-0.5 shadow-sm">
                    <img 
                      alt="Pilot Commander Avatar" 
                      className="w-full h-full object-cover filter grayscale contrast-125 scale-110" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGn6SvNBl9dnzY03G4zw0lMvbyuxrdNSCQ8KPmlU-GEwuEOIjDmqkB8lC0hdX-PI3hNyI2JH6qxnk-BT5Gp3yygXt20-KsV0lKWXybQs73NNSa7UwBl7pJYjkMWBqfjYyMA6Aup-4gaN5zsoCHk1jQHCh1fWE2_GY6Af1LyLk0FXIz7kT1Ls5HSB-vWcVFopSqdpVA9YKz70qvX9iMyqbLb37bj16VgvQgSjCAqN4GYNtqt7tq41tS5PuWXf5OQ15mBoq5Y2ihGDo"
                    />
                  </div>
                )}

                {/* Message Body Block */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className={`px-5 py-4 rounded-2xl text-[13.5px] leading-relaxed ${
                    m.role === "user" 
                      ? "bg-white/[0.06] text-white rounded-tr-none border border-white/[0.06] shadow-md" 
                      : "bg-[#181818] text-[#e5e2e1] rounded-tl-none border border-white/[0.04] shadow-md"
                  }`}>
                    <p className="font-sans font-light">{m.content}</p>

                    {/* Conditional Bottom Engine Status Subcard nested in the specific AI telemetry response */}
                    {m.id === "msg-3" && (
                      <div className="mt-4 p-4 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-3">
                          <Cpu className="w-4 h-4 text-white/50 animate-pulse" />
                          <div className="flex flex-col">
                            <span className="font-mono text-[9px] text-[#c4c7c8]/40 uppercase tracking-widest leading-none">Engine Core Temp</span>
                            <span className="font-mono text-xs text-white font-medium mt-1">
                              {engineCoreTemp.toLocaleString()} K
                            </span>
                          </div>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <div className="flex flex-col text-right">
                          <span className="font-mono text-[9px] text-[#c4c7c8]/40 uppercase tracking-widest leading-none">Output</span>
                          <span className="font-mono text-xs text-white font-semibold mt-1">
                            {engineOutput}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {m.date && (
                    <span className="font-mono text-[8px] text-[#c4c7c8]/20 tracking-wider uppercase ml-1.5">
                      {m.date}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white opacity-40 animate-pulse" />
                </div>
                <div className="bg-[#181818] py-4.5 px-5 rounded-2xl rounded-tl-none flex items-center gap-1.5 border border-white/[0.04]">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Panel */}
          <div className="px-6 py-3 border-t border-white/[0.04] bg-[#111111]/30 flex gap-2 overflow-x-auto select-none shrink-0 scrollbar-none scroll-smooth">
            <button 
              onClick={() => setInputText("Yes, recalibrate to 104%")}
              className="text-[9px] font-mono text-[#c4c7c8]/60 hover:text-white bg-[#1a1a1a] hover:bg-[#222222] border border-white/[0.05] hover:border-white/10 rounded-full px-4 py-2 whitespace-nowrap transition-all cursor-pointer uppercase tracking-widest font-light"
            >
              ⚡ Recalibrate Emitter 104%
            </button>
            <button 
              onClick={() => setInputText("Retrieve live engine telemetry data")}
              className="text-[9px] font-mono text-[#c4c7c8]/60 hover:text-white bg-[#1a1a1a] hover:bg-[#222222] border border-white/[0.05] hover:border-white/10 rounded-full px-4 py-2 whitespace-nowrap transition-all cursor-pointer uppercase tracking-widest font-light"
            >
              🔍 Live Engine Telemetry
            </button>
          </div>

          {/* Input Area */}
          <div className="p-6 shrink-0 border-t border-white/[0.04] bg-[#111111]/60">
            <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#181818] rounded-full border border-white/[0.06] focus-within:border-white/20 transition-all px-4 py-2.5 shadow-lg">
              <button 
                type="button"
                onClick={() => setInputText("Routinely analyze flight trajectories")}
                className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/[0.02]"
              >
                <Paperclip className="w-4 h-4 opacity-70" />
              </button>
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Transmit command to ASTRA AI..."
                className="flex-1 bg-transparent border-none focus:outline-none text-white font-sans text-sm placeholder-white/20 px-3 h-10 outline-none"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 bg-white text-black rounded-full hover:bg-zinc-200 active:scale-95 transition-all flex items-center justify-center ml-2 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* =========================================================================
             2. RIGHT COLUMN: Mission Telemetry (Remaining Width ~58%)
           ========================================================================= */}
        <section className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col gap-8 md:gap-10 bg-[#0e0e0e] relative">
          
          {/* Subtle star matrix background or scanline overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/40 via-transparent to-transparent pointer-events-none" />

          {/* Dashboard Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-white tracking-tight font-normal">
                Mission Telemetry
              </h1>
              <p className="font-sans text-sm text-[#c4c7c8]/50 max-w-xl leading-relaxed font-light">
                Real-time orbital data and system diagnostics for ASTRA One-Alpha.
              </p>
            </div>
            
            {/* Live Feed Status Pill */}
            <div className="flex items-center gap-3.5 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] self-start sm:self-auto shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[9px] text-[#c4c7c8]/80 tracking-[0.2em] uppercase font-light">
                Live Feed
              </span>
            </div>
          </div>

          {/* Telemetry Widgets Bento Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Left: Interactive Orbital Track Card (Spans 3 Columns, Two Rows default) */}
            <div className="md:col-span-3 md:row-span-2 rounded-3xl border border-white/[0.06] bg-[#121212] p-6 flex flex-col justify-between min-h-[460px] relative overflow-hidden group shadow-lg">
              
              {/* Star-map space asset background embedded beautifully */}
              <div 
                className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-25 filter blur-[0.5px] transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent pointer-events-none" />

              {/* Glowing Space Atmosphere Mask for Rotating Earth Globe */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/[0.01] pointer-events-none flex items-center justify-center">
                
                {/* 1st atmosphere glow */}
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_0%,_rgba(0,0,0,0)_70%)] animate-pulse" />
                
                {/* 2nd cosmic circular horizon ring */}
                <div className="absolute w-[280px] h-[280px] rounded-full border border-white/[0.04] border-dashed animate-[spin_60s_linear_infinite]" />
                
                {/* 3rd Glowing planet shape mask */}
                <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.06),_inset_0_0_40px_rgba(255,255,255,0.2)]">
                  <div 
                    className="w-full h-full bg-cover bg-no-repeat bg-center animate-[spin_180s_linear_infinite]"
                    style={{ 
                      backgroundImage: `url('https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=600&auto=format&fit=crop')`,
                      backgroundSize: "200% 100%"
                    }}
                  />
                  {/* High contrast shadows on the globe */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_transparent_20%,_rgba(0,0,0,0.85)_80%)] mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#121212]/40 via-transparent to-white/[0.05]" />
                  
                  {/* Orbit Track Arc Overlay */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-12 scale-110" />
                </div>
              </div>

              {/* Top Row Indicators */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-white/[0.08] bg-black/60 shadow-inner">
                  <Globe className="w-3.5 h-3.5 text-white/55" />
                  <span className="font-mono text-[9px] text-white/70 tracking-[0.2em] uppercase font-light">
                    Orbital Track
                  </span>
                </div>
                
                <button 
                  onClick={() => setAltitude(408 + Math.floor(Math.random() * 20))}
                  title="Recalibrate trackers"
                  className="p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/[0.03] cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4 opacity-60" />
                </button>
              </div>

              {/* Bottom Display Text */}
              <div className="relative z-10 mt-auto pt-24">
                <h3 className="font-display-lg text-4xl text-white font-normal tracking-wide">
                  Equatorial Orbit
                </h3>
                
                <div className="flex items-center gap-12 mt-6 border-t border-white/[0.05] pt-5">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-[#c4c7c8]/30 uppercase tracking-widest block">
                      Altitude
                    </span>
                    <span className="font-mono text-xl text-white font-light tracking-wide block">
                      {altitude} km
                    </span>
                  </div>
                  
                  <div className="h-8 w-[1px] bg-white/[0.05]" />

                  <div className="space-y-1">
                    <span className="font-mono text-[9px] text-[#c4c7c8]/30 uppercase tracking-widest block">
                      Velocity
                    </span>
                    <span className="font-mono text-xl text-white font-light tracking-wide block">
                      {velocity} km/s
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Stack: Top Bento Card - Core Systems Grid (Spans 2 Columns) */}
            <div className="md:col-span-2 rounded-3xl border border-white/[0.06] bg-[#121212] p-6 flex flex-col justify-between shadow-lg">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-sans text-xs text-white/40 tracking-[0.2em] uppercase font-normal">
                    Core Systems
                  </h4>
                </div>
                <Settings className="w-3.5 h-3.5 text-white/30" />
              </div>

              {/* Systems Sliders */}
              <div className="flex flex-col gap-6 py-4">
                {/* Life Support */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono tracking-wider font-light">
                    <span className="text-[#c4c7c8]/50 uppercase">Life Support</span>
                    <span className="text-white font-normal">100%</span>
                  </div>
                  <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
                  </div>
                </div>

                {/* Navigation Core */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono tracking-wider font-light">
                    <span className="text-[#c4c7c8]/50 uppercase">Navigation</span>
                    <span className="text-white font-normal">98%</span>
                  </div>
                  <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: "98%" }}></div>
                  </div>
                </div>

                {/* Comm Array */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono tracking-wider font-light">
                    <span className="text-[#c4c7c8]/50 uppercase">Comm Array</span>
                    <span className="text-white font-normal">85%</span>
                  </div>
                  <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white/50 rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Stack: Middle Bento Card - Crew Vitals (Spans 2 Columns) */}
            {crew.map((member) => (
              <div key={member.id} className="md:col-span-2 rounded-3xl border border-white/[0.06] bg-[#121212] p-6 flex flex-col justify-between shadow-lg">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h4 className="font-sans text-xs text-white/40 tracking-[0.2em] uppercase font-normal">
                    Crew Vitals
                  </h4>
                  
                  <button 
                    onClick={() => toggleFavoriteCrew(member.id)}
                    className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${member.isFavorite ? "fill-white text-white" : "text-[#c4c7c8]/30"}`} />
                  </button>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-4 py-5">
                  <div className="w-12 h-12 rounded-full border border-white/[0.08] overflow-hidden shrink-0 bg-zinc-800 shadow-md">
                    <img 
                      alt="Pilot Commander Avatar" 
                      className="w-full h-full object-cover filter grayscale contrast-125 scale-110" 
                      src={member.image}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-sans text-[15px] font-medium text-white block">
                      {member.name}
                    </span>
                    <span className="font-mono text-[9px] text-[#c4c7c8]/50 uppercase tracking-widest block mt-1.5 leading-none">
                      HR: {member.hr} BPM &nbsp;|&nbsp; O2: {member.o2}%
                    </span>
                  </div>
                </div>

                {/* footer button */}
                <div className="border-t border-white/[0.05] pt-4 text-center">
                  <button 
                    disabled 
                    className="font-mono text-[9px] text-[#c4c7c8]/40 hover:text-white uppercase tracking-[0.2em] font-light transition-all disabled:cursor-not-allowed"
                  >
                    View Full Roster
                  </button>
                </div>

              </div>
            ))}

            {/* Bottom Spanning Card: Mission Alerts Log Board (Spans All 5 Columns) */}
            <div className="col-span-1 md:col-span-5 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    key={log.id} 
                    className="rounded-2xl border border-white/[0.08] bg-[#121212]/80 backdrop-blur-md p-6 flex gap-4.5 shadow-lg"
                  >
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/[0.02] shrink-0 h-11 w-11 flex items-center justify-center">
                      <Info className="w-5 h-5 text-white opacity-80" />
                    </div>
                    
                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <h4 className="font-sans text-sm text-white font-medium leading-none">
                          {log.title}
                        </h4>
                        <span className="font-mono text-[9px] text-[#c4c7c8]/30 uppercase tracking-[0.15em]">
                          Logged: {log.rawTime}
                        </span>
                      </div>
                      
                      <p className="font-sans text-xs text-[#c4c7c8]/70 leading-relaxed font-light">
                        {log.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>
        </section>
      </main>

      {/* Floating Initiate Jump Mobile Button (Aesthetic indicator) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={handleInitiateJump}
          disabled={isJumping}
          className="w-14 h-14 rounded-full bg-white text-black font-semibold flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
