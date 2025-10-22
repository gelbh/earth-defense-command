import nasaService from './nasaService.js';

class GameService {
  constructor() {
    this.gameState = {
      day: 1,
      score: 0,
      funds: 1000000, // $1M starting funds
      power: 100, // Power percentage
      satellites: 2, // Satellites DEPLOYED in orbit (visible in 3D)
      probes: 1, // Probes DEPLOYED in orbit (visible in 3D)
      availableProbes: 2, // Probes available for deflection missions
      researchTeams: 1, // Active research teams
      upgrades: {
        aiTracking: false,
        improvedRadar: false,
        quantumDrive: false,
        publicSupport: false
      },
      events: [],
      threats: [],
      earthDamage: 0,
      reputation: 100
    };
    
    this.eventTypes = [
      'asteroid_detected',
      'solar_flare',
      'satellite_malfunction',
      'unknown_object',
      'communication_blackout'
    ];
  }

  // Get current game state
  getGameState() {
    return this.gameState;
  }

  // Update game state
  updateGameState(updates) {
    this.gameState = { ...this.gameState, ...updates };
    return this.gameState;
  }

  // Generate new game events
  async generateEvents() {
    const events = [];
    
    try {
      // Get real NEO data
      const asteroids = await nasaService.getNearEarthObjects(7);
      
      // Convert asteroids to game events
      asteroids.forEach(asteroid => {
        const riskLevel = nasaService.calculateRiskLevel(asteroid);
        if (riskLevel !== 'safe') {
          events.push({
            id: `asteroid_${asteroid.id}`,
            type: 'asteroid_detected',
            severity: riskLevel,
            title: `Asteroid ${asteroid.name} Detected`,
            description: `Asteroid ${asteroid.name} is approaching Earth. Diameter: ${Math.round(asteroid.diameter)}m, Velocity: ${Math.round(asteroid.velocity)} km/s, Miss Distance: ${Math.round(asteroid.missDistance / 1000)}k km`,
            data: asteroid,
            timestamp: new Date().toISOString(),
            requiresAction: true
          });
        }
      });

      // Add some random events for variety
      if (Math.random() < 0.3) {
        events.push(this.generateRandomEvent());
      }

      // Add new events to game state
      this.gameState.events = [...events, ...this.gameState.events].slice(0, 50); // Keep last 50 events
      this.gameState.threats = events.filter(e => e.type === 'asteroid_detected');

      return events;
    } catch (error) {
      // Silently use simulated data when NASA API is unavailable
      const simulatedEvents = this.generateSimulatedAsteroidEvents();
      this.gameState.events = [...simulatedEvents, ...this.gameState.events].slice(0, 50);
      this.gameState.threats = simulatedEvents.filter(e => e.type === 'asteroid_detected');
      
      return simulatedEvents;
    }
  }

  // Generate simulated asteroid events with approach mechanics
  generateSimulatedAsteroidEvents() {
    const events = [];
    const numAsteroids = Math.floor(Math.random() * 3) + 1; // 1-3 asteroids
    
    for (let i = 0; i < numAsteroids; i++) {
      const diameter = Math.floor(Math.random() * 500) + 50; // 50-550m
      const velocity = Math.floor(Math.random() * 20) + 5; // 5-25 km/s
      const distance = Math.floor(Math.random() * 3000000) + 500000; // 0.5M-3.5M km from Earth
      const isHazardous = Math.random() < 0.3;
      
      // Calculate time to impact (in game minutes - faster for gameplay)
      // Real: distance (km) / velocity (km/s) / 60 = minutes
      // For gameplay, we'll scale it down
      const realMinutes = (distance / velocity) / 60;
      const gameMinutes = realMinutes / 60; // 1 hour in real = 1 minute in game
      
      // Random approach angle (where it's coming from)
      const approachAngle = Math.random() * Math.PI * 2;
      
      const asteroidId = `SIM-${Date.now()}-${i}`;
      const asteroidName = `(${2000 + Math.floor(Math.random() * 25)}) ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999)}`;
      
      const asteroid = {
        id: asteroidId,
        name: asteroidName,
        diameter,
        velocity,
        distance, // Current distance from Earth
        missDistance: Math.random() * 20000 + 5000, // Will it hit? (very close miss distance = likely hit)
        isHazardous,
        // Approach mechanics
        approachAngle, // Direction it's coming from (radians)
        timeToImpact: gameMinutes, // Minutes until impact
        detectedAt: Date.now(), // When we first saw it
        impactProbability: this.calculateImpactProbability(diameter, distance)
      };
      
      const riskLevel = nasaService.calculateRiskLevel(asteroid);
      
      if (riskLevel !== 'safe') {
        events.push({
          id: `asteroid_${asteroidId}`,
          type: 'asteroid_detected',
          severity: riskLevel,
          title: `⚠️ ${asteroidName} Approaching`,
          description: `INCOMING! ETA: ${gameMinutes.toFixed(1)} min | ${Math.round(diameter)}m | ${Math.round(velocity)} km/s | ${Math.round(distance / 1000)}k km`,
          data: asteroid,
          timestamp: new Date().toISOString(),
          requiresAction: true
        });
      }
    }
    
    // Add a random event too
    if (Math.random() < 0.5) {
      events.push(this.generateRandomEvent());
    }
    
    return events;
  }
  
