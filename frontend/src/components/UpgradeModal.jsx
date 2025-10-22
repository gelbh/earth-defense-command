import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

const UpgradeModal = ({ gameState, onClose }) => {
  const { purchaseUpgrade } = useGame();
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  const upgrades = [
    {
      id: 'aiTracking',
      name: 'AI Auto-Tracking',
      description: 'Automatically flags nearby asteroids and improves detection accuracy',
      cost: 500000,
      icon: '🤖',
      benefits: ['+1 Satellite', '+10% Detection Accuracy']
    },
    {
      id: 'improvedRadar',
      name: 'Improved Radar',
      description: 'Increases detection radius and power efficiency',
      cost: 300000,
      icon: '📡',
      benefits: ['+20% Power', '+25% Detection Range']
    },
    {
      id: 'quantumDrive',
      name: 'Quantum Drive',
      description: 'Advanced propulsion system for faster probe deployment',
      cost: 400000,
      icon: '⚡',
      benefits: ['+1 Probe', 'Faster Response Time']
    },
    {
      id: 'publicSupport',
      name: 'Public Support Campaign',
      description: 'Gain public backing and additional funding',
      cost: 200000,
      icon: '👥',
      benefits: ['+$100K Bonus', '+5 Reputation']
    }
  ];

  const handlePurchase = async (upgradeId) => {
    setLoading(true);
    setPurchaseResult(null);
    
    try {
      const result = await purchaseUpgrade(upgradeId);
      setPurchaseResult(result);
    } catch (error) {
      setPurchaseResult({ success: false, message: 'Purchase failed' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-dark-gray border border-neon-blue rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neon-blue font-mono">
              ⚡ UPGRADE LAB
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgrades.map((upgrade) => {
              const isOwned = gameState.upgrades[upgrade.id];
              const canAfford = gameState.funds >= upgrade.cost;
              const isDisabled = isOwned || !canAfford || loading;

              return (
                <motion.div
                  key={upgrade.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isOwned
                      ? 'border-neon-green bg-green-900/20'
                      : canAfford
                      ? 'border-neon-blue bg-blue-900/20 hover:border-blue-400'
                      : 'border-gray-600 bg-gray-900/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{upgrade.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {upgrade.name}
                        {isOwned && (
                          <span className="ml-2 text-xs bg-neon-green text-black px-2 py-1 rounded font-mono">
                            OWNED
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {upgrade.description}
                      </p>
                      
                      <div className="space-y-1 mb-4">
                        {upgrade.benefits.map((benefit, index) => (
                          <div key={index} className="text-xs text-neon-green font-mono">
                            • {benefit}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-neon-yellow font-mono">
                          {formatCurrency(upgrade.cost)}
                        </div>
                        
                        <button
                          onClick={() => handlePurchase(upgrade.id)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded font-mono text-sm font-bold transition-all ${
                            isOwned
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : canAfford
                              ? 'bg-neon-blue hover:bg-blue-500 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isOwned ? 'OWNED' : canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Purchase Result */}
          {purchaseResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded text-sm font-mono ${
                purchaseResult.success
                  ? 'bg-green-900/50 text-neon-green border border-neon-green'
                  : 'bg-red-900/50 text-neon-red border border-neon-red'
              }`}
            >
              {purchaseResult.message}
            </motion.div>
          )}

          {/* Current Funds */}
          <div className="mt-6 p-3 bg-medium-gray rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono">Available Funds:</span>
              <span className="text-neon-green font-mono text-lg font-bold">
                {formatCurrency(gameState.funds)}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal;
