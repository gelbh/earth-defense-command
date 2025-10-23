import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useLevel } from "../context/LevelContext";
import Earth3D from "./Earth3D";
import Toast from "./Toast";

const MapPanel = ({ gameState, events, threats, isLevelMode = false }) => {
  const { processAction: processEndlessAction, startGame } = useGame();
  const { processLevelAction, handleBurnup: handleLevelBurnup } = useLevel();
  
  // Use the appropriate action processor based on mode
  const processAction = isLevelMode ? processLevelAction : processEndlessAction;
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [deflecting, setDeflecting] = useState(false);
  const [toast, setToast] = useState(null);
  const [gameStarted, setGameStarted] = useState(threats.length > 0);

  // Update gameStarted when threats appear
  React.useEffect(() => {
    if (threats.length > 0) {
      setGameStarted(true);
    }
  }, [threats.length]);

  const handleUpgrade = async (assetId, assetType) => {
    try {
      const actionType =
        assetType === "satellite" ? "upgrade_satellite" : "upgrade_probe";
      const result = await processAction({
        type: actionType,
        targetId: assetId,
      });

      if (result?.success) {
        setToast({
          type: "success",
          message: {
            title: "✅ Upgrade Complete!",
            description: result.message,
          },
        });
      } else {
        setToast({
          type: "error",
          message: {
            title: "❌ Upgrade Failed",
            description: result.message || "Unable to upgrade",
          },
        });
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      setToast({
        type: "error",
        message: {
          title: "❌ Upgrade Error",
          description: "Failed to process upgrade request",
        },
      });
    }
  };

  const handleDeflect = async (threat) => {
    setDeflecting(true);
    try {
      const result = await processAction({
        type: "deflect_asteroid",
        targetId: threat.id,
        resource: "probe",
      });

      if (result?.success) {
        // Success notification
        setToast({
          type: "success",
          message: {
            title: result.fragmented
              ? "💥 Asteroid Fragmented!"
              : "🎯 Asteroid Destroyed!",
            description: result.message,
          },
        });
        setSelectedThreat(null);
      } else {
        // Failure notification
        setToast({
          type: "error",
          message: {
            title: "❌ Deflection Failed",
            description:
              result?.message ||
              "Insufficient resources or asteroid already deflected.",
          },
        });
      }
    } catch (error) {
      console.error("Failed to deflect asteroid:", error);
      setToast({
        type: "error",
        message: {
          title: "❌ Mission Error",
          description: "Critical failure in deflection system. Try again.",
        },
      });
    } finally {
      setDeflecting(false);
    }
  };

  const handleImpact = async (threat) => {
    try {
      const result = await processAction({
        type: "asteroid_impact",
        targetId: threat.id,
      });

      if (result?.success) {
        // Impact notification with damage info
        setToast({
          type: "error",
          message: {
            title: "💥 IMPACT DETECTED!",
            description: result.message,
          },
        });

        // Check for game over
        if (result.gameOver) {
          setTimeout(() => {
            setToast({
              type: "error",
              message: {
                title: "☠️ MISSION FAILED",
                description: "Earth's defenses have collapsed. Game Over.",
              },
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Failed to process impact:", error);
    }
  };

  const handleBurnup = async (asteroidId) => {
    try {
      if (isLevelMode) {
        await handleLevelBurnup(asteroidId);
      }
      // For endless mode, burnup is handled automatically in backend
      setToast({
        type: "success",
        message: {
          title: "🔥 Atmospheric Burnup!",
          description: "Small asteroid burned up in atmosphere",
        },
      });
    } catch (error) {
      console.error("Failed to handle burnup:", error);
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
          onImpact={handleImpact}
          onUpgrade={handleUpgrade}
          onBurnup={handleBurnup}
        />

        {/* Earth Status Overlay */}
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-neon-blue/30">
          <div className="text-xs font-mono space-y-0.5">
            <div className="text-neon-green">STATUS: OPERATIONAL</div>
            <div className="text-gray-300">
              HEALTH: {gameState.earthHealth}%
            </div>
            <div className="text-neon-blue">
              REPUTATION: {gameState.reputation}
            </div>
          </div>
        </div>

        {/* Start Game Button (Endless Mode Only) */}
        {!isLevelMode && !gameStarted && threats.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(0, 255, 136, 0.6)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                await startGame();
                setGameStarted(true);
              }}
              className="px-8 py-4 bg-neon-green hover:bg-green-500 text-black font-bold text-xl rounded-lg font-mono glow-green transition-all"
            >
              🚀 START MISSION
            </motion.button>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-400 font-mono">
          🖱️ Drag to rotate • Scroll to zoom
        </div>
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
                  <span className="text-white">
                    {Math.round(selectedThreat.data.diameter)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Velocity:</span>
                  <span className="text-white">
                    {Math.round(selectedThreat.data.velocity)} km/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Miss Distance:</span>
                  <span className="text-white">
                    {Math.round(selectedThreat.data.missDistance / 1000)}k km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hazardous:</span>
                  <span
                    className={
                      selectedThreat.data.isHazardous
                        ? "text-neon-red"
                        : "text-neon-green"
                    }
                  >
                    {selectedThreat.data.isHazardous ? "YES" : "NO"}
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
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-neon-green hover:bg-green-500 text-black"
                }`}
              >
                {deflecting ? "Deflecting..." : `🚀 Deflect (1 Probe)`}
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
