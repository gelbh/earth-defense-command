import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLevel } from "../context/LevelContext";

const LevelCard = ({ level, stars, bestTime, locked, onClick }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 border-green-400";
      case "medium":
        return "text-yellow-400 border-yellow-400";
      case "hard":
        return "text-orange-400 border-orange-400";
      case "expert":
        return "text-red-400 border-red-400";
      default:
        return "text-gray-400 border-gray-400";
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

  return (
    <motion.button
      whileHover={!locked ? { scale: 1.05, y: -5 } : {}}
      whileTap={!locked ? { scale: 0.95 } : {}}
      onClick={!locked ? onClick : undefined}
      disabled={locked}
      className={`relative w-full p-4 rounded-lg border-2 font-mono transition-all ${
        locked
          ? "bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed"
          : "bg-space-blue border-neon-blue hover:bg-blue-900 hover:border-neon-green cursor-pointer"
      }`}
    >
      {/* Level Number Badge */}
      <div className="absolute top-2 left-2 w-12 h-12 bg-black bg-opacity-70 rounded-full flex items-center justify-center border-2 border-neon-blue">
        <span className="text-neon-blue font-bold text-xl">{level.id}</span>
      </div>

      {/* Type Icon */}
      <div className="absolute top-2 right-2 text-2xl">
        {locked ? "🔒" : getTypeIcon(level.type)}
      </div>

      <div className="mt-12">
        {/* Level Name */}
        <h3 className="text-lg font-bold text-white mb-2 truncate">
          {level.name}
        </h3>

        {/* Difficulty */}
        <div
          className={`inline-block px-2 py-1 rounded text-xs font-bold border mb-2 ${getDifficultyColor(
            level.difficulty
          )}`}
        >
          {level.difficulty.toUpperCase()}
        </div>

        {/* Stars - Always reserve space */}
        <div className="flex justify-center gap-1 mb-2">
          {!locked ? (
            [1, 2, 3].map((star) => (
              <span
                key={star}
                className={`text-2xl ${
                  star <= (stars || 0) ? "" : "opacity-20"
                }`}
              >
                ⭐
              </span>
            ))
          ) : (
            // Reserve space for locked missions
            <span className="text-2xl text-transparent">⭐⭐⭐</span>
          )}
        </div>

        {/* Best Time / Locked Message - Always same height */}
        <div className="text-sm h-5">
          {!locked ? (
            <span className="text-gray-400">
              {bestTime ? `Best: ${formatTime(bestTime)}` : "\u00A0"}
            </span>
          ) : (
            <span className="text-gray-500">🔒 Complete prev. level</span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

const LevelSelect = ({ onSelectLevel, onBack }) => {
  const {
    levels,
    progression,
    loading,
    isLevelUnlocked,
    getLevelStars,
    getLevelBestTime,
    resetProgression,
  } = useLevel();

  const handleClearProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all progress? This will reset all stars and unlocked levels."
      )
    ) {
      resetProgression();
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono">Loading Levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-space-blue p-8 overflow-y-auto">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-neon-blue font-mono mb-2">
              MISSION SELECT
            </h1>
            <p className="text-gray-400 font-mono">
              Total Stars: ⭐ {progression.totalStars} | Gems: 💎{" "}
              {progression.gems}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearProgress}
              className="px-4 py-3 bg-red-900 hover:bg-red-800 text-white font-mono rounded border-2 border-red-600 transition-colors text-sm"
              title="Reset all progress"
            >
              🔄 CLEAR PROGRESS
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-mono rounded border-2 border-gray-600 transition-colors"
            >
              ← BACK TO MENU
            </button>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8 p-4 bg-black bg-opacity-50 rounded-lg border border-neon-blue"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-neon-blue font-mono text-sm">
              CAMPAIGN PROGRESS
            </span>
            <span className="text-white font-mono text-sm">
              {progression.unlockedLevels.length}/{levels.length} Levels
              Unlocked
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-neon-blue to-neon-green h-3 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (progression.unlockedLevels.length / levels.length) * 100
                }%`,
              }}
            />
          </div>
        </motion.div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LevelCard
                level={level}
                stars={getLevelStars(level.id)}
                bestTime={getLevelBestTime(level.id)}
                locked={!isLevelUnlocked(level.id)}
                onClick={() => onSelectLevel(level.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-black bg-opacity-30 rounded-lg border border-gray-700"
        >
          <p className="text-center text-gray-400 font-mono text-sm">
            💡 TIP: Replay levels to earn more stars and unlock special rewards!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LevelSelect;
