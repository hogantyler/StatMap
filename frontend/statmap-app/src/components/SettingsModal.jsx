import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const SettingsModal = ({ isOpen, onClose }) => {
  const [brightness, setBrightness] = useState(100);
  const [soundLevel, setSoundLevel] = useState(50);
  const [globeQuality, setGlobeQuality] = useState('medium');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
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
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Brightness Setting */}
            <div>
              <label className="block text-lg mb-2">Brightness</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(e.target.value)}
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
                  onChange={(e) => setSoundLevel(e.target.value)}
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
                onChange={(e) => setGlobeQuality(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white"
              >
                <option value="low">Low Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="high">High Quality</option>
                <option value="ultra">Ultra Quality</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              className="w-full bg-white text-black py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={() => {
                onClose();
              }}
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