  // Calculate impact probability based on size and distance
  calculateImpactProbability(diameter, distance) {
    // Larger asteroids detected further out = lower initial probability
    // Smaller asteroids detected close = higher probability (less time)
    let baseProbability = 0.3;
    
    if (distance < 1000000) baseProbability += 0.3; // Very close!
    if (diameter > 200) baseProbability += 0.2; // Large and dangerous
    
    return Math.min(0.9, baseProbability); // Cap at 90%
  }

  // Generate random events for game variety
  generateRandomEvent() {
    const eventType = this.eventTypes[Math.floor(Math.random() * this.eventTypes.length)];
    const severities = ['low', 'moderate', 'critical'];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const eventTemplates = {
      solar_flare: {
        title: 'Solar Flare Detected',
        description: 'A solar flare is disrupting satellite communications. Radar coverage reduced temporarily.',
        requiresAction: true
      },
      satellite_malfunction: {
        title: 'Satellite Malfunction',
        description: 'One of our monitoring satellites has malfunctioned. Detection capabilities reduced.',
        requiresAction: true
      },
      unknown_object: {
        title: 'Unknown Object Detected',
        description: 'An unidentified object has been detected in Earth\'s vicinity. Requires investigation.',
        requiresAction: true
      },
      communication_blackout: {
        title: 'Communication Blackout',
        description: 'Solar interference is causing communication issues with deep space probes.',
        requiresAction: false
      }
    };

    const template = eventTemplates[eventType] || eventTemplates.unknown_object;

    return {
      id: `${eventType}_${Date.now()}`,
      type: eventType,
      severity: severity,
      title: template.title,
      description: template.description,
      timestamp: new Date().toISOString(),
      requiresAction: template.requiresAction
    };
  }

  // Process player action
  processAction(action) {
    const { type, targetId, resource } = action;
    let result = { success: false, message: '', scoreChange: 0 };

    switch (type) {
      case 'deploy_satellite':
        if (this.gameState.funds < 150000) {
          result.message = 'Insufficient funds ($150K required)';
          break;
        }
        if (this.gameState.power < 10) {
          result.message = 'Insufficient power (10% required)';
          break;
        }
        this.gameState.satellites++; // ADD a satellite to orbit
        this.gameState.funds -= 150000;
        this.gameState.power -= 10;
        result.success = true;
        result.message = 'New satellite deployed to orbit';
        result.scoreChange = 50;
        break;

      case 'launch_probe':
        if (this.gameState.funds < 200000) {
          result.message = 'Insufficient funds ($200K required)';
          break;
        }
        this.gameState.probes++; // ADD a probe to orbit
        this.gameState.availableProbes++; // Also add to available for deflection
        this.gameState.funds -= 200000;
        result.success = true;
        result.message = 'New probe launched to orbit';
        result.scoreChange = 100;
        break;

      case 'research':
        if (this.gameState.researchTeams <= 0) {
          result.message = 'No research teams available';
          break;
        }
        this.gameState.funds -= 50000;
        result.success = true;
        result.message = 'Research initiated';
        result.scoreChange = 25;
        break;

      case 'deflect_asteroid':
        const threat = this.gameState.threats.find(t => t.id === targetId);
        if (!threat) {
          result.message = 'Threat not found';
          break;
        }
        
        if (this.gameState.availableProbes <= 0) {
          result.message = 'No probes available for deflection mission';
          break;
        }

        this.gameState.availableProbes--; // Use an available probe
        // Note: probe stays in orbit, just used for this mission
        
        // Calculate success based on asteroid size and player upgrades
        const successChance = this.calculateDeflectionSuccess(threat.data);
        const success = Math.random() < successChance;
        
        if (success) {
          result.success = true;
          result.message = `Successfully deflected ${threat.data.name}`;
          result.scoreChange = 300;
          this.gameState.reputation += 10;
          
          // Remove threat
          this.gameState.threats = this.gameState.threats.filter(t => t.id !== targetId);
        } else {
          result.success = false;
          result.message = `Failed to deflect ${threat.data.name}`;
          result.scoreChange = -100;
          this.gameState.earthDamage += 5;
          this.gameState.reputation -= 5;
        }
        break;

      default:
        result.message = 'Unknown action type';
    }

    // Update score
    this.gameState.score += result.scoreChange;
    
    // Check for game over conditions
    if (this.gameState.earthDamage >= 100) {
      result.gameOver = true;
      result.message = 'Earth has sustained too much damage. Mission failed.';
    }

    return result;
  }

