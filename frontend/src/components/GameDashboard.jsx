import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useLevel } from "../context/LevelContext";
import ResourceHUD from "./ResourceHUD";
import MapPanel from "./MapPanel";
import EventFeed from "./EventFeed";
import ActionButtons from "./ActionButtons";
import UpgradeModal from "./UpgradeModal";
import TutorialModal from "./TutorialModal";

const GameDashboard = ({
  isLevelMode = false,
  levelId = null,
  onLevelComplete = null,
  onBack = null,
}) => {
  // Contexts
  const {
    gameState: endlessGameState,
    loading: endlessLoading,
    error: endlessError,
    generateEvents,
    resetGame,
  } = useGame();
  const {
    levelState,
    sessionId,
    loading: levelLoading,
    error: levelError,
    startLevel,
    getLevelState,
    completeLevel,
  } = useLevel();

  // Determine which state to use
  const gameState = isLevelMode ? levelState : endlessGameState;
  const error = isLevelMode ? levelError : endlessError;

  // Local state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    return !hasSeenTutorial && !isLevelMode; // Don't show tutorial in level mode
  });
  const [events, setEvents] = useState([]);
  const [showEventLog, setShowEventLog] = useState(true);
  const [showObjectives, setShowObjectives] = useState(true);

  // Handle tutorial close and mark as seen
  const handleTutorialClose = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  // Initialize level or endless mode
  useEffect(() => {
    if (isLevelMode && levelId && !sessionId) {
      // Start the level
      startLevel(levelId);
    } else if (!isLevelMode) {
      // Load initial events for endless mode
      const loadInitialEvents = async () => {
        const newEvents = await generateEvents();
        if (newEvents && newEvents.length > 0) {
          setEvents(newEvents);
        }
      };
      loadInitialEvents();
    }
  }, [isLevelMode, levelId]);

  // Poll level state in level mode
  useEffect(() => {
    if (isLevelMode && sessionId) {
      const interval = setInterval(() => {
        getLevelState();
      }, 500); // Poll every 0.5 seconds for smooth timer updates

      return () => clearInterval(interval);
    }
  }, [isLevelMode, sessionId]);

  // Sync events with game state
  useEffect(() => {
    if (gameState?.events?.length > 0) {
      setEvents(gameState.events);
    }
  }, [gameState]);

  // Check for level completion or failure
  useEffect(() => {
    if (isLevelMode && gameState) {
      if (gameState.levelComplete && onLevelComplete) {
        // Level completed! Get results
        handleLevelComplete();
      }
    }
  }, [isLevelMode, gameState?.levelComplete]);

  const handleLevelComplete = async () => {
    try {
      const results = await completeLevel();
      onLevelComplete(results);
    } catch (err) {
      console.error("Error completing level:", err);
    }
  };

  // Show loading if gameState is not ready
  if (!gameState || (isLevelMode && !sessionId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-space-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono">
            {isLevelMode
              ? "Initializing Mission..."
              : "Initializing Earth Defense Command..."}
          </p>
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
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {/* FULL SCREEN MAP - Background */}
      <div className="absolute inset-0">
        <MapPanel
          gameState={gameState}
          events={events}
          threats={gameState?.threats || []}
          isLevelMode={isLevelMode}
        />
      </div>

      {/* OVERLAY UI LAYER */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - Compact Resources + Wave Counter */}
        <div className="pointer-events-auto">
          <ResourceHUD
            gameState={gameState}
            onHelpClick={() => setShowTutorial(true)}
            compact={true}
          />

          {/* Wave Countdown in Header (Level Mode Only) */}
          {isLevelMode && gameState && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <div className="bg-black/60 backdrop-blur-lg rounded-lg px-4 py-2">
                <div className="flex items-center justify-center gap-3 text-xs text-white">
                  <span className="px-2 py-1 bg-neon-blue/20 rounded font-bold">
                    Wave {gameState.currentWave}/{gameState.totalWaves}
                  </span>
                  {gameState.waveTimer > 0 && (
                    <span className="text-neon-green font-bold">
                      Next: {gameState.waveTimer}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Left - Level Info (Level Mode Only) */}
        {isLevelMode && gameState && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-20 left-4 pointer-events-auto"
          >
            <div className="bg-black/60 backdrop-blur-lg border border-neon-blue/50 rounded-lg p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="text-neon-blue hover:text-blue-400 transition-colors text-sm"
                >
                  ← Back
                </button>
                <div className="w-px h-4 bg-neon-blue/30"></div>
                <h2 className="text-neon-blue font-bold text-sm">
                  {gameState.levelName || "Level"}
                </h2>
              </div>
            </div>
          </motion.div>
        )}

        {/* Left Side - Objectives Panel (Level Mode Only) */}
        {isLevelMode && gameState?.levelObjectives && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-48 left-4 w-80 max-h-96 pointer-events-auto"
          >
            <div className="bg-black/60 backdrop-blur-lg border border-neon-blue/50 rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-neon-blue/30 to-transparent px-4 py-3 border-b border-neon-blue/30 flex items-center justify-between">
                <h3 className="text-neon-blue font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>🎯</span> Mission Objectives
                </h3>
                <button
                  onClick={() => setShowObjectives(!showObjectives)}
                  className="text-neon-blue hover:text-blue-400 transition-colors text-lg"
                  title={showObjectives ? "Minimize" : "Expand"}
                >
                  {showObjectives ? "−" : "+"}
                </button>
              </div>
              {showObjectives && (
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                  {gameState.levelObjectives.map((objective) => (
                    <motion.div
                      key={objective.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg border backdrop-blur-sm ${
                        objective.completed
                          ? "bg-green-500/20 border-green-500/50 text-green-300"
                          : objective.failed
                          ? "bg-red-500/20 border-red-500/50 text-red-300"
                          : "bg-gray-800/40 border-gray-600/50 text-white"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {objective.completed
                            ? "✓"
                            : objective.failed
                            ? "✗"
                            : "○"}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold">
                            {objective.description}
                          </p>
                          {objective.target && (
                            <p className="text-xs mt-1 opacity-75 font-mono">
                              {objective.current || 0}/{objective.target}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Right Side - Event Log */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-20 right-4 w-96 pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-lg border border-neon-blue/50 rounded-lg shadow-2xl overflow-hidden">
            {/* Event Feed */}
            <div className="bg-gradient-to-r from-neon-blue/30 to-transparent px-4 py-3 border-b border-neon-blue/30 flex items-center justify-between">
              <h3 className="text-neon-blue font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <span>📡</span> Event Log
              </h3>
              <button
                onClick={() => setShowEventLog(!showEventLog)}
                className="text-neon-blue hover:text-blue-400 transition-colors text-lg"
                title={showEventLog ? "Minimize" : "Expand"}
              >
                {showEventLog ? "−" : "+"}
              </button>
            </div>
            {showEventLog && (
              <div className="max-h-96 overflow-hidden">
                <EventFeed events={events} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Right - Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 right-4 pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-lg border border-neon-blue/50 rounded-lg shadow-2xl p-4 max-h-96 overflow-visible">
            <ActionButtons
              gameState={gameState}
              onUpgradeClick={() => setShowUpgradeModal(true)}
              isLevelMode={isLevelMode}
            />
          </div>
        </motion.div>

        {/* Bottom Left - Earth Health Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-24 left-4 pointer-events-auto"
        >
          <div className="bg-black/60 backdrop-blur-lg border border-neon-blue/50 rounded-lg shadow-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="text-xs text-gray-400 font-mono uppercase">
                  Earth Health
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gameState.earthHealth}%` }}
                      className={`h-full rounded-full ${
                        gameState.earthHealth > 75
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : gameState.earthHealth > 50
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                          : gameState.earthHealth > 25
                          ? "bg-gradient-to-r from-orange-500 to-orange-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-bold font-mono ${
                      gameState.earthHealth > 75
                        ? "text-green-400"
                        : gameState.earthHealth > 50
                        ? "text-yellow-400"
                        : gameState.earthHealth > 25
                        ? "text-orange-400"
                        : "text-red-400"
                    }`}
                  >
                    {gameState.earthHealth}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && <TutorialModal onClose={handleTutorialClose} />}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          gameState={gameState}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* Game Over Overlay - Endless Mode */}
      {!isLevelMode && gameState?.earthHealth <= 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        >
          <div className="text-center">
            <div className="text-neon-red text-8xl mb-4">💥</div>
            <h2 className="text-4xl font-bold text-neon-red mb-4">
              MISSION FAILED
            </h2>
            <p className="text-xl text-white mb-6">
              Earth's health has reached critical levels
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Final Score: {gameState.score}
            </p>
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

      {/* Level Failed Overlay - Level Mode */}
      {isLevelMode && gameState?.levelFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
        >
          <div className="text-center max-w-md">
            <div className="text-neon-red text-8xl mb-4">💥</div>
            <h2 className="text-4xl font-bold text-neon-red mb-4">
              LEVEL FAILED
            </h2>
            <p className="text-xl text-white mb-4">
              {gameState.failureReason || "Mission objectives not met"}
            </p>
            <p className="text-lg text-gray-300 mb-8">
              Score: {gameState.score}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Briefing
              </button>
              <button
                onClick={async () => {
                  // Restart level
                  await startLevel(levelId);
                }}
                className="bg-neon-blue hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Retry Level
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameDashboard;
