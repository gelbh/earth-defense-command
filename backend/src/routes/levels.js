import express from "express";
import levelController from "../controllers/levelController.js";

const router = express.Router();

// Get all levels
router.get("/", levelController.getAllLevels);

// Get specific level
router.get("/:id", levelController.getLevel);

// Start a level
router.post("/:id/start", levelController.startLevel);

// Get level state (ongoing game)
router.get("/session/state", levelController.getLevelState);

// Process action within level
router.post("/session/action", levelController.processLevelAction);

// Complete level and get results
router.post("/session/complete", levelController.completeLevel);

// Update player progression
router.post("/progression/update", levelController.updateProgression);

// Handle atmospheric burnup
router.post("/session/burnup", levelController.handleBurnup);

export default router;