  // Calculate deflection success probability
  calculateDeflectionSuccess(asteroid) {
    let baseChance = 0.7; // 70% base success rate
    
    // Reduce chance for larger asteroids
    if (asteroid.diameter > 1000) baseChance -= 0.3;
    else if (asteroid.diameter > 500) baseChance -= 0.2;
    else if (asteroid.diameter > 100) baseChance -= 0.1;
    
    // Reduce chance for faster asteroids
    if (asteroid.velocity > 20) baseChance -= 0.2;
    else if (asteroid.velocity > 15) baseChance -= 0.1;
    
    // Increase chance with upgrades
    if (this.gameState.upgrades.aiTracking) baseChance += 0.1;
    if (this.gameState.upgrades.improvedRadar) baseChance += 0.1;
    
    return Math.max(0.1, Math.min(0.95, baseChance)); // Clamp between 10% and 95%
  }

  // Purchase upgrade
  purchaseUpgrade(upgradeType) {
    const upgradeCosts = {
      aiTracking: 500000,
      improvedRadar: 300000,
      quantumDrive: 400000,
      publicSupport: 200000
    };

    const cost = upgradeCosts[upgradeType];
    if (!cost) {
      return { success: false, message: 'Invalid upgrade type' };
    }

    if (this.gameState.funds < cost) {
      return { success: false, message: 'Insufficient funds' };
    }

    if (this.gameState.upgrades[upgradeType]) {
      return { success: false, message: 'Upgrade already purchased' };
    }

    this.gameState.funds -= cost;
    this.gameState.upgrades[upgradeType] = true;

    // Apply upgrade effects
    switch (upgradeType) {
      case 'aiTracking':
        this.gameState.satellites += 1;
        break;
      case 'improvedRadar':
        this.gameState.power += 20;
        break;
      case 'quantumDrive':
        this.gameState.availableProbes += 2; // Quantum tech gives 2 extra deflection missions
        break;
      case 'publicSupport':
        this.gameState.funds += 100000; // Bonus funds
        break;
    }

    return { success: true, message: `${upgradeType} upgrade purchased successfully` };
  }

  // Advance to next day
  async advanceDay() {
    this.gameState.day++;
        // Process unhandled threats - they cause damage!
    const criticalThreats = this.gameState.threats.filter(t => t.severity === 'critical');
    const moderateThreats = this.gameState.threats.filter(t => t.severity === 'moderate');
    
    if (criticalThreats.length > 0) {
      const damage = criticalThreats.length * 15; // 15% damage per critical threat
      this.gameState.earthDamage += damage;
      this.gameState.reputation -= criticalThreats.length * 10;
      this.gameState.score -= criticalThreats.length * 200;
    }
    
    if (moderateThreats.length > 0) {
      const damage = moderateThreats.length * 8; // 8% damage per moderate threat
      this.gameState.earthDamage += damage;
      this.gameState.reputation -= moderateThreats.length * 5;
      this.gameState.score -= moderateThreats.length * 100;
    }
    
    // Clear old threats after processing
    this.gameState.threats = [];
    
    // Restore some resources daily
    this.gameState.power = Math.min(100, this.gameState.power + 20);
    // Satellites and orbital probes stay deployed - they don't replenish
    // But available probe missions restore
    this.gameState.availableProbes = Math.min(
      this.gameState.probes, // Can't have more available than deployed
      this.gameState.availableProbes + 1
    );
    
    // Generate daily funds (bonus based on reputation)
    const fundBonus = Math.max(0, this.gameState.reputation) * 500;
    this.gameState.funds += 50000 + fundBonus;
    
    // Reduce earth damage slightly (healing) - only if no unhandled threats
    if (criticalThreats.length === 0 && moderateThreats.length === 0) {
      this.gameState.earthDamage = Math.max(0, this.gameState.earthDamage - 2);
    }
    
    // Cap earth damage at 100%
    this.gameState.earthDamage = Math.min(100, this.gameState.earthDamage);
    
    // Generate new events for the new day
    await this.generateEvents();
    
    return this.gameState;
  }

  // Reset game
  async resetGame() {
    this.gameState = {
      day: 1,
      score: 0,
      funds: 1000000,
      power: 100,
      satellites: 3,
      probes: 2,
      researchTeams: 1,
      upgrades: {
        aiTracking: false,
        improvedRadar: false,
        quantumDrive: false,
        publicSupport: false
      },
      events: [],
      threats: [],
      earthDamage: 0,
      reputation: 100
    };
    
    // Generate initial events for the new game
    await this.generateEvents();
    
    return this.gameState;
  }
}

export default new GameService();
