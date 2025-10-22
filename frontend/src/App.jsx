import React from 'react';
import { GameProvider } from './context/GameContext';
import GameDashboard from './components/GameDashboard';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1 className="game-title">
              <span className="title-icon">🌎</span>
              Earth Defense Command
            </h1>
            <p className="game-subtitle">Protect humanity using real NASA data</p>
          </div>
        </header>

        <main className="App-main">
          <GameDashboard />
        </main>

        <footer className="App-footer">
          <p>Data from NASA Open APIs | Made for Bounce Insights Internship Challenge</p>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;
