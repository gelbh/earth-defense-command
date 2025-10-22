import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Game API functions
export const gameAPI = {
  // Events and game state
  getEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  getGameState: async () => {
    try {
      const response = await api.get('/events/state');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch game state');
    }
  },

  processAction: async (action) => {
    try {
      const response = await api.post('/events/action', { action });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process action');
    }
  },

  purchaseUpgrade: async (upgradeType) => {
    try {
      const response = await api.post('/events/upgrade', { upgradeType });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to purchase upgrade');
    }
  },

  advanceDay: async () => {
    try {
      const response = await api.post('/events/advance-day');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to advance day');
    }
  },

  resetGame: async () => {
    try {
      const response = await api.post('/events/reset');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset game');
    }
  },
};

// NEO API functions
export const neoAPI = {
  getNearEarthObjects: async (days = 7) => {
    try {
      const response = await api.get(`/neo/asteroids?days=${days}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch NEO data');
    }
  },

  getAsteroidDetails: async (id) => {
    try {
      const response = await api.get(`/neo/asteroids/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch asteroid details');
    }
  },
};

// EPIC API functions
export const epicAPI = {
  getLatestEarthImage: async () => {
    try {
      const response = await api.get('/epic/latest');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Earth image');
    }
  },

  getEarthImages: async (limit = 10) => {
    try {
      const response = await api.get(`/epic/images?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Earth images');
    }
  },
};

export default api;
