import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const ActionButtons = ({ gameState, onUpgradeClick }) => {
  const { processAction, advanceDay, resetGame } = useGame();
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

  const handleAdvanceDay = async () => {
    setLoading(true);
    try {
      await advanceDay();
    } catch (error) {
      console.error('Failed to advance day:', error);
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
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('deploy_satellite')}
          disabled={loading || gameState.satellites <= 0}
          className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
            gameState.satellites <= 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-blue hover:bg-blue-500 text-white glow-blue'
          }`}
        >
          <div className="text-lg mb-1">🛰️</div>
          <div>Deploy</div>
          <div>Satellite</div>
          <div className="text-xs opacity-75">
            ({gameState.satellites} left)
          </div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('launch_probe')}
          disabled={loading || gameState.probes <= 0 || gameState.funds < 100000}
          className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
            gameState.probes <= 0 || gameState.funds < 100000
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-green hover:bg-green-500 text-black glow-green'
          }`}
        >
          <div className="text-lg mb-1">🚀</div>
          <div>Launch</div>
          <div>Probe</div>
          <div className="text-xs opacity-75">
            ({gameState.probes} left)
          </div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => handleAction('research')}
          disabled={loading || gameState.funds < 50000}
          className={`p-3 rounded-lg font-mono text-sm font-bold transition-all ${
            gameState.funds < 50000
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-neon-yellow hover:bg-yellow-500 text-black glow-yellow'
          }`}
        >
          <div className="text-lg mb-1">🔬</div>
          <div>Research</div>
          <div>Team</div>
          <div className="text-xs opacity-75">
            ($50K)
          </div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onUpgradeClick}
          className="p-3 rounded-lg font-mono text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white glow-blue transition-all"
        >
          <div className="text-lg mb-1">⚡</div>
          <div>Upgrade</div>
          <div>Lab</div>
        </motion.button>
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleAdvanceDay}
          disabled={loading}
          className="w-full p-3 rounded-lg font-mono text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white glow-blue transition-all disabled:opacity-50"
        >
          <div className="text-lg mb-1">⏭️</div>
          <div>Advance Day</div>
          <div className="text-xs opacity-75">
            (Restore Resources)
          </div>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleResetGame}
          disabled={loading}
          className="w-full p-2 rounded-lg font-mono text-xs font-bold bg-neon-red hover:bg-red-500 text-white glow-red transition-all disabled:opacity-50"
        >
          🔄 Reset Game
        </motion.button>
      </div>

      {/* Last Action Result */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-2 rounded text-xs font-mono ${
            lastAction.success
              ? 'bg-green-900/50 text-neon-green border border-neon-green'
              : 'bg-red-900/50 text-neon-red border border-neon-red'
          }`}
        >
          {lastAction.message}
          {lastAction.scoreChange !== 0 && (
            <div className="mt-1">
              Score: {lastAction.scoreChange > 0 ? '+' : ''}{lastAction.scoreChange}
            </div>
          )}
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-neon-blue"></div>
          <span className="ml-2 text-xs text-gray-400 font-mono">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
