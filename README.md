# 🌍 Earth Defense Command

**Protect humanity using real NASA data.**

A real-time planetary defense simulation game that uses NASA's Near Earth Object (NEO) and EPIC APIs to create an immersive experience where players must protect Earth from asteroid threats.

## 🚀 Features

### Core Gameplay
- **Real NASA Data**: Uses live asteroid data from NASA's NEO Web Service
- **Earth Visualization**: Real-time Earth images from NASA's EPIC satellite
- **Resource Management**: Manage satellites, probes, research teams, and funding
- **Threat Assessment**: Calculate risk levels based on real asteroid characteristics
- **Upgrade System**: Purchase improvements to enhance your defense capabilities

### Game Mechanics
- **Event Generation**: Mix real NASA data with simulated events for variety
- **Risk Calculation**: Assess asteroid threats based on size, velocity, and miss distance
- **Scoring System**: Earn points for successful defenses and lose points for failures
- **Progression**: Advance through days, unlock upgrades, and improve your defense network

## 🛠️ Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **NASA APIs**: NEO (Near Earth Object) and EPIC (Earth Polychromatic Imaging Camera)
- **In-memory Game State**: Real-time game state management
- **Caching**: 10-minute cache for NASA API calls

### Frontend
- **React 18**: Modern React with hooks and context
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Axios**: HTTP client for API communication

### APIs Used
- **NASA NEO API**: `https://api.nasa.gov/neo/rest/v1/feed`
- **NASA EPIC API**: `https://api.nasa.gov/EPIC/api/natural/images`

## 🎮 How to Play

1. **Monitor Threats**: Watch the Earth Defense Map for incoming asteroids
2. **Allocate Resources**: Deploy satellites, launch probes, or conduct research
3. **Deflect Asteroids**: Use probes to deflect dangerous asteroids
4. **Manage Resources**: Balance funds, power, and equipment
5. **Upgrade Systems**: Purchase improvements to enhance your capabilities
6. **Survive**: Keep Earth's damage below 100% to win

### Scoring
- **Correctly track asteroid**: +100 points
- **Deflect asteroid**: +300 points
- **Miss detection**: -200 points (causes damage)
- **Deploy wrong resource**: -50 points
- **Discover anomaly**: +150 points

### Upgrades
- **AI Auto-tracking**: Automatically flags nearby asteroids
- **Improved Radar**: Increases detection radius by 20%
- **Quantum Drive**: Shorter cooldowns and faster response
- **Public Support Campaign**: Earns extra funds per mission

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- NASA API key (optional, uses DEMO_KEY by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd earth-defense-command
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # In backend/.env
   NASA_API_KEY=your_nasa_api_key_here
   PORT=5000
   ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173` to play the game!

## 📁 Project Structure

```
earth-defense-command/
├── backend/
│   ├── src/
│   │   ├── controllers/          # API route handlers
│   │   │   ├── eventsController.js
│   │   │   ├── neoController.js
│   │   │   └── epicController.js
│   │   ├── services/            # Business logic
│   │   │   ├── nasaService.js   # NASA API integration
│   │   │   └── gameService.js   # Game logic and state
│   │   ├── routes/              # API routes
│   │   │   ├── events.js
│   │   │   ├── neo.js
│   │   │   └── epic.js
│   │   ├── utils/               # Utility functions
│   │   │   └── riskCalculator.js
│   │   └── server.js            # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── GameDashboard.jsx
│   │   │   ├── MapPanel.jsx
│   │   │   ├── CommandPanel.jsx
│   │   │   ├── ResourceHUD.jsx
│   │   │   ├── EventFeed.jsx
│   │   │   ├── ActionButtons.jsx
│   │   │   └── UpgradeModal.jsx
│   │   ├── context/             # React context
│   │   │   └── GameContext.jsx
│   │   ├── services/            # API client
│   │   │   └── api.js
│   │   ├── App.jsx              # Main app component
│   │   └── index.css            # Global styles
│   └── package.json
└── README.md
```

## 🎯 API Endpoints

### Game Events
- `GET /api/events/events` - Get current game events
- `GET /api/events/state` - Get current game state
- `POST /api/events/action` - Process player action
- `POST /api/events/upgrade` - Purchase upgrade
- `POST /api/events/advance-day` - Advance to next day
- `POST /api/events/reset` - Reset game

### NEO Data
- `GET /api/neo/asteroids` - Get near Earth objects
- `GET /api/neo/asteroids/:id` - Get specific asteroid details

### EPIC Data
- `GET /api/epic/latest` - Get latest Earth image
- `GET /api/epic/images` - Get recent Earth images

## 🎨 Design Philosophy

The game features a **sci-fi console aesthetic** with:
- **Dark theme** with neon blue accents
- **Glowing effects** and smooth animations
- **Monospace fonts** for that authentic terminal feel
- **Real-time updates** for immersive gameplay
- **Responsive design** that works on all devices

## 🔮 Future Enhancements

- **3D Earth Visualization**: Using React Three Fiber for immersive 3D experience
- **Sound Effects**: Audio feedback for actions and events
- **Multiplayer Mode**: Compete with other commanders
- **Achievement System**: Unlock badges and rewards
- **Data Visualization**: Charts and graphs for asteroid analysis
- **Mobile App**: Native mobile version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

## 🙏 Acknowledgments

- **NASA** for providing the amazing APIs that make this game possible
- **Bounce Insights** for the internship challenge that inspired this project
- **The open-source community** for the incredible tools and libraries used

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Ready to defend Earth? Launch the game and start your mission! 🚀**
