import express from 'express';
import { getExoplanets, searchExoplanets } from '../controllers/exoplanetController.js';

const router = express.Router();

router.get('/exoplanets', getExoplanets);
router.get('/exoplanets/search', searchExoplanets);

export default router;
