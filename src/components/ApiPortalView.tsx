import React, { useState } from "react";
import { DeveloperKey } from "../lib/supabase";

interface ApiPortalViewProps {
  keys: DeveloperKey[];
  onGenerateKey: (name: string, scope: string) => Promise<void>;
  onRevokeKey: (id: string) => Promise<void>;
  isKeysLoading: boolean;
}

export default function ApiPortalView({
  keys,
  onGenerateKey,
  onRevokeKey,
  isKeysLoading
}: ApiPortalViewProps) {
  const [keyName, setKeyName] = useState("");
  const [selectedScope, setSelectedScope] = useState("Full Access (Read/Write)");
  const [showDocTab, setShowDocTab] = useState<"curl" | "node" | "python">("curl");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<{ [id: string]: boolean }>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    await onGenerateKey(keyName.trim(), selectedScope);
    setKeyName("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get active key token for documentation example
  const activeKeySample = keys[0]?.token || "astra_live_6f00be8083ffc0c1ff39k1_demo_token";

  return (
    <div className="relative w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">

      {/* Dynamic Background visual highlights */}
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(192,193,255,0.04)_0,transparent_75%)] pointer-events-none"></div>

      {/* Page Header text */}
      <div className="relative z-10">
        <span className="text-[11px] font-bold text-[#ffb95f] tracking-[0.2em] uppercase bg-[#ffb95f]/10 px-3.5 py-1.5 rounded-full border border-[#ffb95f]/15 mb-3.5 inline-block">
          ASTRA DEVELOPER GATEWAYS
        </span>
        <h1 className="text-3xl md:text-5xl font-extralight tracking-tight text-white mb-3">
          API Credentials & Key <span className="text-[#c0c1ff] font-semibold">Provisions</span>
        </h1>
        <p className="text-sm text-[#c7c4d7]/70 max-w-2xl leading-relaxed">
          Provision secure high-fidelity bearer keys to wire ASTRA's contextual insights and intelligent thinking cores directly into your third-party client architectures, microservices, and mobile applications.
        </p>
      </div>

      {/* Main Grid Layout split: Form and Table / Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

        {/* Column Left: Provisioning Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12192a]/80 border border-white/5 p-6 md:p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
            
            <h2 className="text-lg font-light text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb95f] text-xl font-bold">add_moderator</span>
              Generate Access Key
            </h2>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Input: Key Identifier Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#c7c4d7]/60 uppercase tracking-widest font-mono">
                  Gateway Name / Project Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production iOS Core, Analytics Pipeline"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-[#0b1326]/50 border border-white/10 hover:border-white/25 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#c0c1ff]/50 transition-all font-medium placeholder-[#c7c4d7]/30"
                />
              </div>

              {/* Scope selectors checkboxes as glowing buttons */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-[#c7c4d7]/60 uppercase tracking-widest font-mono block">
                  Assign Access Authorization Scopes
                </label>
                
                <div className="space-y-2">
                  {[
                    {
                      id: "Full Access (Read/Write)",
                      title: "Full Authorization",
                      desc: "Complete permissions to read active contexts, modify memory nexus, and send prompts.",
                      icon: "security"
                    },
                    {
                      id: "Context-Only Extraction",
                      title: "Context-Only Isolation",
                      desc: "Read active layers and active insights safely without prompt authority.",
                      icon: "key_visualizer"
                    },
                    {
                      id: "Read-Only Analytics",
                      title: "Read-Only Analytics",
                      desc: "Only extract metadata structures, interaction metrics, and performance charts.",
                      icon: "analytics"
                    }
                  ].map((scope) => {
                    const isSelected = selectedScope === scope.id;
                    return (
                      <button
                        type="button"
                        key={scope.id}
                        onClick={() => setSelectedScope(scope.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-[#c0c1ff]/10 border-[#c0c1ff]/35 shadow-[0_0_20px_rgba(192,193,255,0.05)]"
                            : "bg-[#0b1326]/30 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <span className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${
                          isSelected ? "text-[#ffb95f]" : "text-[#c7c4d7]/40"
                        }`}>
                          {scope.icon}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white tracking-wide">{scope.title}</p>
                          <p className="text-[10px] text-[#c7c4d7]/65 leading-relaxed mt-1 font-medium">{scope.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Provision Submission */}
              <button
                type="submit"
                disabled={isKeysLoading}
                className="w-full bg-[#c0c1ff] hover:bg-white text-[#1000a9] disabled:bg-white/10 disabled:text-white/35 font-bold px-5 py-4 rounded-full shadow-[0_0_35px_rgba(192,193,255,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden"
              >
                {isKeysLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm font-bold">vpn_key</span>
                    Generate Secure Provision Key
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Informational Notice card */}
          <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-[#c0c1ff]/10 p-5 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[#c0c1ff] text-lg mt-0.5 shrink-0">info</span>
            <p className="text-[11px] text-[#c7c4d7]/70 leading-relaxed font-medium">
              ASTRA API key structures are signed using high-entropy cryptography. For system safety, keep generated bearer tokens secret. Avoid publishing your integration keys in public code repositories.
            </p>
          </div>
        </div>

        {/* Column Right: Key Table List & Active Code Documentation */}
        <div className="lg:col-span-7 space-y-6">

          {/* Table Container Section */}
          <div className="bg-[#12192a]/80 border border-white/5 p-6 rounded-[32px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-light text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c0c1ff] text-xl">database</span>
                Live Connected Key Handles ({keys.length})
              </h2>
              {isKeysLoading && (
                <span className="text-[10px] text-[#c0c1ff] animate-pulse font-mono font-bold uppercase">Syncing with DB...</span>
              )}
            </div>

            {keys.length === 0 ? (
              <div className="text-center py-12 px-6 bg-[#0b1326]/20 border border-white/5 border-dashed rounded-[24px]">
                <span className="material-symbols-outlined text-[#c7c4d7]/35 text-5xl mb-3 block">key</span>
                <p className="text-sm text-white font-medium">No Active API Credentials Provisioned</p>
                <p className="text-xs text-[#c7c4d7]/60 max-w-sm mx-auto leading-relaxed mt-1">
                  Secure API client tokens you generate will be displayed here dynamically, linked to your user context model.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-bold text-[#c7c4d7]/50 uppercase tracking-widest font-mono">
                      <th className="py-3 px-1">Identifier</th>
                      <th className="py-3 px-2">Scope Scope</th>
                      <th className="py-3 px-2">Secret Token Key</th>
                      <th className="py-3 px-1 text-right">Action Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {keys.map((key) => {
                      const isRevealed = revealedKeys[key.id] || false;
                      const displayToken = isRevealed 
                        ? key.token 
                        : key.token.replace(/^([a-z]+_)[a-z0-9]+/i, "$1••••••••••••");

                      return (
                        <tr key={key.id} className="text-xs font-medium hover:bg-white/[0.01] transition-colors group">
                          {/* Name col */}
                          <td className="py-3 px-1 text-white pr-2">
                            <div className="font-semibold block truncate max-w-[120px]" title={key.name}>
                              {key.name}
                            </div>
                            <span className="text-[9px] text-[#c7c4d7]/40 block font-mono mt-0.5">Created: {key.created}</span>
                          </td>

                          {/* Scope col */}
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              key.scope.includes("Full") 
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15" 
                                : key.scope.includes("Context") 
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/15"
                                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15"
                            }`}>
                              {key.scope.split(" ")[0]}
                            </span>
                          </td>

                          {/* Secret token col */}
                          <td className="py-3 px-2 font-mono text-[10px] text-[#c7c4d7]/70">
                            <div className="flex items-center gap-1.5 bg-[#0b1326]/50 px-2 py-1 rounded-lg border border-white/5 max-w-[170px] justify-between">
                              <span className="truncate select-all select-none pr-1 tracking-wide">{displayToken}</span>
                              <div className="flex items-center shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleReveal(key.id)}
                                  className="p-1 hover:text-white text-[#c7c4d7]/50 cursor-pointer"
                                  title={isRevealed ? "Hide token" : "Show token"}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {isRevealed ? "visibility_off" : "visibility"}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(key.token, key.id)}
                                  className="p-1 hover:text-white text-[#c7c4d7]/50 relative cursor-pointer"
                                  title="Copy bearer credentials"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {copiedKeyId === key.id ? "done" : "content_copy"}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Action Col */}
                          <td className="py-3 px-1 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to revoke this gateway access token: "${key.name}"? This action cannot be undone.`)) {
                                  onRevokeKey(key.id);
                                }
                              }}
                              className="text-red-400/50 hover:text-red-400 p-1.5 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer"
                              title="Revoke access API credentials"
                            >
                              <span className="material-symbols-outlined text-[16px] font-bold">delete_forever</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interactive Documentation Panel using real token snippet */}
          <div className="bg-[#12192a]/80 border border-white/5 p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
            <span className="text-[9px] font-mono font-bold text-[#c0c1ff] tracking-widest uppercase block mb-1">
              ASTRA INTEGRATION MANIFESTO
            </span>
            <h3 className="text-base font-light text-white mb-4">REST API Interface</h3>

            {/* Selector tabs for Python, Curl, JS */}
            <div className="flex border-b border-white/5 mb-4">
              {[
                { id: "curl", label: "cURL Command" },
                { id: "node", label: "Node.js (Fetch)" },
                { id: "python", label: "Python (requests)" }
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setShowDocTab(tab.id as any)}
                  className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    showDocTab === tab.id
                      ? "border-[#c0c1ff] text-white"
                      : "border-transparent text-[#c7c4d7]/50 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Display Code snippet */}
            <div className="bg-[#0b1326]/70 border border-white/5 rounded-2xl p-4.5 font-mono text-[11px] leading-relaxed relative text-[#c0c1ff]/90 overflow-x-auto select-all">
              {showDocTab === "curl" && (
                <pre className="whitespace-pre-wrap">{`curl -X POST "https://api.astra-cognitive.ai/v1/context/generate" \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Synthesize design palette metrics",
    "temperature": 0.3,
    "system_calibrator_sync": true
  }'`}</pre>
              )}

              {showDocTab === "node" && (
                <pre className="whitespace-pre-wrap">{`const astraQuery = async () => {
  const url = "https://api.astra-cognitive.ai/v1/context/generate";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${activeKeySample}",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: "Synthesize design palette metrics",
      temperature: 0.3,
      system_calibrator_sync: true
    })
  });
  
  const data = await response.json();
  console.log("ASTRA Stream Result:", data.generation);
};`}</pre>
              )}

              {showDocTab === "python" && (
                <pre className="whitespace-pre-wrap">{`import requests

url = "https://api.astra-cognitive.ai/v1/context/generate"
headers = {
    "Authorization": "Bearer ${activeKeySample}",
    "Content-Type": "application/json"
}

payload = {
    "prompt": "Synthesize design palette metrics",
    "temperature": 0.3,
    "system_calibrator_sync": True
}

response = requests.post(url, json=payload, headers=headers)
print(response.json().get("generation"))`}</pre>
              )}
            </div>

            {/* API Endpoint details */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between text-[10px] text-[#c7c4d7]/60 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">POST</span>
                <span className="text-white">/v1/context/generate</span>
              </div>
              <div className="flex items-center gap-1 text-[#ffb95f]">
                <span className="material-symbols-outlined text-[13px]">rate_review</span>
                <span>Response Format: application/json</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
