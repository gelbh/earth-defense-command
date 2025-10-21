import axios from 'axios';

const NASA_TAP_API = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

class NasaService {
  async getExoplanets(params = {}) {
    try {
      let query = `select pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens from ps where default_flag=1`;

      if (params.where) {
        query += ` and ${params.where}`;
      }

      if (params.order) {
        query += ` order by ${params.order}`;
      }

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

  async searchExoplanets(searchTerm) {
    try {
      const query = `select pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens from ps where default_flag=1 and (pl_name like '%${searchTerm}%' or hostname like '%${searchTerm}%')`;

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
}

export default new NasaService();
