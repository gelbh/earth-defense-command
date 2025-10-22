import express from "express";
import {
  getExoplanets,
  searchExoplanets,
  getDiscoveryTimeline,
  getDiscoveryMethods,
  getSizeDistribution,
} from "../controllers/exoplanetController.js";

const router = express.Router();

router.get("/exoplanets", getExoplanets);
router.get("/exoplanets/search", searchExoplanets);
router.get("/stats/timeline", getDiscoveryTimeline);
router.get("/stats/methods", getDiscoveryMethods);
router.get("/stats/sizes", getSizeDistribution);

export default router;
