import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ViewType } from "./types";
import LandingView from "./components/LandingView";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import DeveloperConsole from "./components/DeveloperConsole";

export default function App() {
  const [pilotName, setPilotName] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  // Load active pilot credentials from local storage on reload for real-life session persistence
  useEffect(() => {
    const cachedPilot = localStorage.getItem("aura_pilot_name");
    if (cachedPilot) {
      setPilotName(cachedPilot);
    }
  }, []);

  const handleLoginSuccess = (name: string) => {
    localStorage.setItem("aura_pilot_name", name);
    setPilotName(name);
    setCurrentView("dashboard");
  };

  const handleSignOut = () => {
    localStorage.clear();
    setPilotName("");
    setCurrentView("landing");
  };

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <LandingView 
            onViewChange={setCurrentView}
            isLoggedIn={!!pilotName}
            pilotName={pilotName}
          />
        );
      case "login":
        return <LoginView onLoginSuccess={handleLoginSuccess} />;
      case "dashboard":
        return (
          <DashboardView 
            pilotName={pilotName} 
            onViewChange={setCurrentView} 
            onSignOut={handleSignOut} 
          />
        );
      case "developer-console":
        return (
          <DeveloperConsole 
            pilotName={pilotName} 
            onViewChange={setCurrentView} 
            onSignOut={handleSignOut} 
          />
        );
      default:
        return <LoginView onLoginSuccess={handleLoginSuccess} />;
    }
  };

  const isScrollableView = currentView === "landing" || currentView === "login";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, filter: "blur(6px)", scale: 0.995 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        exit={{ opacity: 0, filter: "blur(6px)", scale: 0.995 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={isScrollableView ? "min-h-screen w-full flex flex-col bg-[#131313]" : "h-screen w-full overflow-hidden bg-[#131313]"}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}
