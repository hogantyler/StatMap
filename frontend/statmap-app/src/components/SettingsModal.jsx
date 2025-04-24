import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  Volume2,
  Sun,
  Globe,
  Layers,
  Sliders,
  RotateCw,
  CloudSun,
  Palette,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { setGlobalVolume, playClickSound } from '../utils/soundUtils';
import { useGraphicsSettings } from './GraphicsContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
    },
  },
};

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Temporary state for unsaved changes
  const [tempBrightness, setTempBrightness] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('brightness');
      return saved ? Number.parseInt(saved) : 100;
    }
    return 100;
  });

  const [tempSoundLevel, setTempSoundLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundLevel');
      return saved ? Number.parseInt(saved) : 50;
    }
    return 50;
  });

  const [tempGlobeQuality, setTempGlobeQuality] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('globeQuality');
      return saved || 'medium';
    }
    return 'medium';
  });

  const { graphicsSettings, updateSetting, updateSettings } = useGraphicsSettings();
  const [tempGraphicsSettings, setTempGraphicsSettings] = useState({});

  // Initialize temporary graphics settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempGraphicsSettings({ ...graphicsSettings });
    }
  }, [isOpen, graphicsSettings]);

  // Define quality presets
  const qualityPresets = {
    low: {
      polygonCount: 15,
      anisotropicFiltering: 0,
      globeBrightness: 50,
      rotationSpeed: 50,
      showClouds: false,
    },
    medium: {
      polygonCount: 40,
      anisotropicFiltering: 4,
      globeBrightness: 50,
      rotationSpeed: 50,
      showClouds: true,
    },
    high: {
      polygonCount: 60,
      anisotropicFiltering: 8,
      globeBrightness: 50,
      rotationSpeed: 50,
      showClouds: true,
    },
    ultra: {
      polygonCount: 100,
      anisotropicFiltering: 16,
      globeBrightness: 50,
      rotationSpeed: 50,
      showClouds: true,
    },
  };

  // Function to check if current settings match any preset
  const getCurrentPreset = () => {
    for (const [preset, settings] of Object.entries(qualityPresets)) {
      const matches = Object.entries(settings).every(([key, value]) => tempGraphicsSettings[key] === value);
      if (matches) return preset;
    }
    return 'custom';
  };

  // Update preset when temporary graphics settings change
  useEffect(() => {
    if (Object.keys(tempGraphicsSettings).length > 0) {
      setTempGlobeQuality(getCurrentPreset());
    }
  }, [tempGraphicsSettings]);

  // Handle preset change
  const handlePresetChange = (preset) => {
    if (preset === 'custom') return;
    setTempGraphicsSettings(qualityPresets[preset]);
    setTempGlobeQuality(preset);
  };

  const handleSave = () => {
    // Apply all settings
    setGlobalVolume(tempSoundLevel);
    updateSettings(tempGraphicsSettings);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('brightness', tempBrightness);
      localStorage.setItem('soundLevel', tempSoundLevel);
      localStorage.setItem('globeQuality', tempGlobeQuality);
    }
    
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900/90 border border-white/10 text-white p-6 rounded-lg w-full max-w-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Settings size={20} />
              </div>
              <h2 className="text-2xl font-bold">Settings</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white rounded-full p-2 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                'px-4 py-2 rounded-lg transition-all duration-300',
                activeTab === 'general'
                  ? 'bg-zinc-900/80 text-white border border-white/10'
                  : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90',
              )}
            >
              <div className="flex items-center gap-2">
                <Sliders size={16} />
                <span>General</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('graphics')}
              className={cn(
                'px-4 py-2 rounded-lg transition-all duration-300',
                activeTab === 'graphics'
                  ? 'bg-zinc-900/80 text-white border border-white/10'
                  : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90',
              )}
            >
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>Graphics</span>
              </div>
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Brightness Setting */}
                <div
                  className={cn(
                    'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                    hoveredSection === 'brightness' ? 'bg-zinc-900/60' : '',
                  )}
                  onMouseEnter={() => setHoveredSection('brightness')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300',
                      hoveredSection === 'brightness' && 'opacity-100',
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Sun size={16} />
                      </div>
                      <h3 className="font-medium">Brightness</h3>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={tempBrightness}
                        onChange={(e) => setTempBrightness(Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right text-white/80">{tempBrightness}%</span>
                    </div>
                  </div>
                </div>

                {/* Sound Level Setting */}
                <div
                  className={cn(
                    'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                    hoveredSection === 'sound' ? 'bg-zinc-900/60' : '',
                  )}
                  onMouseEnter={() => setHoveredSection('sound')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br from-sky-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300',
                      hoveredSection === 'sound' && 'opacity-100',
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <Volume2 size={16} />
                      </div>
                      <h3 className="font-medium">Sound Level</h3>
                    </div>

                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={tempSoundLevel}
                        onChange={(e) => setTempSoundLevel(Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-12 text-right text-white/80">{tempSoundLevel}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graphics' && (
              <div className="space-y-6">
                {/* Globe Quality Setting */}
                <div
                  className={cn(
                    'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                    hoveredSection === 'quality' ? 'bg-zinc-900/60' : '',
                  )}
                  onMouseEnter={() => setHoveredSection('quality')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300',
                      hoveredSection === 'quality' && 'opacity-100',
                    )}
                  />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Globe size={16} />
                      </div>
                      <h3 className="font-medium">Globe Quality</h3>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {['low', 'medium', 'high', 'ultra'].map((quality) => (
                        <button
                          key={quality}
                          onClick={() => handlePresetChange(quality)}
                          className={cn(
                            'py-2 px-3 rounded-md text-sm font-medium transition-all duration-200',
                            tempGlobeQuality === quality
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-zinc-800/60 text-white/70 border border-white/10 hover:bg-zinc-700/60 hover:text-white',
                          )}
                        >
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Toggle */}
                <div
                  className={cn(
                    'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40',
                    hoveredSection === 'advanced' ? 'bg-zinc-900/60' : '',
                  )}
                  onMouseEnter={() => setHoveredSection('advanced')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-300',
                      hoveredSection === 'advanced' && 'opacity-100',
                    )}
                  />

                  <div className="relative">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Layers size={16} />
                        </div>
                        <h3 className="font-medium">Advanced Graphics Settings</h3>
                      </div>
                      {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {showAdvanced && (
                      <div className="px-5 pb-5 pt-2 border-t border-white/10 space-y-5">
                        {/* Polygon Count */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/70 flex items-center gap-2">
                              <Layers size={14} className="text-white/40" />
                              Polygon Count
                            </label>
                            <span className="text-sm font-medium">{tempGraphicsSettings.polygonCount}</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={tempGraphicsSettings.polygonCount}
                            onChange={(e) =>
                              setTempGraphicsSettings((prev) => ({
                                ...prev,
                                polygonCount: Number.parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Anisotropic Filtering */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/70 flex items-center gap-2">
                              <Sliders size={14} className="text-white/40" />
                              Anisotropic Filtering
                            </label>
                            <span className="text-sm font-medium">{tempGraphicsSettings.anisotropicFiltering}x</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="16"
                            step="4"
                            value={tempGraphicsSettings.anisotropicFiltering}
                            onChange={(e) =>
                              setTempGraphicsSettings((prev) => ({
                                ...prev,
                                anisotropicFiltering: Number.parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Globe Brightness */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/70 flex items-center gap-2">
                              <Sun size={14} className="text-white/40" />
                              Globe Brightness
                            </label>
                            <span className="text-sm font-medium">{tempGraphicsSettings.globeBrightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={tempGraphicsSettings.globeBrightness}
                            onChange={(e) =>
                              setTempGraphicsSettings((prev) => ({
                                ...prev,
                                globeBrightness: Number.parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Rotation Speed */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-white/70 flex items-center gap-2">
                              <RotateCw size={14} className="text-white/40" />
                              Rotation Speed
                            </label>
                            <span className="text-sm font-medium">{tempGraphicsSettings.rotationSpeed}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={tempGraphicsSettings.rotationSpeed}
                            onChange={(e) =>
                              setTempGraphicsSettings((prev) => ({
                                ...prev,
                                rotationSpeed: Number.parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Show Clouds Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CloudSun size={14} className="text-white/40" />
                            <label className="text-sm text-white/70">Show Clouds</label>
                          </div>
                          <button
                            onClick={() =>
                              setTempGraphicsSettings((prev) => ({
                                ...prev,
                                showClouds: !prev.showClouds,
                              }))
                            }
                            className={cn(
                              'w-12 h-6 rounded-full relative transition-colors',
                              tempGraphicsSettings.showClouds ? 'bg-emerald-500/30' : 'bg-zinc-700',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-1 w-4 h-4 rounded-full transition-all',
                                tempGraphicsSettings.showClouds ? 'right-1 bg-emerald-400' : 'left-1 bg-white/60',
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button
                className="w-full bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg py-3 px-4 hover:bg-sky-500/30 transition-colors text-lg font-medium flex items-center justify-center gap-2"
                onClick={handleSave}
              >
                <Check size={18} />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal; 