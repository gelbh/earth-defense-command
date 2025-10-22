import express from 'express';
import {
  getEvents,
  getGameState,
  processAction,
  purchaseUpgrade,
  advanceDay,
  resetGame
} from '../controllers/eventsController.js';

const router = express.Router();

// Game events and state routes
router.get('/events', getEvents);
router.get('/state', getGameState);
router.post('/action', processAction);
router.post('/upgrade', purchaseUpgrade);
router.post('/advance-day', advanceDay);
router.post('/reset', resetGame);

export default router;
