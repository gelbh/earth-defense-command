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
    <div className="min-h-screen bg-space-blue flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-4xl w-full bg-black bg-opacity-90 rounded-lg border-2 border-neon-green p-8 font-mono"
      >
        {/* Victory Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-bold text-neon-green mb-2">
            ✅ MISSION COMPLETE!
          </h1>
          <p className="text-2xl text-gray-300">{results.levelName}</p>
        </motion.div>

        {/* Star Rating */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex justify-center gap-4 mb-8"
        >
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: star <= starsAnimated ? 1.2 : 0.8,
                rotate: 0,
              }}
              transition={{ delay: star * 0.3, type: "spring" }}
              className={`text-7xl transition-all duration-300 ${getStarColor(
                star
              )}`}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Objectives */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-neon-blue"
          >
            <h2 className="text-xl font-bold text-neon-blue mb-3 flex items-center gap-2">
              <span>📋</span> OBJECTIVES
            </h2>
            <div className="space-y-2">
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
                    <span className="text-gray-400 text-sm">
                      {objective.current}/{objective.target}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-purple-900 bg-opacity-30 rounded-lg p-4 border border-purple-400"
          >
            <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>📊</span> PERFORMANCE
            </h2>
            <div className="space-y-2 text-gray-300">
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
          </motion.div>
        </div>

        {/* Final Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 border border-green-400 text-center">
            <div className="text-3xl font-bold text-green-400">
              {results.statistics.finalEarthHealth}%
            </div>
            <div className="text-sm text-gray-400">Earth Health</div>
          </div>
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-400 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {results.rewards.score}
            </div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 rounded-lg p-4 border border-yellow-400 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {results.rewards.gems}
            </div>
            <div className="text-sm text-gray-400">Gems Earned</div>
          </div>
        </motion.div>

        {/* Rewards */}
        {results.rewards.unlocks && results.rewards.unlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-yellow-900 to-orange-900 bg-opacity-30 rounded-lg p-4 border-2 border-yellow-400 mb-6"
          >
            <h2 className="text-xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <span>🎁</span> REWARDS UNLOCKED!
            </h2>
            <div className="flex flex-wrap gap-2">
              {results.rewards.unlocks.map((unlock, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-yellow-600 bg-opacity-50 rounded border border-yellow-400 text-white text-sm"
                >
                  {unlock.startsWith("level_")
                    ? `Level ${unlock.split("_")[1]}`
                    : unlock.replace("_", " ").toUpperCase()}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors"
          >
            🔄 RETRY
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border-2 border-gray-600 transition-colors"
          >
            📋 LEVEL SELECT
          </button>
          {onNextLevel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNextLevel}
              className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-green hover:from-blue-500 hover:to-green-500 text-white font-bold rounded border-2 border-neon-green transition-all"
            >
              ➡️ NEXT LEVEL
            </motion.button>
          )}
        </motion.div>

        {/* Encouragement Message */}
        <AnimatePresence>
          {results.stars === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-center text-yellow-400 font-bold text-lg"
            >
              🏆 PERFECT! Outstanding performance, Commander!
            </motion.div>
          )}
          {results.stars === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-center text-green-400 text-lg"
            >
              ✨ Excellent work! Can you get 3 stars?
            </motion.div>
          )}
          {results.stars === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-center text-blue-400 text-lg"
            >
              💪 Mission complete! Try for more stars next time!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LevelResults;
