import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LevelContext = createContext();

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
};

export const LevelProvider = ({ children }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [levelState, setLevelState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Player progression (loaded from localStorage)
  const [progression, setProgression] = useState(() => {
    const saved = localStorage.getItem("playerProgression");
    return saved
      ? JSON.parse(saved)
      : {
          unlockedLevels: [1],
          levelStars: {},
          levelBestTimes: {},
          totalStars: 0,
          gems: 0,
          unlockedAssets: {
            satellites: ["standard"],
            probes: ["kinetic"],
            abilities: [],
          },
        };
  });

  // Save progression to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("playerProgression", JSON.stringify(progression));
  }, [progression]);

  // Fetch all levels on mount
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/levels");
      setLevels(response.data);
    } catch (err) {
      console.error("Error fetching levels:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevel = async (levelId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/levels/${levelId}`);
      setCurrentLevel(response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching level:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startLevel = async (levelId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`/api/levels/${levelId}/start`);

      setSessionId(response.data.sessionId);
      setLevelState(response.data.levelState);
      setCurrentLevel(null); // Will be set by level config

      return response.data;
    } catch (err) {
      console.error("Error starting level:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLevelState = async () => {
    if (!sessionId) return null;

    try {
      const response = await axios.get("/api/levels/session/state", {
        params: { sessionId },
      });
      setLevelState(response.data);
      return response.data;
    } catch (err) {
      console.error("Error getting level state:", err);
      setError(err.message);
      return null;
    }
  };

  const processLevelAction = async (action) => {
    if (!sessionId) {
      throw new Error("No active level session");
    }

    try {
      const response = await axios.post("/api/levels/session/action", {
        sessionId,
        action,
      });

      // Update level state
      if (response.data.levelState) {
        setLevelState(response.data.levelState);
      }

      return response.data;
    } catch (err) {
      console.error("Error processing level action:", err);
      setError(err.message);
      throw err;
    }
  };

  const handleBurnup = async (asteroidId) => {
    if (!sessionId) return;

    try {
      const response = await axios.post("/api/levels/session/burnup", {
        sessionId,
        asteroidId,
      });

      if (response.data.levelState) {
        setLevelState(response.data.levelState);
      }

      return response.data;
    } catch (err) {
      console.error("Error handling burnup:", err);
      setError(err.message);
    }
  };

  const completeLevel = async () => {
    if (!sessionId) {
      throw new Error("No active level session");
    }

    try {
      const response = await axios.post("/api/levels/session/complete", {
        sessionId,
      });

      const results = response.data;

      // Update progression
      const updatedProgression = await updateProgression(results);
      setProgression(updatedProgression);

      // Clear session
      setSessionId(null);
      setLevelState(null);

      return results;
    } catch (err) {
      console.error("Error completing level:", err);
      setError(err.message);
      throw err;
    }
  };

  const updateProgression = async (levelResults) => {
    try {
      const response = await axios.post("/api/levels/progression/update", {
        playerProgression: progression,
        levelResults,
      });

      return response.data;
    } catch (err) {
      console.error("Error updating progression:", err);
      // Fallback: update locally if server fails
      const updated = { ...progression };

      const levelId = levelResults.levelId;

      // Update stars
      const previousStars = updated.levelStars[levelId] || 0;
      if (levelResults.stars > previousStars) {
        updated.levelStars[levelId] = levelResults.stars;
        updated.totalStars += levelResults.stars - previousStars;
      }

      // Update best time
      const previousBestTime = updated.levelBestTimes[levelId] || Infinity;
      if (levelResults.performance.timeElapsed < previousBestTime) {
        updated.levelBestTimes[levelId] = levelResults.performance.timeElapsed;
      }

      // Add gems
      updated.gems += levelResults.rewards.gems;

      // Add unlocked levels
      levelResults.rewards.unlocks.forEach((unlock) => {
        if (unlock.startsWith("level_")) {
          const unlockLevelId = parseInt(unlock.split("_")[1]);
          if (!updated.unlockedLevels.includes(unlockLevelId)) {
            updated.unlockedLevels.push(unlockLevelId);
          }
        }
      });

      updated.unlockedLevels.sort((a, b) => a - b);

      return updated;
    }
  };

  const isLevelUnlocked = (levelId) => {
    return progression.unlockedLevels.includes(levelId);
  };

  const getLevelStars = (levelId) => {
    return progression.levelStars[levelId] || 0;
  };

  const getLevelBestTime = (levelId) => {
    return progression.levelBestTimes[levelId] || null;
  };

  const resetProgression = () => {
    const defaultProgression = {
      unlockedLevels: [1],
      levelStars: {},
      levelBestTimes: {},
      totalStars: 0,
      gems: 0,
      unlockedAssets: {
        satellites: ["standard"],
        probes: ["kinetic"],
        abilities: [],
      },
    };
    setProgression(defaultProgression);
    localStorage.setItem(
      "playerProgression",
      JSON.stringify(defaultProgression)
    );
  };

  const value = {
    // Data
    levels,
    currentLevel,
    sessionId,
    levelState,
    progression,
    loading,
    error,

    // Actions
    fetchLevels,
    getLevel,
    startLevel,
    getLevelState,
    processLevelAction,
    handleBurnup,
    completeLevel,
    updateProgression,

    // Helpers
    isLevelUnlocked,
    getLevelStars,
    getLevelBestTime,
    resetProgression,
  };

  return (
    <LevelContext.Provider value={value}>{children}</LevelContext.Provider>
  );
};

export default LevelContext;
