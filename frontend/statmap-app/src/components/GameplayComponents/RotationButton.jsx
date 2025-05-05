import React, { useState, useEffect } from "react";
import { useGraphicsSettings } from "../GraphicsContext";
import { Pause, Play, RefreshCwOff, RefreshCw } from "lucide-react";

const RotationButton = () => {
  const { graphicsSettings, updateSetting } = useGraphicsSettings();
  const [isRotating, setIsRotating] = useState(true);
  const [previousSpeed, setPreviousSpeed] = useState(graphicsSettings.rotationSpeed);

  // Initialize state based on current rotationSpeed
  useEffect(() => {
    setIsRotating(graphicsSettings.rotationSpeed > 0);
    if (graphicsSettings.rotationSpeed > 0) {
      setPreviousSpeed(graphicsSettings.rotationSpeed);
    }
  }, []);

  const toggleRotation = () => {
    if (isRotating) {
      // Store current speed before stopping
      setPreviousSpeed(graphicsSettings.rotationSpeed);
      // Stop rotation
      updateSetting("rotationSpeed", 0);
    } else {
      // Resume rotation with previous speed
      updateSetting("rotationSpeed", previousSpeed || 50); // Default to 50 if previousSpeed is 0
    }
    setIsRotating(!isRotating);
  };

  return (
    <button
      onClick={toggleRotation}
      className="bg-zinc-900/80 border p-2 rounded-full text-white/70 border-sky-400 hover:text-sky-400 hover:bg-zinc-800/80 transition-all duration-200"
      title={isRotating ? "Pause Rotation" : "Resume Rotation"}
    >
      {isRotating ? (
        <div className="flex items-center justify-center gap-1 text-xs">
          <span className="inline-flex items-center">Stop Spin</span>
          <RefreshCwOff size={14} className="inline-block"/>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1 text-xs">
          <span className="inline-flex items-center">Start Spin</span>
          <RefreshCw size={14} className="inline-block"/>
        </div>
      )}
    </button>
  );
};

export default RotationButton;
