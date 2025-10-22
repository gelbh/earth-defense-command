import React from 'react';
import { motion } from 'framer-motion';

const TutorialModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-gray border-2 border-neon-blue rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-neon-blue mb-4 font-mono text-center">
          🌍 Welcome, Commander!
        </h2>
        
        <div className="space-y-4 text-white">
          <p className="text-gray-300 text-center mb-6">
            You are Earth's last line of defense. Your mission: <span className="text-neon-blue font-bold">protect humanity from asteroid threats using real NASA data.</span>
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Game Objective */}
            <div className="bg-medium-gray rounded-lg p-4 border border-neon-blue/30">
              <h3 className="text-xl font-bold text-neon-blue mb-3 font-mono">🎯 Objective</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Keep Earth's damage below 100%</li>
                <li>• Survive as many days as possible</li>
                <li>• Maximize your score</li>
                <li>• Build your reputation</li>
              </ul>
            </div>

            {/* Resources */}
            <div className="bg-medium-gray rounded-lg p-4 border border-orange-500/30">
              <h3 className="text-xl font-bold text-orange-500 mb-3 font-mono">💰 Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <span className="text-neon-green font-bold">Funds:</span> Money for operations</li>
                <li>• <span className="text-neon-blue font-bold">Power:</span> Energy for systems</li>
                <li>• <span className="text-neon-blue font-bold">Satellites:</span> Track threats</li>
                <li>• <span className="text-neon-green font-bold">Probes:</span> Deflect asteroids</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-medium-gray rounded-lg p-4 border border-neon-green/30">
            <h3 className="text-xl font-bold text-neon-green mb-3 font-mono">🎮 Actions</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-bold text-neon-blue mb-1">🛰️ Deploy Satellite</p>
                <p className="text-gray-300">Monitor space sectors. Uses 1 satellite and power. Helps detect threats early.</p>
              </div>
              <div>
                <p className="font-bold text-neon-green mb-1">🚀 Launch Probe</p>
                <p className="text-gray-300">Position probes for deflection. Costs $100K. Essential for defending Earth.</p>
              </div>
              <div>
                <p className="font-bold text-neon-yellow mb-1">🔬 Research</p>
                <p className="text-gray-300">Improve detection and defense. Costs $50K. Increases success rates.</p>
              </div>
              <div>
                <p className="font-bold text-purple-500 mb-1">⚡ Upgrades</p>
                <p className="text-gray-300">Purchase permanent improvements. Unlock powerful abilities.</p>
              </div>
            </div>
          </div>

          {/* Threats */}
          <div className="bg-medium-gray rounded-lg p-4 border border-neon-red/30">
            <h3 className="text-xl font-bold text-neon-red mb-3 font-mono">⚠️ Handling Threats</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="mb-3">Asteroid threats appear in the <span className="text-neon-blue font-bold">Active Threats</span> panel. They're color-coded by danger level:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-neon-red rounded-full mr-2"></span>
                  <span className="text-neon-red font-bold">Critical:</span> <span className="ml-2">15% damage if ignored</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  <span className="text-orange-500 font-bold">Moderate:</span> <span className="ml-2">8% damage if ignored</span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-neon-yellow rounded-full mr-2"></span>
                  <span className="text-neon-yellow font-bold">Low:</span> <span className="ml-2">Safe to monitor</span>
                </div>
              </div>
              <p className="mt-3 bg-neon-red/20 border border-neon-red p-2 rounded">
                <span className="font-bold">⚠️ Important:</span> Click any threat to view details and <span className="text-neon-green font-bold">DEFLECT</span> it with a probe (costs $200K + 1 probe). Deflection can fail based on asteroid size/speed!
              </p>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="bg-medium-gray rounded-lg p-4 border border-neon-blue/30">
            <h3 className="text-xl font-bold text-neon-blue mb-3 font-mono">💡 Strategy Tips</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <span className="text-neon-red font-bold">Prioritize critical threats</span> - they cause the most damage</li>
              <li>• <span className="text-neon-green font-bold">Deflect before advancing day</span> - unhandled threats cause damage when day advances</li>
              <li>• <span className="text-neon-yellow font-bold">Manage your funds</span> - you gain $50K per day + reputation bonus</li>
              <li>• <span className="text-neon-blue font-bold">Save probes for critical threats</span> - they restore slowly (1 per day)</li>
              <li>• <span className="text-purple-500 font-bold">Buy upgrades early</span> - they help throughout the game</li>
            </ul>
          </div>

          {/* Day Cycle */}
          <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
            <h3 className="text-xl font-bold text-orange-500 mb-3 font-mono">⏭️ Day Cycle</h3>
            <p className="text-sm text-gray-300 mb-2">When you click <span className="text-orange-500 font-bold">"Advance Day"</span>:</p>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• Unhandled threats damage Earth</li>
              <li>• Resources restore (+1 satellite, +1 probe, +20% power)</li>
              <li>• You gain funds (+$50K + reputation bonus)</li>
              <li>• New threats appear</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-neon-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          🚀 Start Mission
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TutorialModal;

