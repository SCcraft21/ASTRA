import React from "react";
import { ViewType } from "../types";
import { 
  LayoutDashboard, 
  Compass, 
  MessageSquare, 
  Rocket, 
  Archive, 
  Settings, 
  Terminal, 
  Power 
} from "lucide-react";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  pilotName: string;
  onSignOut: () => void;
  onInitiateJump?: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  pilotName,
  onSignOut,
  onInitiateJump
}: SidebarProps) {
  return (
    <nav className="hidden md:flex flex-col py-8 h-full z-40 fixed left-0 top-0 w-64 bg-[#131313] border-r border-white/[0.06] select-none text-[#e5e2e1]">
      
      {/* 1. Header/Brand - "a ASTRA COMMAND CENTER" */}
      <div className="px-6 mb-10">
        <div 
          onClick={() => onViewChange("landing")} 
          className="flex flex-col gap-1 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02] transition-colors group-hover:border-white/40">
              <span className="font-display-lg text-xl text-white italic font-light lowercase">a</span>
            </div>
            <span className="font-display-lg text-3xl text-white tracking-wide">ASTRA</span>
          </div>
          <span className="font-mono text-[9px] text-[#c4c7c8]/50 tracking-[0.25em] uppercase pl-[52px]">
            Command Center
          </span>
        </div>
      </div>

      {/* 2. Main Navigation links */}
      <div className="px-3 flex flex-col gap-1">
        
        {/* Dashboard */}
        <button
          onClick={() => onViewChange("dashboard")}
          className={`relative flex items-center gap-4 px-5 py-3 rounded-full transition-all duration-300 cursor-pointer text-left ${
            currentView === "dashboard"
              ? "text-white font-medium bg-white/[0.04]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.01]"
          }`}
        >
          {currentView === "dashboard" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
          )}
          <LayoutDashboard className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Dashboard</span>
        </button>

        {/* Navigation */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-4 px-5 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.01] transition-all duration-300 cursor-pointer text-left"
        >
          <Compass className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Navigation</span>
        </button>

        {/* Communication */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-4 px-5 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.01] transition-all duration-300 cursor-pointer text-left"
        >
          <MessageSquare className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Communication</span>
        </button>

        {/* Fleet */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-4 px-5 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.01] transition-all duration-300 cursor-pointer text-left"
        >
          <Rocket className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Fleet</span>
        </button>

        {/* Archive */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-4 px-5 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.01] transition-all duration-300 cursor-pointer text-left"
        >
          <Archive className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Archive</span>
        </button>
      </div>

      {/* Separator line */}
      <div className="px-6 my-6">
        <div className="h-[1px] bg-white/[0.06]" />
      </div>

      {/* 3. Lower navigation (Settings, Terminal) */}
      <div className="px-3 flex flex-col gap-1">
        {/* Settings */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-4 px-5 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.01] transition-all duration-300 cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Settings</span>
        </button>

        {/* Terminal/Developer Console */}
        <button
          onClick={() => onViewChange("developer-console")}
          className={`relative flex items-center gap-4 px-5 py-3 rounded-full transition-all duration-300 cursor-pointer text-left ${
            currentView === "developer-console"
              ? "text-white font-medium bg-white/[0.04]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.01]"
          }`}
        >
          {currentView === "developer-console" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
          )}
          <Terminal className="w-4 h-4 opacity-70" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-light">Terminal</span>
        </button>
      </div>

      {/* 4. Action button at bottom & Pilot Details */}
      <div className="px-4 mt-auto flex flex-col gap-5">
        
        {/* INITIATE JUMP button */}
        {onInitiateJump && (
          <button
            onClick={onInitiateJump}
            className="w-full py-3.5 rounded-full bg-white text-black font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all cursor-pointer font-medium duration-200 active:scale-[0.98] text-center shadow-lg"
          >
            Initiate Jump
          </button>
        )}

        {/* Commander Identity Card */}
        <div className="flex items-center gap-3.5 px-3 py-2 border-t border-white/[0.06] pt-5">
          <div className="w-10 h-10 rounded-full border border-white/10 shrink-0 overflow-hidden flex items-center justify-center relative">
            <img 
              alt="Commander Avatar" 
              className="w-full h-full object-cover filter grayscale contrast-125 scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGn6SvNBl9dnzY03G4zw0lMvbyuxrdNSCQ8KPmlU-GEwuEOIjDmqkB8lC0hdX-PI3hNyI2JH6qxnk-BT5Gp3yygXt20-KsV0lKWXybQs73NNSa7UwBl7pJYjkMWBqfjYyMA6Aup-4gaN5zsoCHk1jQHCh1fWE2_GY6Af1LyLk0FXIz7kT1Ls5HSB-vWcVFopSqdpVA9YKz70qvX9iMyqbLb37bj16VgvQgSjCAqN4GYNtqt7tq41tS5PuWXf5OQ15mBoq5Y2ihGDo"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-xs text-white font-medium leading-tight tracking-tight">Commander</span>
            <span className="font-mono text-[9px] text-[#c4c7c8]/40 uppercase tracking-widest mt-1">
              ASTRA One-Alpha
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
