import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthOverlayProps {
  onClose: () => void;
  onAuthenticate: (username: string) => void;
  defaultScreen?: "login" | "register";
}

export default function AuthOverlay({ onClose, onAuthenticate, defaultScreen = "login" }: AuthOverlayProps) {
  const [screen, setScreen] = useState<"login" | "register">(defaultScreen);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Elena Vance"); // Default profile alignment
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Authenticate using Google OAuth via Supabase
  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. Switched to Simulated Offline mode; click 'Offline' to continue instantly.");
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (err) throw err;
      onClose();
    } catch (err: any) {
      console.error("Supabase Google Auth Exception:", err);
      setError(err.message || "Failed to trigger Supabase Google authentication handshake.");
    } finally {
      setLoading(false);
    }
  };

  // Submit email password form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Try to authenticate using local FastAPI server first!
      try {
        const url = screen === "login" ? "/api/login" : "/api/register";
        const body = screen === "login" 
          ? { email, password }
          : { name, email, password };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setLoading(false);
          const displayName = screen === "login" ? (data.user?.name || "Local Operator") : name;
          localStorage.setItem("supa_simulated_user", JSON.stringify({ email, displayName }));
          onAuthenticate(displayName);
          onClose();
          return;
        } else {
          const errData = await response.json();
          throw new Error(errData.detail || "Authentication request rejected by backend.");
        }
      } catch (err: any) {
        console.warn("Backend auth offline or failed, falling back to simulated localStorage auth.", err);
        // If it was a real validation rejection (e.g. invalid password or email already taken), show it
        if (err.message && err.message !== "Failed to fetch" && !err.message.includes("aborted")) {
          setError(err.message);
          setLoading(false);
          return;
        }
      }

      // Offline fallback signup / login simulation
      setTimeout(() => {
        setLoading(false);
        const displayName = screen === "login" ? "Simulated Operator" : name;
        localStorage.setItem("supa_simulated_user", JSON.stringify({ email, displayName }));
        onAuthenticate(displayName);
        onClose();
      }, 800);
      return;
    }

    try {
      if (screen === "login") {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        const userDisplayName = data.user?.user_metadata?.display_name || data.user?.email?.split("@")[0] || "Elena Vance";
        onAuthenticate(userDisplayName);
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });
        if (err) throw err;
        
        // Supabase sometimes requires email confirmation. Let's inspect session
        if (data.session) {
          onAuthenticate(name);
        } else {
          setInfo("Sign up completed! Please verify your email inbox if confirmation rules are active on your Supabase dashboard.");
        }
      }
      if (!info) {
        onClose();
      }
    } catch (err: any) {
      console.error("Supabase Credential Auth Exception:", err);
      setError(err.message || "Credential authentication failed on Supabase backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1326]/85 backdrop-blur-md">
      {/* Outer Click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main glass card modal container */}
      <div className="relative w-full max-w-sm glass-card rounded-[40px] p-8 border border-[#c0c1ff]/20 shadow-[0_0_80px_rgba(111,0,190,0.15)] overflow-hidden fade-in-up">
        {/* Decorative corner flares */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#ffb95f]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#c0c1ff]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header panel */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#ffb95f] tracking-widest uppercase">
              SUPABASE ACCESS
            </span>
            <h3 className="text-2xl font-light text-white tracking-tight">
              {screen === "login" ? "Sign In to ASTRA" : "Create Developer ID"}
            </h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="relative z-10 text-[#c7c4d7]/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
          >
            <span className="material-symbols-outlined text-lg font-bold">close</span>
          </button>
        </div>

        {/* Dynamic warning about missing environment configuration */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-[#ffb95f]/5 border border-[#ffb95f]/15 rounded-2xl flex items-start gap-2 text-[10.5px] text-[#ffb95f]/80 leading-relaxed font-sans">
            <span className="material-symbols-outlined text-sm mt-0.5">info</span>
            <div>
              <span className="font-bold text-white block">Offline Mode Active</span>
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. The system is operating in simulated sandboxed mode.
            </div>
          </div>
        )}

        {/* Display Error Message info */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-2xl leading-relaxed">
            {error}
          </div>
        )}

        {/* Display Success Info info */}
        {info && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-2xl leading-relaxed">
            {info}
          </div>
        )}

        {/* SSO Button Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="glass-card-light hover:bg-white/10 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-white"
          >
            <img
              alt="Google SSO login"
              className="w-4 h-4 object-contain"
              src="https://lh3.googleusercontent.com/COxitSg0gW3sJH2f92K3Oi-ZgIP7K68UC1gxzfAHJW3QD9gO0PQMZZ6_v3pS9clg94o"
            />
            Google
          </button>
          <button
            onClick={() => {
              // Simulated offline mode triggers bypass
              const displayName = "Local Operator";
              onAuthenticate(displayName);
              onClose();
            }}
            disabled={loading}
            className="glass-card-light hover:bg-white/10 text-xs font-semibold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-white"
          >
            <span className="material-symbols-outlined text-sm">laptop_mac</span>
            Offline
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[9px] font-bold text-[#c7c4d7]/45 uppercase font-mono tracking-widest">
            or use credentials
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {screen === "register" && (
            <div>
              <label className="block text-[10px] font-semibold text-[#c7c4d7]/70 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Vance"
                className="w-full bg-[#20273a]/50 text-white rounded-xl py-2.5 px-4 text-xs font-medium border border-white/10 focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-[#c7c4d7]/70 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena.vance@astra.com"
              className="w-full bg-[#20273a]/50 text-white rounded-xl py-2.5 px-4 text-xs font-medium border border-white/10 focus:outline-none focus:border-[#c0c1ff]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#c7c4d7]/70 uppercase tracking-wider mb-1">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#20273a]/50 text-white rounded-xl py-2.5 px-4 text-xs font-medium border border-white/10 focus:outline-none focus:border-[#c0c1ff]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffb95f] hover:bg-[#ffddb8] text-[#2a1700] font-semibold py-3 rounded-full text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {loading ? "sync" : "verified_user"}
            </span>
            {loading ? "Configuring Core..." : screen === "login" ? "Sign In & Calibrate" : "Register and Secure Core"}
          </button>
        </form>

        {/* Switch footer prompt */}
        <div className="mt-6 text-center text-xs text-[#c7c4d7]/60">
          {screen === "login" ? (
            <p>
              New parameter scope?{" "}
              <button
                type="button"
                onClick={() => setScreen("register")}
                className="text-[#c0c1ff] hover:text-white underline font-semibold cursor-pointer"
              >
                Register a clean ID
              </button>
            </p>
          ) : (
            <p>
              Already configured?{" "}
              <button
                type="button"
                onClick={() => setScreen("login")}
                className="text-[#c0c1ff] hover:text-white underline font-semibold cursor-pointer"
              >
                Return to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
