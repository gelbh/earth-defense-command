import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LevelResults = ({ results, onNextLevel, onRetry, onMenu }) => {
  const [showStars, setShowStars] = useState(false);
  const [starsAnimated, setStarsAnimated] = useState(0);

  // Animate stars appearing one by one
  useEffect(() => {
    setShowStars(true);
    const interval = setInterval(() => {
      setStarsAnimated((prev) => {
        if (prev >= results.stars) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [results.stars]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStarColor = (index) => {
    if (index <= starsAnimated) {
      return "text-yellow-400 scale-100";
    }
    return "text-gray-600 scale-75";
  };

  return (
    <div className="fixed inset-0 bg-space-blue flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl w-full bg-black bg-opacity-90 rounded-lg border-2 border-neon-green p-4 md:p-6 font-mono"
      >
        {/* Victory Banner */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-neon-green mb-1">
            ✅ MISSION COMPLETE!
          </h1>
          <p className="text-lg text-gray-300">{results.levelName}</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center gap-3 mb-4">
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: star <= starsAnimated ? 1 : 0.7,
                rotate: 0,
              }}
              transition={{ delay: star * 0.3, type: "spring" }}
              className={`text-5xl transition-all duration-300 ${getStarColor(
                star
              )}`}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Objectives */}
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3 border border-neon-blue">
            <h2 className="text-sm font-bold text-neon-blue mb-2 flex items-center gap-2">
              <span>📋</span> OBJECTIVES
            </h2>
            <div className="space-y-1 text-xs">
              {results.objectives.map((objective, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    objective.completed ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <span>{objective.completed ? "✅" : "❌"}</span>
                  <span className="flex-1">{objective.description}</span>
                  {objective.target && (
                    <span className="text-gray-400 text-xs">
                      {objective.current}/{objective.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 border border-purple-400">
            <h2 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
              <span>📊</span> PERFORMANCE
            </h2>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="text-cyan-400">
                  {formatTime(results.performance.timeElapsed)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Destroyed:</span>
                <span className="text-green-400">
                  {results.performance.asteroidsDestroyed}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Missed:</span>
                <span className="text-red-400">
                  {results.performance.asteroidsMissed}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="text-yellow-400">
                  {(results.performance.accuracy * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Funds Spent:</span>
                <span className="text-orange-400">
                  ${(results.performance.fundsSpent / 1000).toFixed(0)}K
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Status */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-green-900 bg-opacity-30 rounded-lg p-2 border border-green-400 text-center">
            <div className="text-xl font-bold text-green-400">
              {results.statistics.finalEarthHealth}%
            </div>
            <div className="text-xs text-gray-400">Earth Health</div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-2 border border-blue-400 text-center">
            <div className="text-xl font-bold text-blue-400">
              {results.rewards.score}
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-2 border border-yellow-400 text-center">
            <div className="text-xl font-bold text-yellow-400">
              {results.rewards.gems}
            </div>
            <div className="text-xs text-gray-400">Gems Earned</div>
          </div>
        </div>

        {/* Rewards */}
        {results.rewards.unlocks && results.rewards.unlocks.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-900 to-orange-900 bg-opacity-30 rounded-lg p-2 border border-yellow-400 mb-3">
            <h2 className="text-xs font-bold text-yellow-400 mb-1 flex items-center gap-2">
              <span>🎁</span> REWARDS
            </h2>
            <div className="flex flex-wrap gap-1">
              {results.rewards.unlocks.map((unlock, index) => (
                <div
                  key={index}
                  className="px-2 py-0.5 bg-yellow-600 bg-opacity-50 rounded border border-yellow-400 text-white text-xs"
                >
                  {unlock.startsWith("level_")
                    ? `Level ${unlock.split("_")[1]}`
                    : unlock.replace("_", " ").toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors text-sm"
          >
            🔄 RETRY
          </button>
          <button
            onClick={onMenu}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors text-sm"
          >
            📋 LEVEL SELECT
          </button>
          {onNextLevel && (
            <button
              onClick={onNextLevel}
              className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-green hover:from-blue-500 hover:to-green-500 text-white font-bold rounded border-2 border-neon-green transition-all text-sm"
            >
              ➡️ NEXT LEVEL
            </button>
          )}
        </div>

        {/* Encouragement Message */}
        <div className="text-center text-sm">
          {results.stars === 3 && (
            <div className="text-yellow-400 font-bold">
              🏆 PERFECT! Outstanding performance!
            </div>
          )}
          {results.stars === 2 && (
            <div className="text-green-400">
              ✨ Excellent work! Can you get 3 stars?
            </div>
          )}
          {results.stars === 1 && (
            <div className="text-blue-400">
              💪 Mission complete! Try for more stars!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LevelResults;
