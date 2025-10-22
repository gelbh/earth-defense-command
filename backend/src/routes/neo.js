import express from 'express';
import {
  getNearEarthObjects,
  getAsteroidDetails
} from '../controllers/neoController.js';

const router = express.Router();

// NEO (Near Earth Object) routes
router.get('/asteroids', getNearEarthObjects);
router.get('/asteroids/:id', getAsteroidDetails);

export default router;
