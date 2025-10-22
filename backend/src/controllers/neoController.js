import nasaService from '../services/nasaService.js';

export const getNearEarthObjects = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const asteroids = await nasaService.getNearEarthObjects(parseInt(days));
    
    // Add risk levels to asteroids
    const asteroidsWithRisk = asteroids.map(asteroid => ({
      ...asteroid,
      riskLevel: nasaService.calculateRiskLevel(asteroid)
    }));

    res.json({
      success: true,
      asteroids: asteroidsWithRisk,
      count: asteroidsWithRisk.length
    });
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NEO data',
      error: error.message
    });
  }
};

export const getAsteroidDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Asteroid ID is required'
      });
    }

    // For now, we'll get all asteroids and find the one with matching ID
    // In a real implementation, you might want to cache individual asteroid details
    const asteroids = await nasaService.getNearEarthObjects(30);
    const asteroid = asteroids.find(a => a.id === id);

    if (!asteroid) {
      return res.status(404).json({
        success: false,
        message: 'Asteroid not found'
      });
    }

    const asteroidWithRisk = {
      ...asteroid,
      riskLevel: nasaService.calculateRiskLevel(asteroid)
    };

    res.json({
      success: true,
      asteroid: asteroidWithRisk
    });
  } catch (error) {
    console.error('Error fetching asteroid details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asteroid details',
      error: error.message
    });
  }
};
