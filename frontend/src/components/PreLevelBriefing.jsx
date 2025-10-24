import React from "react";
import { motion } from "framer-motion";
import { useLevel } from "../context/LevelContext";

const PreLevelBriefing = ({ level, onLaunch, onBack }) => {
  const { getLevelStars, getLevelBestTime } = useLevel();
  const previousStars = getLevelStars(level.id);
  const previousBestTime = getLevelBestTime(level.id);
  const isReplay = previousStars > 0 || previousBestTime !== null;
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

  const formatTime = (seconds) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!level) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-blue">
        <p className="text-white font-mono">Loading mission briefing...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-space-blue flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl w-full bg-black bg-opacity-80 rounded-lg border-2 border-neon-blue p-4 md:p-6 font-mono"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{getTypeIcon(level.type)}</span>
            <div>
              <div className="flex items-center gap-2 justify-center text-sm">
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
              <h1 className="text-2xl md:text-3xl font-bold text-neon-blue">
                {level.name}
              </h1>
            </div>
          </div>
          <p className="text-gray-300 text-sm">{level.description}</p>
        </div>

        {/* Previous Completion Stats (if replay) */}
        {isReplay && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-900 bg-opacity-30 rounded-lg p-2 border border-yellow-400 mb-3"
          >
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-yellow-400 font-bold">
                📊 PREVIOUS RECORD:
              </span>
              <span className="text-white">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className={i < previousStars ? "" : "opacity-20"}
                  >
                    ⭐
                  </span>
                ))}
              </span>
              {previousBestTime && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-cyan-400">
                    ⏱️ {formatTime(previousBestTime)}
                  </span>
                </>
              )}
            </div>
            <p className="text-center text-yellow-300 text-xs mt-1">
              💪 Can you beat your previous score?
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Objectives */}
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3 border border-neon-blue">
            <h2 className="text-sm font-bold text-neon-blue mb-2 flex items-center gap-2">
              <span>📋</span> OBJECTIVES
            </h2>
            <ul className="space-y-1 text-xs">
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
          <div className="bg-green-900 bg-opacity-30 rounded-lg p-3 border border-neon-green">
            <h2 className="text-sm font-bold text-neon-green mb-2 flex items-center gap-2">
              <span>🚀</span> LOADOUT
            </h2>
            <div className="space-y-1 text-xs text-gray-300">
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

        {/* Wave Info & Star Requirements Combined */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Wave Info */}
          <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 border border-purple-400">
            <h2 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
              <span>🌊</span> THREATS
            </h2>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-white">
                  {level.waves.length}
                </div>
                <div className="text-xs text-gray-400">Waves</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {level.waves.reduce(
                    (sum, wave) => sum + wave.asteroids.length,
                    0
                  )}
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">
                  {Math.max(
                    ...level.waves.flatMap((w) =>
                      w.asteroids.map((a) => a.diameter)
                    )
                  )}
                  m
                </div>
                <div className="text-xs text-gray-400">Max Size</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-400">
                  {Math.max(
                    ...level.waves.flatMap((w) =>
                      w.asteroids.map((a) => a.velocity)
                    )
                  )}
                </div>
                <div className="text-xs text-gray-400">Max Speed</div>
              </div>
            </div>
          </div>

          {/* Star Requirements */}
          <div className="bg-yellow-900 bg-opacity-20 rounded-lg p-3 border border-yellow-400">
            <h2 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <span>⭐</span> STAR GOALS
            </h2>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div>
                <div className="text-lg mb-0.5">⭐</div>
                <div className="text-gray-400">Complete all</div>
              </div>
              <div>
                <div className="text-lg mb-0.5">⭐⭐</div>
                <div className="text-gray-400">≤2 misses</div>
              </div>
              <div>
                <div className="text-lg mb-0.5">⭐⭐⭐</div>
                <div className="text-gray-400">Perfect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Restrictions - Only show if exists */}
        {level.restrictions && Object.keys(level.restrictions).length > 0 && (
          <div className="bg-red-900 bg-opacity-30 rounded-lg p-2 border border-red-400 mb-3">
            <h2 className="text-xs font-bold text-red-400 mb-1 flex items-center gap-2">
              <span>⚠️</span> RESTRICTIONS
            </h2>
            <ul className="space-y-0.5 text-xs text-gray-300">
              {level.restrictions.maxFundsSpent && (
                <li>
                  • Max spending: ${level.restrictions.maxFundsSpent / 1000}K
                </li>
              )}
              {level.restrictions.maxSatellites && (
                <li>• Max satellites: {level.restrictions.maxSatellites}</li>
              )}
              {level.restrictions.maxProbes && (
                <li>• Max probes: {level.restrictions.maxProbes}</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors text-sm"
          >
            ← BACK
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLaunch}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-blue to-neon-green hover:from-blue-500 hover:to-green-500 text-white font-bold rounded border-2 border-neon-green transition-all"
          >
            {isReplay ? "🔄 REPLAY MISSION" : "🚀 LAUNCH MISSION"}
          </motion.button>
        </div>

        {/* Tip */}
        <div className="mt-2 text-center text-gray-500 text-xs">
          {isReplay
            ? "Show them what you've learned, Commander."
            : "Good luck, Commander. Earth is counting on you."}
        </div>
      </motion.div>
    </div>
  );
};

export default PreLevelBriefing;
