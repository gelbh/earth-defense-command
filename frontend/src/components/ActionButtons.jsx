import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useLevel } from "../context/LevelContext";

const ActionButtons = ({ gameState, onUpgradeClick, isLevelMode = false }) => {
  const { processAction: processEndlessAction } = useGame();
  const { processLevelAction } = useLevel();

  // Use the appropriate action processor based on mode
  const processAction = isLevelMode ? processLevelAction : processEndlessAction;
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const handleAction = async (actionType, targetId = null) => {
    setLoading(true);
    try {
      const action = {
        type: actionType,
        targetId: targetId,
        resource: actionType,
      };

      const result = await processAction(action);
      setLastAction(result);

      // Auto-fade after 3 seconds
      setTimeout(() => setLastAction(null), 3000);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 0 20px rgba(0, 212, 255, 0.5)" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="space-y-2 flex-shrink-0">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Deploy Satellite */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction("deploy_satellite")}
          disabled={loading || gameState.funds < 150000 || gameState.power < 10}
          className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
            gameState.funds < 150000 || gameState.power < 10
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-neon-blue hover:bg-blue-500 text-white glow-blue"
          }`}
        >
          <div className="text-xl mb-1">🛰️</div>
          <div className="text-xs leading-tight">Deploy Satellite</div>
          <div className="text-xs text-gray-300 mt-1">$150K</div>
        </motion.button>

        {/* Launch Probe */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction("launch_probe")}
          disabled={loading || gameState.funds < 200000}
          className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
            gameState.funds < 200000
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-neon-green hover:bg-green-500 text-black glow-green"
          }`}
        >
          <div className="text-xl mb-1">🚀</div>
          <div className="text-xs leading-tight">Launch Probe</div>
          <div className="text-xs text-gray-700 mt-1">$200K</div>
        </motion.button>

        {/* Upgrades Button - Full Width */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onUpgradeClick}
          className="col-span-2 p-3 rounded-lg font-mono text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white glow-blue transition-all"
        >
          <div className="text-xl mb-1">⚡</div>
          <div className="text-xs leading-tight">Upgrades</div>
        </motion.button>
      </div>

      {/* Last Action Result */}
      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`p-1.5 rounded text-xs font-mono ${
              lastAction.success
                ? "bg-green-900/50 text-neon-green border border-neon-green"
                : "bg-red-900/50 text-neon-red border border-neon-red"
            }`}
          >
            <div className="leading-tight">{lastAction.message}</div>
            {lastAction.scoreChange !== 0 && (
              <div className="text-xs opacity-75">
                {lastAction.scoreChange > 0 ? "+" : ""}
                {lastAction.scoreChange}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-1">
          <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-neon-blue"></div>
          <span className="ml-1.5 text-xs text-gray-400 font-mono">
            Processing...
          </span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
