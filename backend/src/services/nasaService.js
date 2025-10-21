import axios from 'axios';

const NASA_TAP_API = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

class NasaService {
  async getExoplanets(params = {}) {
    try {
      const { where, order, limit = 50, offset = 0 } = params;

      let query = `select pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens from ps where default_flag=1`;

      if (where) {
        query += ` and ${where}`;
      }

      if (order) {
        query += ` order by ${order}`;
      } else {
        query += ` order by pl_name`;
      }

      query += ` limit ${limit} offset ${offset}`;

      const response = await axios.get(NASA_TAP_API, {
        params: {
          query: query,
          format: 'json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching exoplanets:', error.message);
      throw new Error('Failed to fetch exoplanet data from NASA API');
    }
  }

  async getExoplanetCount(params = {}) {
    try {
      const { where } = params;

      let query = `select count(*) as total from ps where default_flag=1`;

      if (where) {
        query += ` and ${where}`;
      }

      const response = await axios.get(NASA_TAP_API, {
        params: {
          query: query,
          format: 'json'
        }
      });

      return response.data[0]?.total || 0;
    } catch (error) {
      console.error('Error fetching exoplanet count:', error.message);
      throw new Error('Failed to fetch exoplanet count');
    }
  }

  async searchExoplanets(searchTerm, params = {}) {
    try {
      const { limit = 50, offset = 0 } = params;

      let query = `select pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens from ps where default_flag=1 and (pl_name like '%${searchTerm}%' or hostname like '%${searchTerm}%')`;

      query += ` order by pl_name limit ${limit} offset ${offset}`;

      const response = await axios.get(NASA_TAP_API, {
        params: {
          query: query,
          format: 'json'
        }
      });

      return response.data || [];
    } catch (error) {
      console.error('Error searching exoplanets:', error.message);
      throw new Error('Failed to search exoplanet data');
    }
  }

  async getSearchCount(searchTerm) {
    try {
      let query = `select count(*) as total from ps where default_flag=1 and (pl_name like '%${searchTerm}%' or hostname like '%${searchTerm}%')`;

      const response = await axios.get(NASA_TAP_API, {
        params: {
          query: query,
          format: 'json'
        }
      });

      return response.data[0]?.total || 0;
    } catch (error) {
      console.error('Error fetching search count:', error.message);
      throw new Error('Failed to fetch search count');
    }
  }
}

export default new NasaService();
