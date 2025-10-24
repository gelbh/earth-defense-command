import levels from "../data/levels.js";

class LevelService {
  constructor() {
    this.levels = levels;
  }

  // Get all level definitions (without spoiling objectives)
  getAllLevels() {
    return this.levels.map((level) => ({
      id: level.id,
      name: level.name,
      description: level.description,
      type: level.type,
      difficulty: level.difficulty,
      // Don't reveal wave details or objectives to avoid spoilers
    }));
  }

  // Get specific level by ID
  getLevel(levelId) {
    const level = this.levels.find((l) => l.id === parseInt(levelId));
    if (!level) {
      throw new Error(`Level ${levelId} not found`);
    }
    return level;
  }

  // Check if level is unlocked for player
  isLevelUnlocked(levelId, playerProgression) {
    // Level 1 is always unlocked
    if (levelId === 1) return true;

    // Check if player has completed previous level
    const unlockedLevels = playerProgression?.unlockedLevels || [1];
    return unlockedLevels.includes(levelId);
  }

  // Initialize level state for gameplay
  initializeLevelState(levelId) {
    const level = this.getLevel(levelId);

    // Create game state from level config
    const levelState = {
      // Level identification
      currentLevel: level.id,
      levelName: level.name,
      levelType: level.type,
      levelDifficulty: level.difficulty,

      // Level timing
      levelStartTime: Date.now(),
      levelTimeElapsed: 0,
      levelComplete: false,
      levelFailed: false,

      // Resources from level config
      funds: level.startingResources.funds,
      power: level.startingResources.power,
      availableProbes: level.startingResources.availableProbes,

      // Assets from level config (create IDs)
      satellites: level.startingResources.satellites.map((sat, idx) => ({
        id: `sat-level-${level.id}-${idx}`,
        ...sat,
        type: "standard",
        health: 100,
        powerDrain: 5,
      })),
      probes: level.startingResources.probes.map((probe, idx) => ({
        id: `probe-level-${level.id}-${idx}`,
        ...probe,
        type: "kinetic",
        health: 100,
        orbitLayer: Math.floor(idx / 6),
        fireArc: Math.PI,
      })),

      // Level objectives (deep copy to track progress)
      levelObjectives: JSON.parse(JSON.stringify(level.objectives)),

      // Wave system
      currentWave: 0,
      totalWaves: level.waves.length,
      nextWaveTime: null,
      waveTimer: 0,
      wavesConfig: level.waves,

      // Active threats
      threats: [],

      // Performance tracking
      levelPerformance: {
        asteroidsDestroyed: 0,
        asteroidsMissed: 0,
        asteroidsFragmented: 0,
        asteroidsBurnedUp: 0,
        accuracy: 1.0,
        timeElapsed: 0,
        fundsSpent: 0,
        damageTaken: 0,
        satellitesDeployed: 0,
        probesLaunched: 0,
      },

      // Game state essentials
      earthHealth: 100,
      reputation: 100,
      score: 0,
      events: [],

      // Restrictions
      restrictions: level.restrictions || {},

      // Misc
      upgrades: {
        aiTracking: false,
        improvedRadar: false,
        quantumDrive: false,
        publicSupport: false,
      },
    };

    return levelState;
  }

