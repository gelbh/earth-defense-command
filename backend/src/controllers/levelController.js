import levelService from "../services/levelService.js";
import gameService from "../services/gameService.js";

// In-memory session storage for level gameplay
// In production, this would be Redis or similar
const levelSessions = new Map();

// Get all available levels
export const getAllLevels = (req, res) => {
  try {
    const levels = levelService.getAllLevels();
    res.json(levels);
  } catch (error) {
    console.error("Error getting levels:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get specific level details
export const getLevel = (req, res) => {
  try {
    const { id } = req.params;
    const level = levelService.getLevel(parseInt(id));
    res.json(level);
  } catch (error) {
    console.error("Error getting level:", error);
    res.status(404).json({ error: error.message });
  }
};

// Start a level (initialize level state)
export const startLevel = (req, res) => {
  try {
    const { id } = req.params;
    const levelId = parseInt(id);

    // Get level configuration
    const level = levelService.getLevel(levelId);

    // Initialize level state
    const levelState = levelService.initializeLevelState(levelId);

    // Create a session ID
    const sessionId = `level-${levelId}-${Date.now()}`;

    // Store session
    levelSessions.set(sessionId, {
      levelId,
      level,
      state: levelState,
      startedAt: Date.now(),
    });

    // Spawn first wave immediately (if delay is 0) or schedule it
    const firstWave = level.waves[0];
    if (firstWave) {
      if (firstWave.delay === 0) {
        const asteroids = levelService.spawnWave(firstWave, 1);
        levelState.threats.push(...asteroids);
        levelState.currentWave = 1;
        levelState.nextWaveTime = null;
      } else {
        // Schedule first wave
        levelState.nextWaveTime = Date.now() + firstWave.delay * 1000;
        levelState.waveTimer = firstWave.delay;
      }
    }

    res.json({
      sessionId,
      levelState: {
        ...levelState,
        // Don't send wave configs to avoid spoilers
        wavesConfig: undefined,
      },
    });
  } catch (error) {
    console.error("Error starting level:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get level state (for ongoing game)
export const getLevelState = (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const session = levelSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check for wave spawning
    const state = session.state;
    const level = session.level;

    if (
      state.nextWaveTime &&
      Date.now() >= state.nextWaveTime &&
      state.currentWave < state.totalWaves
    ) {
      // Spawn next wave
      const nextWaveIndex = state.currentWave; // currentWave is 0-indexed now
      const nextWave = level.waves[nextWaveIndex];

      if (nextWave) {
        const asteroids = levelService.spawnWave(nextWave, nextWaveIndex + 1);
        state.threats.push(...asteroids);
        state.currentWave++;

        // Schedule next wave if exists
        const followingWave = level.waves[state.currentWave];
        if (followingWave) {
          state.nextWaveTime = Date.now() + followingWave.delay * 1000;
          state.waveTimer = followingWave.delay;
        } else {
          state.nextWaveTime = null;
          state.waveTimer = 0;
        }
      }
    }

    // Update wave timer
    if (state.nextWaveTime) {
      state.waveTimer = Math.max(
        0,
        Math.floor((state.nextWaveTime - Date.now()) / 1000)
      );
    }

    // Check objectives
    levelService.checkObjectives(state, level);

    // Check victory
    if (levelService.checkVictory(state)) {
      state.levelComplete = true;
    }

    // Check failure
    const failureCheck = levelService.checkFailure(state);
    if (failureCheck.failed) {
      state.levelFailed = true;
      state.failureReason = failureCheck.reason;
    }

    res.json({
      ...state,
      wavesConfig: undefined, // Don't reveal future waves
    });
  } catch (error) {
    console.error("Error getting level state:", error);
    res.status(500).json({ error: error.message });
  }
};

// Process action within a level
export const processLevelAction = (req, res) => {
  try {
    const { sessionId, action } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const session = levelSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const state = session.state;
    const level = session.level;

    // Track initial funds for spending tracking
    const initialFunds = state.funds;

    // Process action using existing game service logic
    // We need to temporarily set gameService state
    const previousState = { ...gameService.gameState };
    gameService.gameState = state;

    const result = gameService.processAction(action);

    // Update state from gameService
    Object.assign(state, gameService.gameState);

    // Restore gameService state
    gameService.gameState = previousState;

    // Track performance
    if (result.success) {
      switch (action.type) {
        case "deflect_asteroid":
          if (result.fragmented) {
            state.levelPerformance.asteroidsFragmented++;
          } else {
            state.levelPerformance.asteroidsDestroyed++;
          }
          break;

        case "deploy_satellite":
          state.levelPerformance.satellitesDeployed++;
          state.levelPerformance.fundsSpent += 150000;
          break;

        case "launch_probe":
          state.levelPerformance.probesLaunched++;
          state.levelPerformance.fundsSpent += 200000;
          break;

        case "asteroid_impact":
          state.levelPerformance.asteroidsMissed++;
          state.levelPerformance.damageTaken += result.damage || 0;
          break;
      }
    }

    // Track funds spent
    const fundsSpent = initialFunds - state.funds;
    if (fundsSpent > 0) {
      state.levelPerformance.fundsSpent += fundsSpent;
    }

    // Update accuracy
    const totalAttempts =
      state.levelPerformance.asteroidsDestroyed +
      state.levelPerformance.asteroidsMissed;
    if (totalAttempts > 0) {
      state.levelPerformance.accuracy =
        state.levelPerformance.asteroidsDestroyed / totalAttempts;
    }

    // Check objectives after action
    levelService.checkObjectives(state, level);

    // Check victory
    if (levelService.checkVictory(state)) {
      state.levelComplete = true;
    }

    // Check failure
    const failureCheck = levelService.checkFailure(state);
    if (failureCheck.failed) {
      state.levelFailed = true;
      state.failureReason = failureCheck.reason;
    }

    res.json({
      ...result,
      levelState: {
        ...state,
        wavesConfig: undefined,
      },
    });
  } catch (error) {
    console.error("Error processing level action:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete level and get results
export const completeLevel = (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const session = levelSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const state = session.state;
    const level = session.level;

    // Generate results
    const results = levelService.generateResults(state, level);

    // Clean up session
    levelSessions.delete(sessionId);

    res.json(results);
  } catch (error) {
    console.error("Error completing level:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update player progression (client sends their progression, we update it)
export const updateProgression = (req, res) => {
  try {
    const { playerProgression, levelResults } = req.body;

    const updatedProgression = levelService.updateProgression(
      playerProgression,
      levelResults
    );

    res.json(updatedProgression);
  } catch (error) {
    console.error("Error updating progression:", error);
    res.status(500).json({ error: error.message });
  }
};

// Atmospheric burnup handler (from game)
export const handleBurnup = (req, res) => {
  try {
    const { sessionId, asteroidId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const session = levelSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const state = session.state;

    // Remove asteroid from threats
    state.threats = state.threats.filter((t) => t.id !== asteroidId);

    // Track burnup
    state.levelPerformance.asteroidsBurnedUp++;

    // Add score
    state.score += 50;

    // Update objectives
    levelService.checkObjectives(state, session.level);

    res.json({
      success: true,
      levelState: {
        ...state,
        wavesConfig: undefined,
      },
    });
  } catch (error) {
    console.error("Error handling burnup:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllLevels,
  getLevel,
  startLevel,
  getLevelState,
  processLevelAction,
  completeLevel,
  updateProgression,
  handleBurnup,
};
