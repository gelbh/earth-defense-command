import axios from 'axios';

const NASA_EXOPLANET_API = 'https://exoplanetarchive.nasa.gov/cgi-bin/nstedAPI/nph-nstedAPI';

class NasaService {
  async getExoplanets(params = {}) {
    try {
      const queryParams = {
        table: 'exoplanets',
        format: 'json',
        select: 'pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens',
        ...params
      };

      const response = await axios.get(NASA_EXOPLANET_API, {
        params: queryParams
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching exoplanets:', error.message);
      throw new Error('Failed to fetch exoplanet data from NASA API');
    }
  }

  async searchExoplanets(searchTerm) {
    try {
      const queryParams = {
        table: 'exoplanets',
        format: 'json',
        select: 'pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens',
        where: `pl_name like '%${searchTerm}%' or hostname like '%${searchTerm}%'`
      };

      const response = await axios.get(NASA_EXOPLANET_API, {
        params: queryParams
      });

      return response.data || [];
    } catch (error) {
      console.error('Error searching exoplanets:', error.message);
      throw new Error('Failed to search exoplanet data');
    }
  }
}

export default new NasaService();