  // Spawn asteroids for a specific wave
  spawnWave(waveConfig, waveNumber) {
    const events = [];

    waveConfig.asteroids.forEach((asteroidData, idx) => {
      // Generate unique ID
      const asteroidId = `wave-${waveNumber}-asteroid-${idx}-${Date.now()}`;
      const asteroidName = this.generateAsteroidName(waveNumber, idx);

      // Create asteroid threat event
      const asteroid = {
        id: asteroidData.id,
        name: asteroidName,
        diameter: asteroidData.diameter,
        velocity: asteroidData.velocity,
        distance: asteroidData.distance,
        missDistance: Math.random() * 10000 + 5000, // Will likely hit
        isHazardous: asteroidData.diameter > 100,
        approachAngle: asteroidData.approachAngle,
        polarAngle: asteroidData.polarAngle,
        timeToImpact: asteroidData.distance / (asteroidData.velocity * 60), // Rough estimate
        detectedAt: 0, // Will be set when spawned
        impactProbability: 0.8,
        waveNumber: waveNumber,
      };

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(asteroid);

      events.push({
        id: `asteroid_${asteroidId}`,
        type: "asteroid_detected",
        severity: riskLevel,
        title: `⚠️ ${asteroidName} Detected`,
        description: `Wave ${waveNumber} | ${Math.round(
          asteroidData.diameter
        )}m | ${Math.round(asteroidData.velocity)} km/s`,
        data: asteroid,
        timestamp: new Date().toISOString(),
        requiresAction: true,
      });
    });

    return events;
  }

  // Generate procedural asteroid names
  generateAsteroidName(waveNumber, asteroidIndex) {
    const year = 2000 + Math.floor(Math.random() * 25);
    const letter1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const letter2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const number = (waveNumber * 100 + asteroidIndex)
      .toString()
      .padStart(3, "0");
    return `(${year}) ${letter1}${letter2}${number}`;
  }

  // Calculate risk level for asteroid
  calculateRiskLevel(asteroid) {
    let riskScore = 0;

    // Size factor
    if (asteroid.diameter > 500) riskScore += 40;
    else if (asteroid.diameter > 200) riskScore += 30;
    else if (asteroid.diameter > 100) riskScore += 20;
    else if (asteroid.diameter > 50) riskScore += 10;
    else riskScore += 5;

    // Velocity factor
    if (asteroid.velocity > 25) riskScore += 30;
    else if (asteroid.velocity > 20) riskScore += 20;
    else if (asteroid.velocity > 15) riskScore += 10;
    else riskScore += 5;

    // Distance factor (closer = more dangerous)
    if (asteroid.distance < 1000000) riskScore += 30;
    else if (asteroid.distance < 2000000) riskScore += 15;
    else riskScore += 5;

    // Classify risk
    if (riskScore >= 70) return "critical";
    if (riskScore >= 40) return "moderate";
    return "low";
  }

  // Check if objectives are completed
  checkObjectives(gameState, level) {
    const objectives = gameState.levelObjectives;
    const performance = gameState.levelPerformance;

    objectives.forEach((objective) => {
      if (objective.completed) return; // Skip already completed

      switch (objective.type) {
        case "destroy_asteroids":
          objective.current = performance.asteroidsDestroyed;
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "destroy_large":
          // Tracked separately in performance
          objective.current = performance.asteroidsDestroyed; // Simplified for now
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "fragment_asteroids":
          objective.current = performance.asteroidsFragmented;
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "atmospheric_burnup":
          objective.current = performance.asteroidsBurnedUp;
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "maintain_health":
          objective.current = gameState.earthHealth;
          if (gameState.earthHealth >= objective.threshold) {
            objective.completed = true;
          }
          break;

        case "survive_waves":
          objective.current = gameState.currentWave;
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "survive_time":
          objective.current = Math.floor(
            (Date.now() - gameState.levelStartTime) / 1000
          );
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "perfect_clear":
          objective.current = performance.asteroidsMissed;
          // Must have 0 misses
          if (performance.asteroidsMissed === 0) {
            objective.completed = true;
          } else if (performance.asteroidsMissed > objective.allowedMisses) {
            objective.completed = false;
            objective.failed = true;
          }
          break;

        case "resource_limit":
          objective.current = performance.fundsSpent;
          if (performance.fundsSpent <= objective.maxSpent) {
            objective.completed = true;
          } else {
            objective.failed = true;
          }
          break;

        case "deploy_satellite":
          objective.current = performance.satellitesDeployed;
          if (objective.current >= objective.target) {
            objective.completed = true;
          }
          break;

        case "accuracy":
          objective.current = performance.accuracy;
          if (performance.accuracy >= objective.threshold) {
            objective.completed = true;
          }
          break;
      }
    });

    return objectives;
  }

