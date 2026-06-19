import React, { useState } from "react";
import { motion } from "motion/react";
import { ViewType } from "../types";

interface LoginViewProps {
  onLoginSuccess: (pilotDesignation: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please provide your Pilot Credentials and Access Code.");
      return;
    }
    setErrorMsg("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");
      
      onLoginSuccess(data.user.name);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation || !regEmail || !regPassword) {
      setErrorMsg("Please complete all registration parameters.");
      return;
    }
    setErrorMsg("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: designation, email: regEmail, password: regPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      // Automate login navigation flow on success
      setActiveTab("login");
      setEmail(regEmail);
      setPassword(regPassword);
      setErrorMsg("Registration successful! Sign in to initialize session.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register pilot.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background">
      {/* Cinematic Starfield planet background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-90"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-oPrRvfgrXbV1gE50-PiLSDJbGfBej2tmorhv70GkHOKY12nlXgKw7XpK1hyL2qFU9Q8PIBHMs9rHh4HhmAxpAgXM4lFUIEiotS9asNh1p4i31KUSdo_xmiIlWvD2TXybkfsEpaJX6AmQL4wJPSBYrmMppxG4vo3lmTxfi-jOK_rEODbYUL7i-zcSdPUBr9hNcvB3skPj8pU-7FCh6chWXtKegrHvJOZ3WAnXmq3qQasFHkVIyImjFGv1r8DierEld4SOTuReazg')`
        }}
      />
      {/* Dark overlay to ensure elite contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <motion.main 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        {/* Orbital Logo Container */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6 rounded-full glass-level-1 aspect-square overflow-hidden group">
          <div className="absolute inset-0 rounded-full vanishing-border border border-white/10" />
          <span className="font-display-lg text-5xl text-primary italic font-light lowercase select-none">a</span>
        </div>

        <h1 className="font-display-lg text-primary text-4xl mb-12 tracking-wide font-normal">ASTRA</h1>

        {/* Liquid Glass Form Card */}
        <div className="w-full glass-level-2 rounded-xl p-8 relative overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          {/* Inner Vanishing Border Highlight */}
          <div className="absolute inset-0 rounded-xl vanishing-border pointer-events-none" />

          {/* Tab Navigation */}
          <div className="flex mb-8 border-b border-white/10 relative z-10">
            <button
              onClick={() => { setActiveTab("login"); setErrorMsg(""); }}
              className={`flex-1 pb-4 text-center font-label-md text-sm uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer ${
                activeTab === "login" 
                  ? "text-primary border-b-2 border-primary font-semibold" 
                  : "text-on-surface-variant opacity-60 hover:text-primary hover:opacity-100"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab("register"); setErrorMsg(""); }}
              className={`flex-1 pb-4 text-center font-label-md text-sm uppercase tracking-widest transition-all duration-300 focus:outline-none cursor-pointer ${
                activeTab === "register" 
                  ? "text-primary border-b-2 border-primary font-semibold" 
                  : "text-on-surface-variant opacity-60 hover:text-primary hover:opacity-100"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <div className="relative z-10">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 text-xs text-error bg-error-container/20 border border-error/20 py-2.5 px-3 rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface/80 uppercase block tracking-wider" htmlFor="login-email">
                    Pilot Credentials
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 font-body-md text-sm text-primary placeholder-on-surface-variant/40 border-none focus:ring-1 focus:ring-white/25 rounded-md"
                    placeholder="Enter pilot comms identity (email)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface/80 uppercase block tracking-wider" htmlFor="login-password">
                    Access Code
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 font-body-md text-sm text-primary placeholder-on-surface-variant/40 border-none focus:ring-1 focus:ring-white/25 rounded-md"
                    placeholder="Enter secure access pass code"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary font-label-md text-sm py-4 rounded-full uppercase tracking-widest hover:bg-neutral-200 transition-colors duration-300 mt-8 font-medium cursor-pointer shadow-lg active:scale-95 duration-100"
                >
                  Initialize Session
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface/80 uppercase block tracking-wider" htmlFor="reg-name">
                    Designation (Name)
                  </label>
                  <input
                    type="text"
                    id="reg-name"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 font-body-md text-sm text-primary placeholder-on-surface-variant/40 border-none focus:ring-1 focus:ring-white/25 rounded-md"
                    placeholder="e.g. Commander Alpha"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface/80 uppercase block tracking-wider" htmlFor="reg-email">
                    Comms Link (Email)
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 font-body-md text-sm text-primary placeholder-on-surface-variant/40 border-none focus:ring-1 focus:ring-white/25 rounded-md"
                    placeholder="Enter secure commu-link channel"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-xs text-on-surface/80 uppercase block tracking-wider" htmlFor="reg-password">
                    New Access Code
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full glass-input rounded-lg px-4 py-3 font-body-md text-sm text-primary placeholder-on-surface-variant/40 border-none focus:ring-1 focus:ring-white/25 rounded-md"
                    placeholder="Create secure access passcode"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full relative glass-level-1 text-primary font-label-md text-sm py-4 rounded-full uppercase tracking-widest hover:bg-white/5 transition-colors duration-300 mt-8 font-medium cursor-pointer shadow-lg active:scale-95 duration-100"
                >
                  <div className="absolute inset-0 rounded-full vanishing-border pointer-events-none" />
                  Register Pilot
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
}
