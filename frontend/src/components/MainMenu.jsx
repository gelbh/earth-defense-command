import React from "react";
import { motion } from "framer-motion";
import { useLevel } from "../context/LevelContext";

const MainMenu = ({
  onStartCampaign,
  onLevelSelect,
  onEndless,
  onSettings,
}) => {
  const { progression } = useLevel();

  return (
    <div className="fixed inset-0 bg-space-blue flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue font-mono mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% auto",
            }}
          >
            EARTH DEFENSE
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-neon-green font-mono"
          >
            COMMAND
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 mt-4 font-mono"
          >
            Protect Earth from asteroid threats
          </motion.p>
        </motion.div>

        {/* Progress Summary */}
        {progression.totalStars > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black bg-opacity-50 rounded-lg border border-neon-blue p-4 mb-8 font-mono"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neon-blue">
                  {progression.unlockedLevels.length}
                </div>
                <div className="text-sm text-gray-400">Levels Unlocked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  ⭐ {progression.totalStars}
                </div>
                <div className="text-sm text-gray-400">Total Stars</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  💎 {progression.gems}
                </div>
                <div className="text-sm text-gray-400">Gems</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartCampaign}
            className="w-full px-8 py-4 bg-gradient-to-r from-neon-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold font-mono rounded-lg border-2 border-neon-blue transition-all text-xl flex items-center justify-between group"
          >
            <span>🚀 START CAMPAIGN</span>
            <motion.span
              className="opacity-0 group-hover:opacity-100"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLevelSelect}
            className="w-full px-8 py-4 bg-gradient-to-r from-neon-green to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold font-mono rounded-lg border-2 border-neon-green transition-all text-xl flex items-center justify-between group"
          >
            <span>📋 LEVEL SELECT</span>
            <motion.span
              className="opacity-0 group-hover:opacity-100"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndless}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold font-mono rounded-lg border-2 border-purple-400 transition-all text-xl flex items-center justify-between group"
          >
            <span>♾️ ENDLESS MODE</span>
            <motion.span
              className="opacity-0 group-hover:opacity-100"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Placeholder buttons */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={onSettings}
            className="w-full px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono rounded-lg border-2 border-gray-600 transition-all"
          >
            ⚙️ SETTINGS
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-gray-500 text-sm font-mono"
        >
          <p>v1.0.0 | NASA Data Integration</p>
          <p className="mt-2">Built with React + Three.js</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MainMenu;
