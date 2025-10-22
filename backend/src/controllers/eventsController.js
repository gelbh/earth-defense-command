import gameService from '../services/gameService.js';
import nasaService from '../services/nasaService.js';

export const getEvents = async (req, res) => {
  try {
    const events = await gameService.generateEvents();
    res.json({
      success: true,
      events: events,
      gameState: gameService.getGameState()
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

export const getGameState = async (req, res) => {
  try {
    // Generate initial events if there are none
    const currentState = gameService.getGameState();
    if (currentState.threats.length === 0 && currentState.events.length === 0) {
      await gameService.generateEvents();
    }
    
    const gameState = gameService.getGameState();
    res.json({
      success: true,
      gameState: gameState
    });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game state',
      error: error.message
    });
  }
};

export const processAction = async (req, res) => {
  try {
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    const result = gameService.processAction(action);
    const gameState = gameService.getGameState();

    res.json({
      success: true,
      result: result,
      gameState: gameState
    });
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process action',
      error: error.message
    });
  }
};

export const purchaseUpgrade = async (req, res) => {
  try {
    const { upgradeType } = req.body;
    
    if (!upgradeType) {
      return res.status(400).json({
        success: false,
        message: 'Upgrade type is required'
      });
    }

    const result = gameService.purchaseUpgrade(upgradeType);
    const gameState = gameService.getGameState();

    res.json({
      success: true,
      result: result,
      gameState: gameState
    });
  } catch (error) {
    console.error('Error purchasing upgrade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase upgrade',
      error: error.message
    });
  }
};

export const advanceDay = async (req, res) => {
  try {
    const gameState = await gameService.advanceDay();
    res.json({
      success: true,
      gameState: gameState
    });
  } catch (error) {
    console.error('Error advancing day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to advance day',
      error: error.message
    });
  }
};

export const resetGame = async (req, res) => {
  try {
    const gameState = await gameService.resetGame();
    res.json({
      success: true,
      gameState: gameState
    });
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset game',
      error: error.message
    });
  }
};

export const getApiStatus = async (req, res) => {
  try {
    const status = nasaService.getApiStatus();
    res.json({
      success: true,
      status: status,
      message: status.isRateLimited 
        ? `NASA API is rate limited. Resets at ${status.resetTime}. Using simulated data.`
        : 'NASA API is operational. Real data available.'
    });
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get API status',
      error: error.message
    });
  }
};
