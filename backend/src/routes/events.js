import express from 'express';
import {
  getEvents,
  getGameState,
  processAction,
  purchaseUpgrade,
  advanceDay,
  resetGame,
  getApiStatus
} from '../controllers/eventsController.js';

const router = express.Router();

// Game events and state routes
router.get('/', getEvents);  // GET /api/events
router.get('/state', getGameState);
router.get('/api-status', getApiStatus); // NASA API status check
router.post('/action', processAction);
router.post('/upgrade', purchaseUpgrade);
router.post('/advance-day', advanceDay);
router.post('/reset', resetGame);

export default router;
