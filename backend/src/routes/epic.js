import express from 'express';
import {
  getLatestEarthImage,
  getEarthImages,
  proxyImage
} from '../controllers/epicController.js';

const router = express.Router();

// EPIC (Earth Polychromatic Imaging Camera) routes
router.get('/latest', getLatestEarthImage);
router.get('/images', getEarthImages);
router.get('/proxy', proxyImage); // CORS proxy for NASA images

export default router;
