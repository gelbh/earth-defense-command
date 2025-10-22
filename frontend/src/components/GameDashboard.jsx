import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import ResourceHUD from './ResourceHUD';
import MapPanel from './MapPanel';
import CommandPanel from './CommandPanel';
import EventFeed from './EventFeed';
import ActionButtons from './ActionButtons';
import UpgradeModal from './UpgradeModal';

const GameDashboard = () => {
  const { gameState, loading, error, generateEvents } = useGame();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [events, setEvents] = useState([]);

  // Generate events periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const newEvents = await generateEvents();
      if (newEvents && newEvents.length > 0) {
        setEvents(prev => [...newEvents, ...prev].slice(0, 20)); // Keep last 20 events
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [generateEvents]);

  // Initial event generation
  useEffect(() => {
    generateEvents();
  }, [generateEvents]);

  if (loading && !gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono">Initializing Earth Defense Command...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-neon-red text-6xl mb-4">⚠️</div>
          <p className="text-neon-red font-mono text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-space-blue">
      {/* Resource HUD */}
      <ResourceHUD gameState={gameState} />
      
      {/* Main Game Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 h-full">
        {/* Map Panel - Left Side */}
        <div className="col-span-8">
          <MapPanel 
            gameState={gameState} 
            events={events}
            threats={gameState.threats || []}
          />
        </div>
        
        {/* Command Panel - Right Side */}
        <div className="col-span-4 flex flex-col space-y-4">
          <CommandPanel>
            <EventFeed events={events} />
            <ActionButtons 
              gameState={gameState}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </CommandPanel>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          gameState={gameState}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Game Over Overlay */}
      {gameState.earthDamage >= 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        >
          <div className="text-center">
            <div className="text-neon-red text-8xl mb-4">💥</div>
            <h2 className="text-4xl font-bold text-neon-red mb-4">MISSION FAILED</h2>
            <p className="text-xl text-white mb-6">Earth has sustained too much damage</p>
            <p className="text-lg text-gray-300 mb-8">Final Score: {gameState.score}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-neon-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Restart Mission
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameDashboard;
