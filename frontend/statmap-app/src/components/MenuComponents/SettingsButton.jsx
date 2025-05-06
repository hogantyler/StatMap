import React, { useState, useContext } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";
import { playClickSound } from "../../utils/soundUtils";

export default function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    playClickSound();
    setIsSettingsOpen(true);
  };

  return (
    <div className="absolute top-6 left-6 z-50">
      <button
        onClick={handleSettingsClick}
        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-lg"
      >
        <Settings size={18} />
        <span className="text-sm font-medium">Settings</span>
      </button>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
} 