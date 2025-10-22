import React from 'react';
import { motion } from 'framer-motion';

const ResourceHUD = ({ gameState }) => {
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getPowerColor = (power) => {
    if (power > 75) return 'text-neon-green';
    if (power > 50) return 'text-neon-yellow';
    if (power > 25) return 'text-orange-500';
    return 'text-neon-red';
  };

  const getDamageColor = (damage) => {
    if (damage < 25) return 'text-neon-green';
    if (damage < 50) return 'text-neon-yellow';
    if (damage < 75) return 'text-orange-500';
    return 'text-neon-red';
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-dark-gray border-b-2 border-neon-blue p-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {/* Funds */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">FUNDS</p>
                <p className="text-lg font-bold text-neon-green">
                  {formatCurrency(gameState.funds)}
                </p>
              </div>
            </div>
          </div>

          {/* Power */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">POWER</p>
                <p className={`text-lg font-bold ${getPowerColor(gameState.power)}`}>
                  {gameState.power}%
                </p>
              </div>
            </div>
          </div>

          {/* Satellites */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛰️</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">SATELLITES</p>
                <p className="text-lg font-bold text-neon-blue">
                  {gameState.satellites}/5
                </p>
              </div>
            </div>
          </div>

          {/* Probes */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">PROBES</p>
                <p className="text-lg font-bold text-neon-blue">
                  {gameState.probes}/3
                </p>
              </div>
            </div>
          </div>

          {/* Day */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">DAY</p>
                <p className="text-lg font-bold text-white">
                  {gameState.day}
                </p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="bg-medium-gray rounded-lg p-3 glow-blue">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-xs text-gray-400 font-mono">SCORE</p>
                <p className="text-lg font-bold text-neon-yellow">
                  {gameState.score.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Earth Damage Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-mono text-gray-400">EARTH DAMAGE</span>
            <span className={`text-sm font-bold ${getDamageColor(gameState.earthDamage)}`}>
              {gameState.earthDamage}%
            </span>
          </div>
          <div className="w-full bg-dark-gray rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                gameState.earthDamage < 25 ? 'bg-neon-green' :
                gameState.earthDamage < 50 ? 'bg-neon-yellow' :
                gameState.earthDamage < 75 ? 'bg-orange-500' : 'bg-neon-red'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${gameState.earthDamage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceHUD;
