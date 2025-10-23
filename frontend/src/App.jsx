import React, { useState } from "react";
import { GameProvider } from "./context/GameContext";
import { LevelProvider, useLevel } from "./context/LevelContext";
import GameDashboard from "./components/GameDashboard";
import MainMenu from "./components/MainMenu";
import LevelSelect from "./components/LevelSelect";
import PreLevelBriefing from "./components/PreLevelBriefing";
import LevelResults from "./components/LevelResults";
import "./App.css";

// Game modes
const MODES = {
  MENU: "menu",
  LEVEL_SELECT: "level_select",
  BRIEFING: "briefing",
  LEVEL_PLAY: "level_play",
  LEVEL_RESULTS: "results",
  ENDLESS: "endless",
};

function AppContent() {
  const [mode, setMode] = useState(MODES.MENU);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelResults, setLevelResults] = useState(null);

  const { getLevel, isLevelUnlocked, progression } = useLevel();

  // Navigate to campaign (first unlocked level)
  const handleStartCampaign = () => {
    const nextLevel =
      progression.unlockedLevels[progression.unlockedLevels.length - 1];
    handleSelectLevel(nextLevel);
  };

  // Navigate to level select
  const handleLevelSelect = () => {
    setMode(MODES.LEVEL_SELECT);
  };

  // Select a specific level
  const handleSelectLevel = async (levelId) => {
    if (!isLevelUnlocked(levelId)) {
      return;
    }

    setSelectedLevelId(levelId);
    const level = await getLevel(levelId);
    setSelectedLevel(level);
    setMode(MODES.BRIEFING);
  };

  // Launch level from briefing
  const handleLaunchLevel = () => {
    setMode(MODES.LEVEL_PLAY);
  };

  // Handle level completion
  const handleLevelComplete = (results) => {
    setLevelResults(results);
    setMode(MODES.LEVEL_RESULTS);
  };

  // Navigate to next level
  const handleNextLevel = () => {
    const nextLevelId = selectedLevelId + 1;
    if (isLevelUnlocked(nextLevelId)) {
      handleSelectLevel(nextLevelId);
    } else {
      setMode(MODES.LEVEL_SELECT);
    }
  };

  // Retry current level
  const handleRetry = () => {
    handleSelectLevel(selectedLevelId);
  };

  // Back to menu
  const handleBackToMenu = () => {
    setSelectedLevelId(null);
    setSelectedLevel(null);
    setLevelResults(null);
    setMode(MODES.MENU);
  };

  // Start endless mode (original gameplay)
  const handleEndless = () => {
    setMode(MODES.ENDLESS);
  };

  return (
    <div className="App">
      <main className="App-main">
        {mode === MODES.MENU && (
          <MainMenu
            onStartCampaign={handleStartCampaign}
            onLevelSelect={handleLevelSelect}
            onEndless={handleEndless}
            onSettings={() => alert("Settings coming soon!")}
          />
        )}

        {mode === MODES.LEVEL_SELECT && (
          <LevelSelect
            onSelectLevel={handleSelectLevel}
            onBack={handleBackToMenu}
          />
        )}

        {mode === MODES.BRIEFING && selectedLevel && (
          <PreLevelBriefing
            level={selectedLevel}
            onLaunch={handleLaunchLevel}
            onBack={() => setMode(MODES.LEVEL_SELECT)}
          />
        )}

        {mode === MODES.LEVEL_PLAY && (
          <GameDashboard
            isLevelMode={true}
            levelId={selectedLevelId}
            onLevelComplete={handleLevelComplete}
            onBack={() => setMode(MODES.BRIEFING)}
          />
        )}

        {mode === MODES.LEVEL_RESULTS && levelResults && (
          <LevelResults
            results={levelResults}
            onNextLevel={
              isLevelUnlocked(selectedLevelId + 1) ? handleNextLevel : null
            }
            onRetry={handleRetry}
            onMenu={() => setMode(MODES.LEVEL_SELECT)}
          />
        )}

        {mode === MODES.ENDLESS && (
          <GameDashboard isLevelMode={false} onBack={handleBackToMenu} />
        )}
      </main>

      <footer className="App-footer">
        <p>Data from NASA Open APIs | Earth Defense Command v1.0</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <LevelProvider>
        <AppContent />
      </LevelProvider>
    </GameProvider>
  );
}

export default App;
