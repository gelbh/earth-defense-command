import nasaService from '../services/nasaService.js';
import gameService from '../services/gameService.js';

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
    const gameState = gameService.advanceDay();
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
    const gameState = gameService.resetGame();
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
