import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const exoplanetAPI = {
  getAllExoplanets: async (params = {}) => {
    try {
      const response = await api.get('/exoplanets', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch exoplanets');
    }
  },

  searchExoplanets: async (searchTerm) => {
    try {
      const response = await api.get('/exoplanets/search', {
        params: { q: searchTerm },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search exoplanets');
    }
  },
};

export default api;
