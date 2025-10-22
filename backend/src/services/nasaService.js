import axios from "axios";

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const NEO_API_BASE = "https://api.nasa.gov/neo/rest/v1";
const EPIC_API_BASE = "https://api.nasa.gov/EPIC/api";

// Cache for NASA data
let cachedNEOData = null;
let cachedEPICData = null;
let neoCacheTimestamp = null;
let epicCacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

class NasaService {
  async getNEOData(startDate, endDate) {
    // Check cache first
    if (
      cachedNEOData &&
      neoCacheTimestamp &&
      Date.now() - neoCacheTimestamp < CACHE_DURATION
    ) {
      return cachedNEOData;
    }

    try {
      const response = await axios.get(`${NEO_API_BASE}/feed`, {
        params: {
          start_date: startDate,
          end_date: endDate,
          api_key: NASA_API_KEY,
        },
      });

      cachedNEOData = response.data;
      neoCacheTimestamp = Date.now();
      return cachedNEOData;
    } catch (error) {
      console.error("Error fetching NEO data:", error.message);
      throw new Error("Failed to fetch NEO data from NASA API");
    }
  }

  async getEPICImages() {
    // Check cache first
    if (
      cachedEPICData &&
      epicCacheTimestamp &&
      Date.now() - epicCacheTimestamp < CACHE_DURATION
    ) {
      return cachedEPICData;
    }

    try {
      const response = await axios.get(`${EPIC_API_BASE}/natural/images`, {
        params: {
          api_key: NASA_API_KEY,
        },
      });

      cachedEPICData = response.data;
      epicCacheTimestamp = Date.now();
      return cachedEPICData;
    } catch (error) {
      console.error("Error fetching EPIC data:", error.message);
      throw new Error("Failed to fetch EPIC data from NASA API");
    }
  }

  async getNearEarthObjects(days = 7) {
    try {
      const today = new Date();
      const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
      
      const neoData = await this.getNEOData(
        startDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Extract and format NEO data for the game
      const asteroids = [];
      Object.values(neoData.near_earth_objects).forEach(dayAsteroids => {
        dayAsteroids.forEach(asteroid => {
          asteroids.push({
            id: asteroid.id,
            name: asteroid.name,
            diameter: asteroid.estimated_diameter?.meters?.estimated_diameter_max || 0,
            velocity: asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0,
            missDistance: asteroid.close_approach_data?.[0]?.miss_distance?.kilometers || 0,
            isHazardous: asteroid.is_potentially_hazardous_asteroid,
            approachDate: asteroid.close_approach_data?.[0]?.close_approach_date,
            orbitingBody: asteroid.close_approach_data?.[0]?.orbiting_body
          });
        });
      });

      return asteroids;
    } catch (error) {
      // Silently handle rate limits - game will use simulated data
      if (error.response?.status === 429) {
        console.log("NASA API rate limit reached - using simulated data");
      } else {
        console.error("Error fetching near Earth objects:", error.message);
      }
      // Throw error so game service knows to use simulated data
      throw new Error("Failed to fetch NEO data");
    }
  }

  async getLatestEarthImage() {
    try {
      const epicData = await this.getEPICImages();
      
      if (epicData && epicData.length > 0) {
        const latestImage = epicData[0];
        return {
          id: latestImage.identifier,
          date: latestImage.date,
          caption: latestImage.caption,
          imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${latestImage.date.split(' ')[0].replace(/-/g, '/')}/png/${latestImage.image}.png`
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching Earth image:", error.message);
      
      // Return a fallback placeholder when EPIC API fails (e.g., rate limit)
      return {
        id: 'fallback',
        date: new Date().toISOString(),
        caption: 'Earth (Placeholder - NASA EPIC temporarily unavailable)',
        imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=800&fit=crop'
      };
    }
  }

  // Helper method to calculate risk level for an asteroid
  calculateRiskLevel(asteroid) {
    const { diameter, velocity, missDistance, isHazardous } = asteroid;
    
    let riskScore = 0;
    
    // Size factor (larger = more dangerous)
    if (diameter > 1000) riskScore += 3;
    else if (diameter > 500) riskScore += 2;
    else if (diameter > 100) riskScore += 1;
    
    // Velocity factor (faster = more dangerous)
    if (velocity > 20) riskScore += 3;
    else if (velocity > 15) riskScore += 2;
    else if (velocity > 10) riskScore += 1;
    
    // Miss distance factor (closer = more dangerous)
    if (missDistance < 1000000) riskScore += 3; // Less than 1M km
    else if (missDistance < 5000000) riskScore += 2; // Less than 5M km
    else if (missDistance < 10000000) riskScore += 1; // Less than 10M km
    
    // Hazardous flag
    if (isHazardous) riskScore += 2;
    
    // Determine risk level
    if (riskScore >= 7) return 'critical';
    if (riskScore >= 4) return 'moderate';
    if (riskScore >= 2) return 'low';
    return 'safe';
  }
}

export default new NasaService();
