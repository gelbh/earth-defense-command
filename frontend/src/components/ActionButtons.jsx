import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const ActionButtons = ({ gameState, onUpgradeClick }) => {
  const { processAction, resetGame } = useGame();
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const handleAction = async (actionType, targetId = null) => {
    setLoading(true);
    try {
      const action = {
        type: actionType,
        targetId: targetId,
        resource: actionType
      };
      
      const result = await processAction(action);
      setLastAction(result);
      
      // Show result message
      if (result.message) {
        // You could add a toast notification here
        console.log(result.message);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetGame = async () => {
    if (window.confirm('Are you sure you want to reset the game? This will lose all progress.')) {
      setLoading(true);
      try {
        await resetGame();
      } catch (error) {
        console.error('Failed to reset game:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 0 20px rgba(0, 212, 255, 0.5)" },
    tap: { scale: 0.95 }
  };

  return (
    <div className="space-y-1.5 flex-shrink-0">
      {/* All Buttons in Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Game Actions */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('deploy_satellite')}
          disabled={loading || gameState.funds < 150000 || gameState.power < 10}
          className={`p-1.5 rounded font-mono text-xs font-bold transition-all ${
            gameState.funds < 150000 || gameState.power < 10
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-blue hover:bg-blue-500 text-white glow-blue'
          }`}
        >
          <div className="text-sm">🛰️</div>
          <div className="text-xs leading-tight">Deploy Sat</div>
          <div className="text-xs text-gray-300">$150K</div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('launch_probe')}
          disabled={loading || gameState.funds < 200000}
          className={`p-1.5 rounded font-mono text-xs font-bold transition-all ${
            gameState.funds < 200000
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-green hover:bg-green-500 text-black glow-green'
          }`}
        >
          <div className="text-sm">🚀</div>
          <div className="text-xs leading-tight">Launch Probe</div>
          <div className="text-xs text-gray-700">$200K</div>
        </motion.button>

        {/* Info/Status Display */}
        <div className="p-1.5 rounded font-mono text-xs font-bold bg-gray-700 text-gray-300 border-l-2 border-gray-500 flex flex-col items-center justify-center">
          <div className="text-sm">📊</div>
          <div className="text-xs leading-tight">Day {gameState.day}</div>
          <div className="text-xs text-gray-400">Level</div>
        </div>

        {/* Second Row */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('research')}
          disabled={loading || gameState.funds < 50000}
          className={`p-1.5 rounded font-mono text-xs font-bold transition-all ${
            gameState.funds < 50000
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-yellow hover:bg-yellow-500 text-black glow-yellow'
          }`}
        >
          <div className="text-sm">🔬</div>
          <div className="text-xs leading-tight">Research</div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onUpgradeClick}
          className="p-1.5 rounded font-mono text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white glow-blue transition-all"
        >
          <div className="text-sm">⚡</div>
          <div className="text-xs leading-tight">Upgrades</div>
        </motion.button>

        {/* Vertical Separator + Reset */}
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleResetGame}
          disabled={loading}
          className="p-1.5 rounded font-mono text-xs font-bold bg-neon-red hover:bg-red-500 text-white transition-all disabled:opacity-50 border-l-2 border-red-400"
        >
          <div className="text-sm">🔄</div>
          <div className="text-xs leading-tight">Reset</div>
        </motion.button>
      </div>

      {/* Last Action Result */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-1.5 rounded text-xs font-mono ${
            lastAction.success
              ? 'bg-green-900/50 text-neon-green border border-neon-green'
              : 'bg-red-900/50 text-neon-red border border-neon-red'
          }`}
        >
          <div className="leading-tight">{lastAction.message}</div>
          {lastAction.scoreChange !== 0 && (
            <div className="text-xs opacity-75">
              {lastAction.scoreChange > 0 ? '+' : ''}{lastAction.scoreChange}
            </div>
          )}
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-1">
          <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-neon-blue"></div>
          <span className="ml-1.5 text-xs text-gray-400 font-mono">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
