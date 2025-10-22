# 🌍 Earth Defense Command

A real-time planetary defense game using NASA's Near Earth Object API. Deploy satellites, deflect asteroids, and protect Earth with stunning 3D graphics.

![Earth Defense Command](https://img.shields.io/badge/status-active-success) ![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen) ![React](https://img.shields.io/badge/react-18-blue)

## 🎮 Features

- **3D Earth Visualization** - Interactive 3D globe with React Three Fiber
- **Real NASA Data** - Live asteroid feeds from NASA's NEO API
- **Orbital Defense Network** - Deploy and upgrade satellites and laser probes
- **Realistic Physics** - Atmospheric burnup, asteroid fragmentation, detection zones
- **Strategic Gameplay** - Resource management, upgrades, and tactical decisions

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

1. **Deploy Satellites** ($150K) - Detect incoming asteroids
2. **Launch Probes** ($200K) - Deflect threats with lasers
3. **Upgrade Assets** - Click satellites/probes in 3D view to upgrade
4. **Manage Resources** - Balance funds, power, and missions
5. **Advance Days** - Process threats and restore resources

**Controls:**
- Drag to rotate camera
- Scroll to zoom
- Click asteroids to deflect
- Click satellites/probes to upgrade

## 📁 Project Structure

```
earth-defense-command/
├── backend/
│   ├── src/
│   │   ├── services/gameService.js    # Core game logic
│   │   ├── controllers/               # API endpoints
│   │   └── server.js                  # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Earth3D.jsx     # 3D visualization
│   │   ├── context/GameContext.jsx    # State management
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

**Game:**
- `GET /api/events` - Generate asteroid events
- `GET /api/events/state` - Get game state
- `POST /api/events/action` - Deploy, deflect, upgrade
- `POST /api/events/advance-day` - Next day

**NASA:**
- `GET /api/neo/asteroids` - Real asteroid data
- `GET /api/epic/latest` - Earth images

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

- **NASA** - NEO and EPIC APIs
- **Three.js** & **React Three Fiber** - 3D graphics
- **Tailwind CSS** - Styling

---

**🌍 Ready to defend Earth? [Get Started](#-quick-start) 🚀**
