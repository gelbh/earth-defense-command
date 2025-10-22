import React from 'react';
import { GameProvider } from './context/GameContext';
import GameDashboard from './components/GameDashboard';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="App">
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
