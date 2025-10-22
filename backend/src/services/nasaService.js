import axios from "axios";

const NASA_TAP_API = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

// Cache for all exoplanets (since API doesn't support pagination)
let cachedExoplanets = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

class NasaService {
  async getAllExoplanetsFromAPI() {
    // Check cache first
    if (
      cachedExoplanets &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    ) {
      return cachedExoplanets;
    }

    // Fetch all exoplanets (ADQL doesn't support OFFSET, so we fetch all and slice)
    let query = `select pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist,pl_orbper,pl_eqt,pl_dens from ps where default_flag=1 order by pl_name`;

    const response = await axios.get(NASA_TAP_API, {
      params: {
        query: query,
        format: "json",
      },
    });

    cachedExoplanets = response.data;
    cacheTimestamp = Date.now();
    return cachedExoplanets;
  }

  async getExoplanets(params = {}) {
    try {
      const { where, order, limit = 50, offset = 0 } = params;

      // Get all exoplanets from cache/API
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Apply client-side filtering if needed
      let filtered = allExoplanets;
      if (where) {
        // Basic where clause support (can be expanded)
        filtered = allExoplanets.filter((planet) => {
          // Simple evaluation - can be enhanced
          return true; // For now, just return all
        });
      }

      // Apply client-side pagination
      const paginatedData = filtered.slice(offset, offset + limit);

      return paginatedData;
    } catch (error) {
      console.error("Error fetching exoplanets:", error.message);
      throw new Error("Failed to fetch exoplanet data from NASA API");
    }
  }

  async getExoplanetCount(params = {}) {
    try {
      const allExoplanets = await this.getAllExoplanetsFromAPI();
      return allExoplanets.length;
    } catch (error) {
      console.error("Error fetching exoplanet count:", error.message);
      throw new Error("Failed to fetch exoplanet count");
    }
  }

  async searchExoplanets(searchTerm, params = {}) {
    try {
      const { limit = 50, offset = 0 } = params;

      // Get all exoplanets from cache
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Filter by search term (case-insensitive)
      const searchLower = searchTerm.toLowerCase();
      const filtered = allExoplanets.filter(
        (planet) =>
          (planet.pl_name &&
            planet.pl_name.toLowerCase().includes(searchLower)) ||
          (planet.hostname &&
            planet.hostname.toLowerCase().includes(searchLower))
      );

      // Apply pagination
      const paginatedData = filtered.slice(offset, offset + limit);

      return paginatedData;
    } catch (error) {
      console.error("Error searching exoplanets:", error.message);
      throw new Error("Failed to search exoplanet data");
    }
  }

  async getSearchCount(searchTerm) {
    try {
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const filtered = allExoplanets.filter(
        (planet) =>
          (planet.pl_name &&
            planet.pl_name.toLowerCase().includes(searchLower)) ||
          (planet.hostname &&
            planet.hostname.toLowerCase().includes(searchLower))
      );

      return filtered.length;
    } catch (error) {
      console.error("Error fetching search count:", error.message);
      throw new Error("Failed to fetch search count");
    }
  }

  async getDiscoveryTimeline() {
    try {
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Group by discovery year
      const yearCounts = {};
      allExoplanets.forEach((planet) => {
        if (planet.disc_year) {
          const year = planet.disc_year;
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      });

      // Convert to array and sort by year
      const timeline = Object.entries(yearCounts)
        .map(([year, count]) => ({
          year: parseInt(year),
          count: count,
        }))
        .sort((a, b) => a.year - b.year);

      return timeline;
    } catch (error) {
      console.error("Error fetching discovery timeline:", error.message);
      throw new Error("Failed to fetch discovery timeline");
    }
  }

  async getDiscoveryMethods() {
    try {
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Group by discovery method
      const methodCounts = {};
      allExoplanets.forEach((planet) => {
        if (planet.discoverymethod) {
          const method = planet.discoverymethod;
          methodCounts[method] = (methodCounts[method] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const methods = Object.entries(methodCounts)
        .map(([method, count]) => ({
          method: method,
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      return methods;
    } catch (error) {
      console.error("Error fetching discovery methods:", error.message);
      throw new Error("Failed to fetch discovery methods");
    }
  }

  async getSizeDistribution() {
    try {
      const allExoplanets = await this.getAllExoplanetsFromAPI();

      // Categorize by size (based on radius in Earth radii)
      const sizeCategories = {
        "Small (< 1.5 R⊕)": 0,
        "Medium (1.5-2.5 R⊕)": 0,
        "Large (2.5-6 R⊕)": 0,
        "Giant (> 6 R⊕)": 0,
        Unknown: 0,
      };

      allExoplanets.forEach((planet) => {
        const radius = planet.pl_rade;
        if (!radius) {
          sizeCategories["Unknown"]++;
        } else if (radius < 1.5) {
          sizeCategories["Small (< 1.5 R⊕)"]++;
        } else if (radius < 2.5) {
          sizeCategories["Medium (1.5-2.5 R⊕)"]++;
        } else if (radius < 6) {
          sizeCategories["Large (2.5-6 R⊕)"]++;
        } else {
          sizeCategories["Giant (> 6 R⊕)"]++;
        }
      });

      // Convert to array
      const distribution = Object.entries(sizeCategories).map(
        ([category, count]) => ({
          category: category,
          count: count,
        })
      );

      return distribution;
    } catch (error) {
      console.error("Error fetching size distribution:", error.message);
      throw new Error("Failed to fetch size distribution");
    }
  }
}

export default new NasaService();
