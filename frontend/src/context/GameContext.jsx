import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api.js';

const GameContext = createContext();

// Game state reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, ...action.payload };
    
    case 'UPDATE_RESOURCES':
      return {
        ...state,
        funds: action.payload.funds ?? state.funds,
        power: action.payload.power ?? state.power,
        satellites: action.payload.satellites ?? state.satellites,
        probes: action.payload.probes ?? state.probes,
        researchTeams: action.payload.researchTeams ?? state.researchTeams,
      };
    
    case 'ADD_EVENT':
      return {
        ...state,
        events: [action.payload, ...state.events.slice(0, 49)], // Keep last 50 events
      };
    
    case 'UPDATE_THREATS':
      return {
        ...state,
        threats: action.payload,
      };
    
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
      };
    
    case 'UPDATE_EARTH_DAMAGE':
      return {
        ...state,
        earthDamage: Math.max(0, Math.min(100, state.earthDamage + action.payload)),
      };
    
    case 'PURCHASE_UPGRADE':
      return {
        ...state,
        upgrades: {
          ...state.upgrades,
          [action.payload]: true,
        },
      };
    
    case 'RESET_GAME':
      return {
        day: 1,
        score: 0,
        funds: 1000000,
        power: 100,
        satellites: 3,
        probes: 2,
        researchTeams: 1,
        upgrades: {
          aiTracking: false,
          improvedRadar: false,
          quantumDrive: false,
          publicSupport: false,
        },
        events: [],
        threats: [],
        earthDamage: 0,
        reputation: 100,
      };
    
    default:
      return state;
  }
};

// Initial game state
const initialState = {
  day: 1,
  score: 0,
  funds: 1000000,
  power: 100,
  satellites: 3,
  probes: 2,
  researchTeams: 1,
  upgrades: {
    aiTracking: false,
    improvedRadar: false,
    quantumDrive: false,
    publicSupport: false,
  },
  events: [],
  threats: [],
  earthDamage: 0,
  reputation: 100,
};

export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Load initial game state
  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/state');
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
      }
    } catch (err) {
      console.error('Error loading game state:', err);
      setError('Failed to load game state');
    } finally {
      setLoading(false);
    }
  };

  const generateEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
        return response.data.events;
      }
    } catch (err) {
      console.error('Error generating events:', err);
      setError('Failed to generate events');
    } finally {
      setLoading(false);
    }
    return [];
  };

  const processAction = async (action) => {
    try {
      setLoading(true);
      const response = await api.post('/events/action', { action });
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
        return response.data.result;
      }
    } catch (err) {
      console.error('Error processing action:', err);
      setError('Failed to process action');
    } finally {
      setLoading(false);
    }
    return { success: false, message: 'Action failed' };
  };

  const purchaseUpgrade = async (upgradeType) => {
    try {
      setLoading(true);
      const response = await api.post('/events/upgrade', { upgradeType });
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
        return response.data.result;
      }
    } catch (err) {
      console.error('Error purchasing upgrade:', err);
      setError('Failed to purchase upgrade');
    } finally {
      setLoading(false);
    }
    return { success: false, message: 'Upgrade failed' };
  };

  const advanceDay = async () => {
    try {
      setLoading(true);
      const response = await api.post('/events/advance-day');
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
      }
    } catch (err) {
      console.error('Error advancing day:', err);
      setError('Failed to advance day');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = async () => {
    try {
      setLoading(true);
      const response = await api.post('/events/reset');
      if (response.data.success) {
        dispatch({ type: 'SET_GAME_STATE', payload: response.data.gameState });
      }
    } catch (err) {
      console.error('Error resetting game:', err);
      setError('Failed to reset game');
    } finally {
      setLoading(false);
    }
  };

  const getNearEarthObjects = async (days = 7) => {
    try {
      const response = await api.get(`/neo/asteroids?days=${days}`);
      if (response.data.success) {
        return response.data.asteroids;
      }
    } catch (err) {
      console.error('Error fetching NEO data:', err);
      setError('Failed to fetch asteroid data');
    }
    return [];
  };

  const getLatestEarthImage = async () => {
    try {
      const response = await api.get('/epic/latest');
      if (response.data.success) {
        return response.data.image;
      }
    } catch (err) {
      console.error('Error fetching Earth image:', err);
      setError('Failed to fetch Earth image');
    }
    return null;
  };

  const value = {
    gameState,
    loading,
    error,
    setError,
    loadGameState,
    generateEvents,
    processAction,
    purchaseUpgrade,
    advanceDay,
    resetGame,
    getNearEarthObjects,
    getLatestEarthImage,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
