import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const MapPanel = ({ gameState, events, threats }) => {
  const { getLatestEarthImage } = useGame();
  const [earthImage, setEarthImage] = useState(null);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Only load image once
    if (!imageLoaded) {
      const loadEarthImage = async () => {
        const image = await getLatestEarthImage();
        setEarthImage(image);
        setImageLoaded(true);
      };
      loadEarthImage();
    }
  }, [getLatestEarthImage, imageLoaded]);

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

      {/* Earth Visualization */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-900 to-green-900 rounded-lg overflow-hidden mb-2 min-h-[200px]">
        {earthImage ? (
          <div className="relative h-full">
            <img
              src={earthImage.imageUrl}
              alt="Earth from space"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🌍</div>
              <p className="text-neon-blue font-mono">Loading Earth...</p>
            </div>
          </div>
        )}

        {/* Threat Markers */}
        {threats.map((threat, index) => (
          <motion.div
            key={threat.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute top-${20 + (index * 10)}% left-${30 + (index * 15)}% cursor-pointer`}
            onClick={() => setSelectedThreat(threat)}
          >
            <div className={`w-4 h-4 rounded-full ${getThreatGlow(threat.severity)} ${getThreatColor(threat.severity)} bg-current animate-pulse`} />
          </motion.div>
        ))}

        {/* Earth Status Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3">
          <div className="text-sm font-mono">
            <div className="text-neon-green">STATUS: OPERATIONAL</div>
            <div className="text-gray-300">DAMAGE: {gameState.earthDamage}%</div>
            <div className="text-neon-blue">REPUTATION: {gameState.reputation}</div>
          </div>
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
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {threats.slice(0, 3).map((threat) => (
              <motion.div
                key={threat.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-1.5 rounded border-l-2 cursor-pointer hover:bg-opacity-30 ${
                  threat.severity === 'critical' ? 'border-neon-red bg-red-900/20' :
                  threat.severity === 'moderate' ? 'border-orange-500 bg-orange-900/20' :
                  threat.severity === 'low' ? 'border-neon-yellow bg-yellow-900/20' :
                  'border-neon-green bg-green-900/20'
                }`}
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs font-bold text-white truncate">{threat.title}</p>
                    <p className="text-xs text-gray-400 truncate">{threat.description}</p>
                  </div>
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                    threat.severity === 'critical' ? 'bg-neon-red text-black' :
                    threat.severity === 'moderate' ? 'bg-orange-500 text-black' :
                    threat.severity === 'low' ? 'bg-neon-yellow text-black' :
                    'bg-neon-green text-black'
                  }`}>
                    {threat.severity.toUpperCase()}
                  </span>
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
            
            <button
              onClick={() => setSelectedThreat(null)}
              className="mt-4 w-full bg-neon-blue hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MapPanel;
