import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import ResourceHUD from './ResourceHUD';
import MapPanel from './MapPanel';
import CommandPanel from './CommandPanel';
import EventFeed from './EventFeed';
import ActionButtons from './ActionButtons';
import UpgradeModal from './UpgradeModal';
import TutorialModal from './TutorialModal';

const GameDashboard = () => {
  const { gameState, loading, error, generateEvents, resetGame } = useGame();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [events, setEvents] = useState([]);

  // Initial event generation only
  useEffect(() => {
    const loadInitialEvents = async () => {
      const newEvents = await generateEvents();
      if (newEvents && newEvents.length > 0) {
        setEvents(newEvents);
      }
    };
    loadInitialEvents();
  }, []); // Only run once on mount

  // Sync local events with gameState.events whenever it changes
  useEffect(() => {
    if (gameState && gameState.events && gameState.events.length > 0) {
      setEvents(gameState.events);
    }
  }, [gameState]);

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
    <div className="h-screen flex flex-col bg-space-blue overflow-hidden">
      {/* Resource HUD */}
      <div className="flex-shrink-0">
        <ResourceHUD gameState={gameState} onHelpClick={() => setShowTutorial(true)} />
      </div>
      
      {/* Main Game Area */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Map Panel - Left Side */}
        <div className="col-span-7 h-full overflow-hidden">
          <MapPanel 
            gameState={gameState} 
            events={events}
            threats={gameState.threats || []}
          />
        </div>
        
        {/* Command Panel - Right Side */}
        <div className="col-span-5 h-full overflow-hidden">
          <CommandPanel>
            <EventFeed events={events} />
            <ActionButtons 
              gameState={gameState}
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </CommandPanel>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}

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
              onClick={async () => {
                await resetGame();
                const newEvents = await generateEvents();
                if (newEvents && newEvents.length > 0) {
                  setEvents(newEvents);
                }
              }}
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
