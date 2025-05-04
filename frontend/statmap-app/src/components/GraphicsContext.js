//modifications of the CountrySelectionContext. This context helps store, triger state changes and store the graphcs settings in local storage.

import React, { createContext, useState, useContext, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

// Create the context
const GraphicsContext = createContext();

// Default settings
/* const defaultSettings = {
  polygonCount: 50,           // Range: 20-100
  anisotropicFiltering: 4,    // Range: 0-16
  antiAliasing: false,      // Toggle: true/false
  globeBrightness: 50,        // Range: 0-100 (percentage)
  rotationSpeed: 50,          // Range: 0-100 (percentage)
  textColor: '#FFFFFF',       // Default white
  borderColor: '#336699',     // Default blue
  showClouds: true,           // Toggle: true/false
  globeBackGround: true,      // Toggle: true/false
}; */

// Define base default settings (good for desktop)
const desktopDefaults = {
  polygonCount: 50,           // Range: 20-100
  anisotropicFiltering: 4,    // Range: 0-16
  antiAliasing: false,      // Toggle: true/false
  globeBrightness: 50,        // Range: 0-100 (percentage)
  rotationSpeed: 50,          // Range: 0-100 (percentage)
  textColor: '#FFFFFF',       // Default white
  borderColor: '#336699',     // Default blue
  showClouds: true,           // Toggle: true/false
  globeBackGround: false,      // Toggle: true/false
  showGalaxyBackground: false, // Toggle: true/false      
  showStars: true,           // Toggle: true/false
  mobile: isMobile,
};

// Define overrides for mobile defaults
const mobileDefaults = {
  ...desktopDefaults, // Start with desktop settings
  polygonCount: 30,           // Lower polygon count
  anisotropicFiltering: 0,    // Disable anisotropic filtering
  antiAliasing: false,         // Ensure AA is off
  showClouds: false,          // Disable clouds by default
  showGalaxyBackground: false, // Disable galaxy background by default
  showStars: true,           // Disable stars by default
  rotationSpeed: 50,       // Optionally reduce default rotation speed
};

// Determine the appropriate defaults based on device type
const defaultSettings = isMobile ? mobileDefaults : desktopDefaults;


// Create a provider component
export const GraphicsContextProvider = ({ children }) => {
  // Initialize state from localStorage or use defaults
  const [graphicsSettings, setGraphicsSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('graphicsSettings');
      // Merge saved settings with defaults to ensure all keys exist
      const initialSettings = savedSettings ? (isMobile ?
        { ...JSON.parse(savedSettings), ...mobileDefaults } :
        (JSON.parse(savedSettings).mobile === isMobile ?
          { ...JSON.parse(savedSettings), globeBackGround: false } :
          { ...JSON.parse(savedSettings), ...desktopDefaults })) : {};
      return { ...defaultSettings, ...initialSettings };
    } catch (error) {
      console.error("Error reading graphics settings from localStorage:", error);
      return defaultSettings;
    }
  });

  //save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('graphicsSettings', JSON.stringify(graphicsSettings));
    } catch (error) {
      console.error("Error saving graphics settings to localStorage:", error);
    }
  }, [graphicsSettings]);

  // Update a single setting
  const updateSetting = (setting, value) => {
    setGraphicsSettings(prevSettings => ({
      ...prevSettings,
      [setting]: value
    }));
  };

  // Reset to defaults
  const resetSettings = () => {
    setGraphicsSettings(defaultSettings);
  };

  // Update multiple settings at once
  const updateSettings = (newSettings) => {
    setGraphicsSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Value object that will be passed to consumer components
  const value = {
    graphicsSettings,
    updateSetting,
    updateSettings,
    resetSettings
  };

  return (
    <GraphicsContext.Provider value={value}>
      {children}
    </GraphicsContext.Provider>
  );
};

// Custom hook for consuming the context
export const useGraphicsSettings = () => {
  const context = useContext(GraphicsContext);
  if (context === undefined) {
    throw new Error('useGraphicsSettings must be used within a GraphicsContextProvider');
  }
  return context;
};