import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { setGlobalVolume, playClickSound } from '../utils/soundUtils';
import { useGraphicsSettings } from './GraphicsContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('brightness');
    return saved ? parseInt(saved) : 100;
  });
  const [soundLevel, setSoundLevel] = useState(() => {
    const saved = localStorage.getItem('soundLevel');
    return saved ? parseInt(saved) : 50;
  });
  const [globeQuality, setGlobeQuality] = useState(() => {
    const saved = localStorage.getItem('globeQuality');
    return saved || 'medium';
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { graphicsSettings, updateSetting, updateSettings } = useGraphicsSettings();

  // Define quality presets
  const qualityPresets = {
    'low': {
      polygonCount: 20,
      anisotropicFiltering: 0,
      globeBrightness: 50,
      rotationSpeed: 30,
      showClouds: false,
    },
    'medium': {
      polygonCount: 50,
      anisotropicFiltering: 4,
      globeBrightness: 70,
      rotationSpeed: 50,
      showClouds: true,
    },
    'high': {
      polygonCount: 75,
      anisotropicFiltering: 8,
      globeBrightness: 85,
      rotationSpeed: 70,
      showClouds: true,
    },
    'ultra': {
      polygonCount: 100,
      anisotropicFiltering: 16,
      globeBrightness: 100,
      rotationSpeed: 100,
      showClouds: true,
    }
  };

  // Function to check if current settings match any preset
  const getCurrentPreset = () => {
    for (const [preset, settings] of Object.entries(qualityPresets)) {
      const matches = Object.entries(settings).every(([key, value]) =>
        graphicsSettings[key] === value
      );
      if (matches) return preset;
    }
    return 'custom';
  };

  // Update preset when graphics settings change
  useEffect(() => {
    setGlobeQuality(getCurrentPreset());
  }, [graphicsSettings]);

  // Handle preset change
  const handlePresetChange = (preset) => {
    if (preset === 'custom') return;
    updateSettings(qualityPresets[preset]);
    setGlobeQuality(preset);
  };

  useEffect(() => {
    setGlobalVolume(soundLevel);
  }, [soundLevel]);

  const handleSoundChange = (e) => {
    const newValue = parseInt(e.target.value);
    setSoundLevel(newValue);
    setGlobalVolume(newValue);
  };

  const handleSave = () => {
    localStorage.setItem('brightness', brightness);
    localStorage.setItem('soundLevel', soundLevel);
    localStorage.setItem('globeQuality', globeQuality);
    playClickSound();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          // Only close if clicking directly on the overlay background
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black text-white p-8 rounded-lg w-96 max-w-full"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="top-0 right-0 z-0">
              <button
                onClick={onClose}
                className="text-white rounded-full p-2 hover:text-red-600 transition-colors"
              >
                <FaTimes size={30} />
              </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Brightness Setting */}
            <div>
              <label className="block text-lg mb-2">Brightness</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-right">{brightness}%</span>
              </div>
            </div>

            {/* Sound Level Setting */}
            <div>
              <label className="block text-lg mb-2">Sound Level</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundLevel}
                  onChange={handleSoundChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-right">{soundLevel}%</span>
              </div>
            </div>

            {/* Globe Quality Setting */}
            <div>
              <label className="block text-lg mb-2">Globe Quality</label>
              <select
                value={globeQuality}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
              >
                <option value="low">Low Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="high">High Quality</option>
                <option value="ultra">Ultra Quality</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-lg font-semibold"
              >
                <span>Advanced Graphics Settings</span>
                {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {/* Polygon Count */}
                  <div>
                    <label className="block text-sm mb-1">Polygon Count</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={graphicsSettings.polygonCount}
                        onChange={(e) => updateSetting('polygonCount', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right">{graphicsSettings.polygonCount}</span>
                    </div>
                  </div>

                  {/* Anisotropic Filtering */}
                  <div>
                    <label className="block text-sm mb-1">Anisotropic Filtering</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="16"
                        value={graphicsSettings.anisotropicFiltering}
                        onChange={(e) => updateSetting('anisotropicFiltering', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right">{graphicsSettings.anisotropicFiltering}x</span>
                    </div>
                  </div>

                  {/* Globe Brightness */}
                  <div>
                    <label className="block text-sm mb-1">Globe Brightness</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={graphicsSettings.globeBrightness}
                        onChange={(e) => updateSetting('globeBrightness', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right">{graphicsSettings.globeBrightness}%</span>
                    </div>
                  </div>

                  {/* Rotation Speed */}
                  <div>
                    <label className="block text-sm mb-1">Rotation Speed</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={graphicsSettings.rotationSpeed}
                        onChange={(e) => updateSetting('rotationSpeed', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right">{graphicsSettings.rotationSpeed}%</span>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm mb-1">Text Color</label>
                    <input
                      type="color"
                      value={graphicsSettings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full h-8 bg-gray-800 rounded border border-gray-700"
                    />
                  </div>

                  {/* Border Color */}
                  <div>
                    <label className="block text-sm mb-1">Border Color</label>
                    <input
                      type="color"
                      value={graphicsSettings.borderColor}
                      onChange={(e) => updateSetting('borderColor', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full h-8 bg-gray-800 rounded border border-gray-700"
                    />
                  </div>

                  {/* Show Clouds Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="block text-sm">Show Clouds</label>
                    <input
                      type="checkbox"
                      checked={graphicsSettings.showClouds}
                      onChange={(e) => updateSetting('showClouds', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              className="w-full bg-white text-black py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal; 