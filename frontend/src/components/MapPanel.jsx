import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Earth3D from './Earth3D';
import Toast from './Toast';

const MapPanel = ({ gameState, events, threats }) => {
  const { processAction } = useGame();
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [deflecting, setDeflecting] = useState(false);
  const [toast, setToast] = useState(null);

  const getThreatColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'text-neon-red';
      case 'moderate': return 'text-orange-500';
      case 'low': return 'text-neon-yellow';
      default: return 'text-neon-green';
    }
  };

  const getThreatGlow = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return 'glow-red';
      case 'moderate': return 'glow-yellow';
      case 'low': return 'glow-yellow';
      default: return 'glow-green';
    }
  };

  const handleUpgrade = async (assetId, assetType) => {
    try {
      const actionType = assetType === 'satellite' ? 'upgrade_satellite' : 'upgrade_probe';
      const result = await processAction({
        type: actionType,
        targetId: assetId
      });
      
      if (result && result.success) {
        setToast({
          type: 'success',
          message: {
            title: '✅ Upgrade Complete!',
            description: result.message
          }
        });
      } else {
        setToast({
          type: 'error',
          message: {
            title: '❌ Upgrade Failed',
            description: result.message || 'Unable to upgrade'
          }
        });
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      setToast({
        type: 'error',
        message: {
          title: '❌ Upgrade Error',
          description: 'Failed to process upgrade request'
        }
      });
    }
  };

  const handleDeflect = async (threat) => {
    setDeflecting(true);
    try {
      const result = await processAction({
        type: 'deflect_asteroid',
        targetId: threat.id,
        resource: 'probe'
      });
      
      if (result && result.success) {
        // Success notification
        setToast({
          type: 'success',
          message: {
            title: '🎯 Asteroid Deflected!',
            description: `${threat.title} has been successfully redirected. Earth is safe!`
          }
        });
        setSelectedThreat(null);
      } else {
        // Failure notification
        setToast({
          type: 'error',
          message: {
            title: '❌ Deflection Failed',
            description: result?.message || 'Insufficient resources or asteroid already deflected.'
          }
        });
      }
    } catch (error) {
      console.error('Failed to deflect asteroid:', error);
      setToast({
        type: 'error',
        message: {
          title: '❌ Mission Error',
          description: 'Critical failure in deflection system. Try again.'
        }
      });
    } finally {
      setDeflecting(false);
    }
  };

  return (
    <div className="bg-dark-gray rounded-xl border border-neon-blue/30 p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-neon-blue font-mono">
          🌍 EARTH DEFENSE MAP
        </h2>
        <div className="text-xs text-gray-400 font-mono">
          {threats.length} Active Threats
        </div>
      </div>

      {/* 3D Earth Visualization */}
      <div className="flex-1 relative rounded-lg overflow-hidden mb-2 min-h-[200px]">
        <Earth3D 
          threats={threats} 
          gameState={gameState}
          onDeflectAsteroid={handleDeflect}
          onUpgrade={handleUpgrade}
        />

        {/* Earth Status Overlay */}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-neon-blue/30">
          <div className="text-xs font-mono space-y-0.5">
            <div className="text-neon-green">STATUS: OPERATIONAL</div>
            <div className="text-gray-300">DAMAGE: {gameState.earthDamage}%</div>
            <div className="text-neon-blue">REPUTATION: {gameState.reputation}</div>
          </div>
        </div>

        {/* Controls hint */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-400 font-mono">
          🖱️ Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Threat List */}
      <div className="bg-medium-gray rounded-lg p-2">
        <h3 className="text-sm font-bold text-white mb-2 font-mono">ACTIVE THREATS</h3>
        {threats.length === 0 ? (
          <p className="text-gray-400 font-mono text-center py-2 text-xs">
            No active threats detected
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
            {threats.slice(0, 6).map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-1.5 rounded border-l-2 cursor-pointer hover:bg-opacity-40 transition-all ${
                  threat.severity === 'critical' ? 'border-neon-red bg-red-900/20 hover:bg-red-900/30' :
                  threat.severity === 'moderate' ? 'border-orange-500 bg-orange-900/20 hover:bg-orange-900/30' :
                  threat.severity === 'low' ? 'border-neon-yellow bg-yellow-900/20 hover:bg-yellow-900/30' :
                  'border-neon-green bg-green-900/20 hover:bg-green-900/30'
                }`}
                onClick={() => setSelectedThreat(threat)}
                title="Click to view details and deflect"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-white truncate flex-1">{threat.title}</p>
                    <span className={`text-xs font-mono px-1 py-0.5 rounded flex-shrink-0 ml-1 ${
                      threat.severity === 'critical' ? 'bg-neon-red text-black' :
                      threat.severity === 'moderate' ? 'bg-orange-500 text-black' :
                      threat.severity === 'low' ? 'bg-neon-yellow text-black' :
                      'bg-neon-green text-black'
                    }`}>
                      {threat.severity[0].toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{threat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedThreat(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-gray border border-neon-blue rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-neon-blue mb-4 font-mono">
              {selectedThreat.title}
            </h3>
            <p className="text-gray-300 mb-4">{selectedThreat.description}</p>
            
            {selectedThreat.data && (
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Diameter:</span>
                  <span className="text-white">{Math.round(selectedThreat.data.diameter)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Velocity:</span>
                  <span className="text-white">{Math.round(selectedThreat.data.velocity)} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Miss Distance:</span>
                  <span className="text-white">{Math.round(selectedThreat.data.missDistance / 1000)}k km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hazardous:</span>
                  <span className={selectedThreat.data.isHazardous ? 'text-neon-red' : 'text-neon-green'}>
                    {selectedThreat.data.isHazardous ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleDeflect(selectedThreat)}
                disabled={deflecting || (gameState.availableProbes || 0) <= 0}
                className={`flex-1 font-bold py-2 px-4 rounded transition-colors ${
                  deflecting || (gameState.availableProbes || 0) <= 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-neon-green hover:bg-green-500 text-black'
                }`}
              >
                {deflecting ? 'Deflecting...' : `🚀 Deflect (1 Probe)`}
              </button>
              <button
                onClick={() => setSelectedThreat(null)}
                className="flex-1 bg-neon-blue hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default MapPanel;