  // Check victory conditions
  checkVictory(gameState) {
    const objectives = gameState.levelObjectives;

    // All waves must be complete
    if (gameState.currentWave < gameState.totalWaves) {
      return false;
    }

    // All threats must be cleared
    if (gameState.threats.length > 0) {
      return false;
    }

    // Check all objectives
    const allObjectivesComplete = objectives.every((obj) => {
      // For maintain_health, check at end
      if (obj.type === "maintain_health") {
        return gameState.earthHealth >= obj.threshold;
      }
      // For perfect_clear, ensure no failures
      if (obj.type === "perfect_clear") {
        return gameState.levelPerformance.asteroidsMissed <= obj.allowedMisses;
      }
      // For resource_limit, check spending
      if (obj.type === "resource_limit") {
        return gameState.levelPerformance.fundsSpent <= obj.maxSpent;
      }
      return obj.completed;
    });

    return allObjectivesComplete;
  }

  // Check failure conditions
  checkFailure(gameState) {
    // Earth health depleted
    if (gameState.earthHealth <= 0) {
      return { failed: true, reason: "Earth health depleted" };
    }

    // Check for failed objectives
    const failedObjectives = gameState.levelObjectives.filter(
      (obj) => obj.failed
    );
    if (failedObjectives.length > 0) {
      return {
        failed: true,
        reason: `Objective failed: ${failedObjectives[0].description}`,
      };
    }

    return { failed: false };
  }

  // Calculate star rating based on performance
  calculateStars(gameState, level) {
    const performance = gameState.levelPerformance;
    const thresholds = level.rewards.starsThreshold;

    // Check 3-star requirements
    const meetsThreeStar =
      this.checkStarThreshold(gameState, performance, thresholds[3]) &&
      this.checkStarThreshold(gameState, performance, thresholds[2]) &&
      this.checkStarThreshold(gameState, performance, thresholds[1]);

    if (meetsThreeStar) return 3;

    // Check 2-star requirements
    const meetsTwoStar =
      this.checkStarThreshold(gameState, performance, thresholds[2]) &&
      this.checkStarThreshold(gameState, performance, thresholds[1]);

    if (meetsTwoStar) return 2;

    // Check 1-star requirements
    const meetsOneStar = this.checkStarThreshold(
      gameState,
      performance,
      thresholds[1]
    );

    if (meetsOneStar) return 1;

    return 0; // Technically completed but no stars?
  }

  // Check individual star threshold
  checkStarThreshold(gameState, performance, threshold) {
    if (threshold.objectivesCompleted !== undefined) {
      const completed = gameState.levelObjectives.filter(
        (obj) => obj.completed
      ).length;
      if (completed < threshold.objectivesCompleted) return false;
    }

    if (threshold.healthRemaining !== undefined) {
      if (gameState.earthHealth < threshold.healthRemaining) return false;
    }

    if (threshold.asteroidsHit !== undefined) {
      if (performance.asteroidsMissed > threshold.asteroidsHit) return false;
    }

    if (threshold.timeUnder !== undefined) {
      if (performance.timeElapsed > threshold.timeUnder) return false;
    }

    if (threshold.fundsSpent !== undefined) {
      if (performance.fundsSpent > threshold.fundsSpent) return false;
    }

    return true;
  }

