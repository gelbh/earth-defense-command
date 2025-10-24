import React from 'react';
import { motion } from 'framer-motion';

const ResourceHUD = ({ gameState, onHelpClick, compact = false }) => {
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getPowerColor = (power) => {
    if (power > 75) return 'from-green-500 to-green-400';
    if (power > 50) return 'from-yellow-500 to-yellow-400';
    if (power > 25) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const getPowerTextColor = (power) => {
    if (power > 75) return 'text-green-400';
    if (power > 50) return 'text-yellow-400';
    if (power > 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const StatCard = ({ icon, label, value, subValue, color = 'neon-blue', animate = false }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-3 overflow-hidden group"
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-${color} to-transparent`}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-1">
          <span className="text-2xl filter drop-shadow-lg">{icon}</span>
          <span className={`text-[10px] font-bold text-${color} uppercase tracking-wider opacity-60`}>
            {label}
          </span>
        </div>
        <div className="mt-1">
          <p className={`text-lg font-bold text-${color} tracking-tight font-mono`}>
            {value}
          </p>
          {subValue && (
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const PowerCard = () => {
    const power = gameState.power;
    const powerColor = getPowerColor(power);
    const textColor = getPowerTextColor(power);

    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-3 overflow-hidden group"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-1">
            <span className="text-2xl filter drop-shadow-lg">⚡</span>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider opacity-60">
              POWER
            </span>
          </div>
          
          {/* Power bar */}
          <div className="mt-2 mb-1">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${power}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${powerColor} rounded-full relative`}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
          </div>
          
          <p className={`text-lg font-bold ${textColor} tracking-tight font-mono`}>
            {power}%
          </p>
        </div>
      </motion.div>
    );
  };

  // Compact mode for overlay layout
  if (compact) {
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/40 backdrop-blur-lg border-b border-neon-blue/30 shadow-2xl"
      >
        <div className="px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title + Help */}
            <div className="flex items-center gap-3">
              <div className="text-2xl filter drop-shadow-lg">🌎</div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-neon-blue via-blue-400 to-neon-blue bg-clip-text text-transparent font-mono leading-tight tracking-wide">
                  EARTH DEFENSE COMMAND
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onHelpClick}
                className="px-2 py-1 bg-neon-blue/20 hover:bg-neon-blue/40 border border-neon-blue/50 rounded text-neon-blue text-xs font-bold transition-all"
                title="How to Play"
              >
                ❓
              </motion.button>
            </div>

            {/* Right: Compact Resources */}
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-black/50 border border-neon-green/50 rounded flex items-center gap-1.5">
                <span className="text-sm">💰</span>
                <span className="text-xs font-bold text-neon-green font-mono">{formatCurrency(gameState.funds)}</span>
              </div>

              <div className="px-2 py-1 bg-black/50 border border-yellow-500/50 rounded flex items-center gap-1.5">
                <span className="text-sm">⚡</span>
                <span className={`text-xs font-bold font-mono ${getPowerTextColor(gameState.power)}`}>
                  {gameState.power}%
                </span>
              </div>

              <div className="px-2 py-1 bg-black/50 border border-neon-blue/50 rounded flex items-center gap-1.5">
                <span className="text-sm">🛰️</span>
                <span className="text-xs font-bold text-neon-blue font-mono">
                  {Array.isArray(gameState.satellites) ? gameState.satellites.length : 0}
                </span>
              </div>

              <div className="px-2 py-1 bg-black/50 border border-purple-400/50 rounded flex items-center gap-1.5">
                <span className="text-sm">🚀</span>
                <span className="text-xs font-bold text-purple-400 font-mono">
                  {gameState.availableProbes || 0}
                </span>
              </div>

              <div className="px-2 py-1 bg-black/50 border border-gray-500/50 rounded flex items-center gap-1.5">
                <span className="text-sm">📅</span>
                <span className="text-xs font-bold text-gray-300 font-mono">{gameState.day}</span>
              </div>

              <div className="px-2 py-1 bg-black/50 border border-neon-yellow/50 rounded flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-bold text-neon-yellow font-mono">
                  {gameState.score.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full mode for traditional layout
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-b from-gray-950 to-gray-900 border-b border-neon-blue/30 shadow-2xl"
    >
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-6 mb-3">
          {/* Header on the left */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-3xl filter drop-shadow-lg">🌎</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue via-blue-400 to-neon-blue bg-clip-text text-transparent font-mono leading-tight tracking-wide">
                EARTH DEFENSE COMMAND
              </h1>
              <p className="text-xs text-gray-400 font-mono leading-tight tracking-wide">
                Real-time planetary defense • NASA Data
              </p>
            </div>
            
            {/* Help Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onHelpClick}
              className="ml-2 px-3 py-1.5 bg-gradient-to-r from-neon-blue/20 to-blue-600/20 hover:from-neon-blue/40 hover:to-blue-600/40 border border-neon-blue rounded-lg text-neon-blue text-xs font-bold transition-all duration-300"
              title="How to Play"
            >
              <span className="mr-1">❓</span> HELP
            </motion.button>
          </motion.div>

          {/* Resources grid on the right */}
          <div className="flex-1 grid grid-cols-3 md:grid-cols-6 gap-3 max-w-5xl ml-auto">
            <StatCard
              icon="💰"
              label="Funds"
              value={formatCurrency(gameState.funds)}
              color="neon-green"
            />

            <PowerCard />

            <StatCard
              icon="🛰️"
              label="Satellites"
              value={Array.isArray(gameState.satellites) ? gameState.satellites.length : 0}
              subValue="deployed"
              color="neon-blue"
            />

            <StatCard
              icon="🚀"
              label="Probes"
              value={gameState.availableProbes || 0}
              subValue={`${Array.isArray(gameState.probes) ? gameState.probes.length : 0} deployed`}
              color="purple-400"
            />

            <StatCard
              icon="📅"
              label="Day"
              value={gameState.day}
              color="gray-300"
            />

            <StatCard
              icon="⭐"
              label="Score"
              value={gameState.score.toLocaleString()}
              color="neon-yellow"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceHUD;
