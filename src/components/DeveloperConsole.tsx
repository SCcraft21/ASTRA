import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { APIKey, ViewType } from "../types";
import Sidebar from "./Sidebar";
import { 
  Key, 
  TrendingUp, 
  Cpu, 
  CloudUpload, 
  Copy, 
  Check, 
  Plus, 
  X,
  Menu
} from "lucide-react";

interface DeveloperConsoleProps {
  pilotName: string;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
}

export default function DeveloperConsole({ pilotName, onViewChange, onSignOut }: DeveloperConsoleProps) {
  // Mobile menu control state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [keys, setKeys] = useState<APIKey[]>([]);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      setKeys(data.map((k: any) => ({
        id: k.id,
        name: k.name,
        value: k.key || k.value || "",
        status: k.requests_count >= k.requests_limit ? "Revoked" : "Active"
      })));
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    }
  };

  // Modal key generation state
  const [showGenModal, setShowGenModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Drag and drop processing state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFile, setUploadFile] = useState<{ name: string; progress: number; status: "idle" | "uploading" | "complete" }>({
    name: "",
    progress: 0,
    status: "idle"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle key copy trigger with clipboard API and custom micro-feedback
  const handleCopyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKeyId(id);
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 2000);
  };

  // Generate a cryptographically styled lookalike access key
  const handleGenerateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim(), scope: "all" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to create key");

      const newKeyItem: APIKey = {
        id: data.id,
        name: data.name,
        value: data.key,
        status: "Active"
      };

      setKeys(prev => [newKeyItem, ...prev]);
      setNewKeyName("");
      setShowGenModal(false);
    } catch (err) {
      console.error("Failed to generate key:", err);
    }
  };

  // Toggle active/revoke status
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete key");
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
  };

  // Drag over dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      triggerFileUpload(file.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerFileUpload(file.name);
    }
  };

  const triggerFileUpload = (fileName: string) => {
    setUploadFile({
      name: fileName,
      progress: 0,
      status: "uploading"
    });
  };

  // Progress counter simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (uploadFile.status === "uploading") {
      timer = setInterval(() => {
        setUploadFile(prev => {
          if (prev.progress >= 100) {
            clearInterval(timer);
            return { ...prev, progress: 100, status: "complete" };
          }
          return { ...prev, progress: prev.progress + 20 };
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [uploadFile.status]);

  return (
    <div className="flex h-screen overflow-hidden antialiased bg-[#131313] text-[#e5e2e1]">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView="developer-console" 
        onViewChange={onViewChange} 
        pilotName={pilotName} 
        onSignOut={onSignOut} 
      />

      {/* Top Navbar for Mobile/Tablet */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-[#131111]/90 backdrop-blur-md border-b border-white/[0.06] flex justify-between items-center px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/[0.02]">
            <span className="font-display-lg text-lg text-white italic font-light lowercase">a</span>
          </div>
          <span className="font-display-lg text-lg text-white tracking-tight">ASTRA</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation popup menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 left-0 w-full bg-[#131313] border-b border-white/[0.08] z-40 p-6 flex flex-col gap-4"
          >
            <button 
              onClick={() => { onViewChange("developer-console"); setMobileMenuOpen(false); }}
              className="py-2.5 text-left text-white font-mono text-xs uppercase tracking-wider"
            >
              Developer Console
            </button>
            <button 
              onClick={() => { onViewChange("dashboard"); setMobileMenuOpen(false); }}
              className="py-2.5 text-zinc-400 text-left font-mono text-xs uppercase tracking-wider"
            >
              Dashboard
            </button>
            <button 
              onClick={() => { onViewChange("landing"); setMobileMenuOpen(false); }}
              className="py-2.5 text-zinc-400 text-left font-mono text-xs uppercase tracking-wider"
            >
              Home Page
            </button>
            <button 
              onClick={() => { onSignOut(); setMobileMenuOpen(false); }}
              className="py-2.5 text-red-400 text-left font-mono text-xs uppercase tracking-wider mt-4 border-t border-white/[0.05]"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Console Content */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 pb-24 md:ml-64 pt-24 md:pt-12 w-full bg-[#131313]">
        <div className="max-w-5xl mx-auto w-full">
          
          {/* Header Title Information Match */}
          <header className="mb-10">
            <h1 className="font-display-lg text-3xl md:text-4xl text-white font-normal mb-1">Developer Console</h1>
            <p className="font-sans text-sm text-zinc-400 font-light leading-relaxed max-w-2xl">
              Manage your orbital access keys and inject localized memory clusters directly into the ASTRA AI framework.
            </p>
          </header>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
            
            {/* Left: API Keys management panel */}
            <section className="lg:col-span-8 bg-[#181818] rounded-3xl p-8 border border-white/[0.05] flex flex-col gap-6">
              
              {/* Box Top Header */}
              <div className="flex justify-between items-center pb-1">
                <h2 className="font-display-lg text-2xl text-white flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-zinc-400" />
                  <span>API Keys</span>
                </h2>
                <button 
                  onClick={() => setShowGenModal(true)}
                  className="bg-white text-black font-sans font-medium text-xs px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-colors select-none cursor-pointer duration-200 active:scale-95 text-center whitespace-nowrap"
                >
                  Generate New Key
                </button>
              </div>

              {/* Box Rows of Keys */}
              <div className="space-y-6">
                {keys.map((key, idx) => {
                  const isCopied = copiedKeyId === key.id;
                  // Obfuscate secret key for security display mapping
                  const obscureValue = `${key.value.slice(0, 18)}...`;

                  return (
                    <div 
                      key={key.id} 
                      className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${
                        idx > 0 ? "border-t border-white/[0.05] pt-6" : ""
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="font-sans text-sm text-white font-medium">{key.name}</div>
                        <div className="flex items-center gap-2 max-w-full">
                          <div className="font-mono text-xs text-zinc-400 bg-black/30 border border-white/[0.05] rounded-xl px-4 py-2 select-all break-all inline-block truncate">
                            {obscureValue}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {/* Status label badge with soft dot light */}
                        <button 
                          onClick={() => handleToggleStatus(key.id)}
                          title="Toggle Status"
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all cursor-pointer text-zinc-400"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${key.status === "Active" ? "bg-green-400" : "bg-zinc-600"}`} />
                          <span className="font-sans text-xs font-normal tracking-wide">{key.status}</span>
                        </button>

                        {/* Copy trigger feedback check */}
                        <button 
                          onClick={() => handleCopyKey(key.id, key.value)}
                          title="Copy Key Credentials"
                          className="text-zinc-400 hover:text-white transition-colors p-2.5 rounded-full hover:bg-white/[0.04] cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Right: Telemetry Diagnostic Monitor */}
            <section className="lg:col-span-4 bg-[#181818] rounded-3xl p-8 border border-white/[0.05] flex flex-col justify-between min-h-[340px]">
              
              <div className="space-y-8">
                <h2 className="font-display-lg text-2xl text-white flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-zinc-400" />
                  <span>Telemetry</span>
                </h2>

                <div className="space-y-6">
                  {/* API Calls Progress metric */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-sans text-xs text-zinc-400">
                      <span className="uppercase tracking-wider">API Calls (30d)</span>
                      <span className="font-medium text-white">1.2M / 2M</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: "60%" }} />
                    </div>
                  </div>

                  {/* Memory Usage Progress metric */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-sans text-xs text-zinc-400">
                      <span className="uppercase tracking-wider">Memory Core Usage</span>
                      <span className="font-medium text-white">84%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* View Logs Center Alignment */}
              <div className="pt-6 text-center border-t border-white/[0.04] mt-6">
                <button 
                  onClick={() => onViewChange("dashboard")}
                  className="font-sans text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider font-light"
                >
                  View Full Logs
                </button>
              </div>

            </section>

          </div>

          {/* Bottom: Memory Layer Injection dropzone */}
          <section className="bg-[#181818] rounded-3xl p-8 border border-white/[0.05] flex flex-col gap-5">
            <div>
              <h2 className="font-display-lg text-2xl text-white flex items-center gap-2.5 mb-2">
                <Cpu className="w-5 h-5 text-zinc-400" />
                <span>Memory Layer Injection</span>
              </h2>
              <p className="font-sans text-sm text-zinc-400 font-light max-w-2xl leading-relaxed">
                Upload structured JSON or text models to fine-tune the ASTRA AI response matrices for your specific operational quadrant.
              </p>
            </div>

            {/* Interactive Upload Drag Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropFile}
              className={`border border-dashed rounded-2xl p-12 text-center transition-all relative overflow-hidden group ${
                isDragging 
                  ? "bg-white/[0.03] border-white/40" 
                  : "bg-black/[0.15] border-white/[0.08] hover:bg-white/[0.01] hover:border-white/20"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".json,.csv,.txt"
                onChange={handleFileInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
              />
              
              <div className="relative z-0 pointer-events-none flex flex-col items-center">
                <CloudUpload className="w-10 h-10 text-zinc-500 group-hover:text-white transition-colors mb-4" />
                <h3 className="font-sans text-sm text-white mb-1.5 font-medium">Drag and drop memory shards here</h3>
                <p className="font-sans text-xs text-zinc-500">Supports .json, .csv, and .txt up to 500MB</p>
              </div>

              {/* Uploading Status Overlay Animation */}
              <AnimatePresence>
                {uploadFile.status !== "idle" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#181818]/95 flex flex-col items-center justify-center p-6 z-20"
                  >
                    <div className="w-full max-w-sm space-y-4 text-left">
                      <div className="flex justify-between font-sans text-xs">
                        <span className="text-white truncate font-medium mr-4">{uploadFile.name}</span>
                        <span className="text-zinc-400">{uploadFile.progress}%</span>
                      </div>
                      
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-white rounded-full transition-all duration-150" 
                          style={{ width: `${uploadFile.progress}%` }} 
                        />
                      </div>

                      {uploadFile.status === "complete" ? (
                        <motion.div 
                          initial={{ scale: 0.98 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col gap-2 pt-2"
                        >
                          <div className="flex items-center gap-2 text-white font-sans text-xs font-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span>Matrix context imported successfully</span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setUploadFile({ name: "", progress: 0, status: "idle" }); 
                            }}
                            className="mt-1 text-zinc-400 hover:text-white transition-colors underline text-xs text-left cursor-pointer pointer-events-auto"
                          >
                            Inject another shard
                          </button>
                        </motion.div>
                      ) : (
                        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider animate-pulse">
                          Syncing context blocks with ASTRA AI...
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </main>

      {/* Dynamic Key Creation Modal Dialog Overlay */}
      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#181818] rounded-3xl p-8 relative border border-white/[0.08]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display-lg text-2xl text-white flex items-center gap-2">
                  <span>Generate Access Key</span>
                </h3>
                <button 
                  onClick={() => setShowGenModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateKeySubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block" htmlFor="key-name bg-dark">
                    Key Designation Name
                  </label>
                  <input 
                    type="text" 
                    id="key-name bg-dark"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production Orbital Core"
                    className="w-full bg-black/40 text-white font-sans text-sm rounded-xl px-4 py-3 border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-white/20 whitespace-normal"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowGenModal(false)}
                    className="flex-1 py-2.5 border border-white/[0.08] hover:bg-white/[0.02] text-zinc-400 hover:text-white rounded-full uppercase font-mono text-[10px] tracking-wider cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-full uppercase font-mono text-[10px] tracking-wider font-semibold cursor-pointer active:scale-95 duration-100 transition-all text-center"
                  >
                    Generate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