  // Generate level results
  generateResults(gameState, level) {
    const timeElapsed = Math.floor(
      (Date.now() - gameState.levelStartTime) / 1000
    );
    gameState.levelPerformance.timeElapsed = timeElapsed;

    const stars = this.calculateStars(gameState, level);
    const objectivesCompleted = gameState.levelObjectives.filter(
      (obj) => obj.completed
    ).length;

    return {
      levelId: level.id,
      levelName: level.name,
      victory: true,
      stars: stars,
      objectives: gameState.levelObjectives,
      objectivesCompleted: objectivesCompleted,
      totalObjectives: gameState.levelObjectives.length,
      performance: {
        ...gameState.levelPerformance,
        timeElapsed: timeElapsed,
      },
      rewards: {
        score: gameState.score,
        gems: this.calculateGemsReward(stars, level),
        unlocks: this.getUnlocks(stars, level),
      },
      statistics: {
        finalEarthHealth: gameState.earthHealth,
        finalFunds: gameState.funds,
        finalReputation: gameState.reputation,
      },
    };
  }

  // Calculate gems reward based on stars
  calculateGemsReward(stars, level) {
    const baseGems = level.rewards.gems || 50;
    const starMultiplier = stars === 3 ? 1.5 : stars === 2 ? 1.2 : 1.0;
    return Math.floor(baseGems * starMultiplier);
  }

  // Get unlocks based on completion
  getUnlocks(stars, level) {
    const unlocks = [...(level.rewards.unlocks || [])];

    // Add next level if not already included
    const nextLevelId = level.id + 1;
    const nextLevelKey = `level_${nextLevelId}`;
    if (!unlocks.includes(nextLevelKey) && nextLevelId <= this.levels.length) {
      unlocks.push(nextLevelKey);
    }

    return unlocks;
  }

  // Update player progression after level completion
  updateProgression(playerProgression, levelResults) {
    // Initialize if needed
    if (!playerProgression) {
      playerProgression = {
        unlockedLevels: [1],
        levelStars: {},
        levelBestTimes: {},
        totalStars: 0,
        gems: 0,
        unlockedAssets: {
          satellites: ["standard"],
          probes: ["kinetic"],
          abilities: [],
        },
      };
    }

    const levelId = levelResults.levelId;

    // Update stars (only if better than previous)
    const previousStars = playerProgression.levelStars[levelId] || 0;
    if (levelResults.stars > previousStars) {
      playerProgression.levelStars[levelId] = levelResults.stars;
      playerProgression.totalStars += levelResults.stars - previousStars;
    }

    // Update best time (only if better than previous)
    const previousBestTime =
      playerProgression.levelBestTimes[levelId] || Infinity;
    if (levelResults.performance.timeElapsed < previousBestTime) {
      playerProgression.levelBestTimes[levelId] =
        levelResults.performance.timeElapsed;
    }

    // Add gems
    playerProgression.gems += levelResults.rewards.gems;

    // Process unlocks
    levelResults.rewards.unlocks.forEach((unlock) => {
      if (unlock.startsWith("level_")) {
        const unlockLevelId = parseInt(unlock.split("_")[1]);
        if (!playerProgression.unlockedLevels.includes(unlockLevelId)) {
          playerProgression.unlockedLevels.push(unlockLevelId);
        }
      } else if (unlock.endsWith("_satellite")) {
        const satelliteType = unlock.replace("_satellite", "");
        if (
          !playerProgression.unlockedAssets.satellites.includes(satelliteType)
        ) {
          playerProgression.unlockedAssets.satellites.push(satelliteType);
        }
      } else if (unlock.endsWith("_probe")) {
        const probeType = unlock.replace("_probe", "");
        if (!playerProgression.unlockedAssets.probes.includes(probeType)) {
          playerProgression.unlockedAssets.probes.push(probeType);
        }
      } else if (unlock.endsWith("_ability")) {
        const abilityType = unlock.replace("_ability", "");
        if (!playerProgression.unlockedAssets.abilities.includes(abilityType)) {
          playerProgression.unlockedAssets.abilities.push(abilityType);
        }
      }
    });

    // Sort unlocked levels
    playerProgression.unlockedLevels.sort((a, b) => a - b);

    return playerProgression;
  }
}

export default new LevelService();
