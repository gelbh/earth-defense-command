import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useLevel } from "../context/LevelContext";
import ResourceHUD from "./ResourceHUD";
import MapPanel from "./MapPanel";
import CommandPanel from "./CommandPanel";
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
  const loading = isLevelMode ? levelLoading : endlessLoading;
  const error = isLevelMode ? levelError : endlessError;

  // Local state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    return !hasSeenTutorial && !isLevelMode; // Don't show tutorial in level mode
  });
  const [events, setEvents] = useState([]);
  const [showObjectives, setShowObjectives] = useState(isLevelMode);

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
      }, 2000); // Poll every 2 seconds

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

  if (loading && !gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <p className="text-neon-blue font-mono">
            Initializing Earth Defense Command...
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
    <div className="h-screen flex flex-col bg-space-blue overflow-hidden">
      {/* Level Info Bar (Level Mode Only) */}
      {isLevelMode && gameState && (
        <div className="bg-gray-900 border-b border-neon-blue px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-neon-blue hover:text-blue-400 transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-neon-blue font-bold text-lg">
              {gameState.levelName || "Level"}
            </h2>
            <div className="text-white">
              Wave {gameState.currentWave}/{gameState.totalWaves}
              {gameState.waveTimer > 0 && (
                <span className="text-neon-green ml-2">
                  Next: {gameState.waveTimer}s
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="px-3 py-1 bg-neon-blue text-white rounded hover:bg-blue-500 transition-colors"
          >
            {showObjectives ? "Hide" : "Show"} Objectives
          </button>
        </div>
      )}

      {/* Resource HUD */}
      <div className="flex-shrink-0">
        <ResourceHUD
          gameState={gameState}
          onHelpClick={() => setShowTutorial(true)}
        />
      </div>

      {/* Main Game Area */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* Map Panel - Left Side */}
        <div
          className={`${
            showObjectives && isLevelMode ? "col-span-5" : "col-span-7"
          } h-full overflow-hidden transition-all`}
        >
          <MapPanel
            gameState={gameState}
            events={events}
            threats={gameState?.threats || []}
            isLevelMode={isLevelMode}
          />
        </div>

        {/* Objectives Panel (Level Mode Only) */}
        {isLevelMode && showObjectives && gameState?.levelObjectives && (
          <div className="col-span-2 h-full overflow-hidden">
            <div className="bg-gray-900 border border-neon-blue rounded-lg p-4 h-full overflow-y-auto">
              <h3 className="text-neon-blue font-bold text-lg mb-4">
                Mission Objectives
              </h3>
              <div className="space-y-3">
                {gameState.levelObjectives.map((objective) => (
                  <div
                    key={objective.id}
                    className={`p-3 rounded border ${
                      objective.completed
                        ? "bg-green-900 border-green-500 text-green-300"
                        : objective.failed
                        ? "bg-red-900 border-red-500 text-red-300"
                        : "bg-gray-800 border-gray-600 text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">
                        {objective.completed
                          ? "✓"
                          : objective.failed
                          ? "✗"
                          : "○"}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {objective.description}
                        </p>
                        {objective.target && (
                          <p className="text-xs mt-1 opacity-75">
                            Progress: {objective.current || 0}/
                            {objective.target}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Command Panel - Right Side */}
        <div className="col-span-5 h-full overflow-hidden">
          <CommandPanel>
            <EventFeed events={events} />
            <ActionButtons
              gameState={gameState}
              onUpgradeClick={() => setShowUpgradeModal(true)}
              isLevelMode={isLevelMode}
            />
          </CommandPanel>
        </div>
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
