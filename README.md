# 🌍 Earth Defense Command

A real-time planetary defense game using NASA's Near Earth Object API. Play through campaign missions, defend Earth from asteroids, and master tactical defense strategies with stunning 3D graphics.

![Earth Defense Command](https://img.shields.io/badge/status-active-success) ![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen) ![React](https://img.shields.io/badge/react-18-blue)

## 🎮 Features

### Game Modes
- **Campaign Mode** - 10 structured levels with specific objectives and star ratings
- **Endless Mode** - Classic survival gameplay with continuous asteroid threats

### Core Systems
- **3D Earth Visualization** - Full-screen immersive 3D globe with React Three Fiber
- **Real NASA Data** - Live asteroid feeds from NASA's NEO API
- **Orbital Defense Network** - Deploy and upgrade satellites and laser probes
- **Realistic Physics** - Atmospheric burnup, asteroid fragmentation, 3D detection zones
- **Wave-Based Spawning** - Strategic asteroid waves with delays
- **Progression System** - Unlock levels, earn stars, track best times
- **Replay System** - See previous records and improve your score

## 🛠️ Tech Stack

**Backend:** Node.js, Express, NASA NEO API  
**Frontend:** React 18, Vite, React Three Fiber, Tailwind CSS, Framer Motion

## 🚀 Quick Start

### Installation

```bash
# Clone the repo
git clone <repository-url>
cd earth-defense-command

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Setup

Create `backend/.env`:

```env
NASA_API_KEY=DEMO_KEY
PORT=5000
```

### Run

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and play!

## 🎯 How to Play

### Campaign Mode
1. **Choose a Level** - Select from unlocked missions
2. **Review Objectives** - See mission goals and loadout
3. **Launch Mission** - Start the level
4. **Deploy & Upgrade** - Use satellites and probes strategically
5. **Complete Objectives** - Destroy asteroids, survive waves
6. **Earn Stars** - 1-3 stars based on performance
7. **Unlock Levels** - Progress through the campaign

### Endless Mode
1. **Deploy Satellites** ($150K) - Detect incoming asteroids
2. **Launch Probes** ($200K) - Deflect threats with lasers
3. **Upgrade Assets** - Click satellites/probes in 3D view to upgrade
4. **Manage Resources** - Balance funds, power, and missions
5. **Advance Days** - Process threats and restore resources
6. **Survive** - How long can you defend Earth?

**Controls:**
- 🖱️ Drag to rotate camera
- 📜 Scroll to zoom
- 🎯 Click asteroids to deflect
- ⬆️ Click satellites/probes to upgrade
- ⏸️ Game auto-pauses when you tab away

## 📁 Project Structure

```
earth-defense-command/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── gameService.js       # Endless mode logic
│   │   │   ├── levelService.js      # Campaign mode logic
│   │   │   └── nasaService.js       # NASA API integration
│   │   ├── controllers/             # API route handlers
│   │   ├── data/levels.js           # 10 level configurations
│   │   └── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Earth3D.jsx          # 3D visualization
│   │   │   ├── GameDashboard.jsx    # Main gameplay UI
│   │   │   ├── MainMenu.jsx         # Mode selection
│   │   │   ├── LevelSelect.jsx      # Campaign level grid
│   │   │   ├── PreLevelBriefing.jsx # Mission briefing
│   │   │   └── LevelResults.jsx     # Results & stars
│   │   ├── context/
│   │   │   ├── GameContext.jsx      # Endless mode state
│   │   │   └── LevelContext.jsx     # Campaign mode state
│   │   └── App.jsx                  # Mode routing
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

**Endless Mode:**
- `GET /api/events` - Generate asteroid events
- `GET /api/events/state` - Get game state
- `POST /api/events/action` - Deploy, deflect, upgrade
- `POST /api/events/advance-day` - Next day

**Campaign Mode:**
- `GET /api/levels` - Get all levels
- `GET /api/levels/:id` - Get specific level
- `POST /api/levels/:id/start` - Start level
- `GET /api/levels/session/state` - Get level state (polled)
- `POST /api/levels/session/action` - Process action
- `POST /api/levels/session/complete` - Complete level
- `POST /api/levels/progression/update` - Update progression

**NASA Data:**
- `GET /api/neo/asteroids` - Real asteroid data from NASA NEO API

## 🎨 UI/UX Design

- **Full-Screen Map** - Immersive 3D Earth view with overlay UI panels
- **Glassmorphism** - Modern semi-transparent panels with backdrop blur
- **Minimizable Panels** - Event log and objectives can be collapsed
- **Compact Layouts** - All screens fit without scrolling
- **Star Animations** - Animated star reveals on level completion
- **Toast Notifications** - Smooth fade-in/out for action feedback
- **Progress Tracking** - localStorage persistence for campaign progress
- **Replay Stats** - See previous best times and stars when replaying levels

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## 📄 License

ISC License - see package.json for details

## 🙏 Credits

- **NASA** - NEO API for real asteroid data
- **Three.js** & **React Three Fiber** - 3D graphics
- **Tailwind CSS** - Styling

---

**🌍 Ready to defend Earth? [Get Started](#-quick-start) 🚀**
