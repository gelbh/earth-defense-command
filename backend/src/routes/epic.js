import express from 'express';
import {
  getLatestEarthImage,
  getEarthImages
} from '../controllers/epicController.js';

const router = express.Router();

// EPIC (Earth Polychromatic Imaging Camera) routes
router.get('/latest', getLatestEarthImage);
router.get('/images', getEarthImages);

export default router;
