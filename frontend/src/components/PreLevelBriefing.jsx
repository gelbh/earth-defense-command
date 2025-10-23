import React from "react";
import { motion } from "framer-motion";

const PreLevelBriefing = ({ level, onLaunch, onBack }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-orange-400";
      case "expert":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "tutorial":
        return "📚";
      case "survival":
        return "⚔️";
      case "precision":
        return "🎯";
      case "challenge":
        return "💪";
      case "boss":
        return "👹";
      default:
        return "🪨";
    }
  };

  if (!level) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-blue">
        <p className="text-white font-mono">Loading mission briefing...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-space-blue overflow-y-auto p-4 md:p-8">
      <div className="flex justify-center min-h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-black bg-opacity-80 rounded-lg border-2 border-neon-blue p-6 md:p-8 font-mono my-auto"
        >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">{getTypeIcon(level.type)}</span>
            <div>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-gray-400">LEVEL {level.id}</span>
                <span className="text-gray-600">|</span>
                <span
                  className={`font-bold ${getDifficultyColor(
                    level.difficulty
                  )}`}
                >
                  {level.difficulty.toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-neon-blue">
                {level.name}
              </h1>
            </div>
          </div>
          <p className="text-gray-300 text-lg">{level.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Objectives */}
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-neon-blue">
            <h2 className="text-xl font-bold text-neon-blue mb-3 flex items-center gap-2">
              <span>📋</span> MISSION OBJECTIVES
            </h2>
            <ul className="space-y-2">
              {level.objectives.map((objective, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-300"
                >
                  <span className="text-neon-green">▸</span>
                  <span>{objective.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Starting Resources */}
          <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 border border-neon-green">
            <h2 className="text-xl font-bold text-neon-green mb-3 flex items-center gap-2">
              <span>🚀</span> STARTING LOADOUT
            </h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Funding:</span>
                <span className="text-yellow-400">
                  ${(level.startingResources.funds / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="flex justify-between">
                <span>Power:</span>
                <span className="text-blue-400">
                  {level.startingResources.power}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Satellites:</span>
                <span className="text-cyan-400">
                  {level.startingResources.satellites.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Probes:</span>
                <span className="text-green-400">
                  {level.startingResources.probes.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Probe Missions:</span>
                <span className="text-orange-400">
                  {level.startingResources.availableProbes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Info */}
        <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-400 mb-6">
          <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
            <span>🌊</span> THREAT ASSESSMENT
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {level.waves.length}
              </div>
              <div className="text-sm text-gray-400">Waves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {level.waves.reduce(
                  (sum, wave) => sum + wave.asteroids.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-400">Total Threats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {Math.max(
                  ...level.waves.flatMap((w) =>
                    w.asteroids.map((a) => a.diameter)
                  )
                )}
                m
              </div>
              <div className="text-sm text-gray-400">Largest Asteroid</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {Math.max(
                  ...level.waves.flatMap((w) =>
                    w.asteroids.map((a) => a.velocity)
                  )
                )}
              </div>
              <div className="text-sm text-gray-400">Max Velocity (km/s)</div>
            </div>
          </div>
        </div>

        {/* Restrictions */}
        {level.restrictions && Object.keys(level.restrictions).length > 0 && (
          <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-400 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
              <span>⚠️</span> MISSION RESTRICTIONS
            </h2>
            <ul className="space-y-1 text-gray-300">
              {level.restrictions.maxFundsSpent && (
                <li>
                  • Maximum spending: ${level.restrictions.maxFundsSpent / 1000}
                  K
                </li>
              )}
              {level.restrictions.maxSatellites && (
                <li>
                  • Maximum satellites: {level.restrictions.maxSatellites}
                </li>
              )}
              {level.restrictions.maxProbes && (
                <li>• Maximum probes: {level.restrictions.maxProbes}</li>
              )}
            </ul>
          </div>
        )}

        {/* Star Requirements Preview */}
        <div className="bg-yellow-900 bg-opacity-20 rounded-lg p-4 border border-yellow-400 mb-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <span>⭐</span> STAR REQUIREMENTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-gray-400">Complete all objectives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⭐⭐</div>
              <div className="text-gray-400">+ No more than 2 misses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⭐⭐⭐</div>
              <div className="text-gray-400">+ Perfect clear</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors"
          >
            ← BACK
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-neon-blue to-neon-green hover:from-blue-500 hover:to-green-500 text-white font-bold rounded border-2 border-neon-green transition-all text-xl"
          >
            🚀 LAUNCH MISSION
          </motion.button>
        </div>

        {/* Tip */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          Good luck, Commander. Earth is counting on you.
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default PreLevelBriefing;
