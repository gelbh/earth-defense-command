import nasaService from './nasaService.js';

class GameService {
  constructor() {
    this.gameState = {
      day: 1,
      score: 0,
      funds: 1000000, // $1M starting funds
      power: 100, // Power percentage
      satellites: 3, // Available satellites
      probes: 2, // Available probes
      researchTeams: 1, // Available research teams
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
      console.error('Error generating events:', error.message);
      
      // Generate simulated asteroid events when NASA API fails
      const simulatedEvents = this.generateSimulatedAsteroidEvents();
      this.gameState.events = [...simulatedEvents, ...this.gameState.events].slice(0, 50);
      this.gameState.threats = simulatedEvents.filter(e => e.type === 'asteroid_detected');
      
      return simulatedEvents;
    }
  }

  // Generate simulated asteroid events (fallback when NASA API fails)
  generateSimulatedAsteroidEvents() {
    const events = [];
    const numAsteroids = Math.floor(Math.random() * 3) + 1; // 1-3 asteroids
    
    for (let i = 0; i < numAsteroids; i++) {
      const diameter = Math.floor(Math.random() * 500) + 50; // 50-550m
      const velocity = Math.floor(Math.random() * 20) + 5; // 5-25 km/s
      const missDistance = Math.floor(Math.random() * 5000000) + 500000; // 500k-5.5M km
      const isHazardous = Math.random() < 0.3;
      
      const asteroidId = `SIM-${Date.now()}-${i}`;
      const asteroidName = `(${2000 + Math.floor(Math.random() * 25)}) ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999)}`;
      
      const asteroid = {
        id: asteroidId,
        name: asteroidName,
        diameter,
        velocity,
        missDistance,
        isHazardous
      };
      
      const riskLevel = nasaService.calculateRiskLevel(asteroid);
      
      if (riskLevel !== 'safe') {
        events.push({
          id: `asteroid_${asteroidId}`,
          type: 'asteroid_detected',
          severity: riskLevel,
          title: `Asteroid ${asteroidName} Detected`,
          description: `Simulated asteroid approaching Earth. Diameter: ${Math.round(diameter)}m, Velocity: ${Math.round(velocity)} km/s, Miss Distance: ${Math.round(missDistance / 1000)}k km`,
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
        if (this.gameState.satellites <= 0) {
          result.message = 'No satellites available';
          break;
        }
        this.gameState.satellites--;
        this.gameState.power -= 10;
        result.success = true;
        result.message = 'Satellite deployed successfully';
        result.scoreChange = 50;
        break;

      case 'launch_probe':
        if (this.gameState.probes <= 0) {
          result.message = 'No probes available';
          break;
        }
        this.gameState.probes--;
        this.gameState.funds -= 100000;
        result.success = true;
        result.message = 'Probe launched successfully';
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
        
        if (this.gameState.probes <= 0) {
          result.message = 'No probes available for deflection';
          break;
        }

        this.gameState.probes--;
        this.gameState.funds -= 200000;
        
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
        this.gameState.probes += 1;
        break;
      case 'publicSupport':
        this.gameState.funds += 100000; // Bonus funds
        break;
    }

    return { success: true, message: `${upgradeType} upgrade purchased successfully` };
  }

  // Advance to next day
  advanceDay() {
    this.gameState.day++;
    
    // Restore some resources daily
    this.gameState.power = Math.min(100, this.gameState.power + 20);
    this.gameState.satellites = Math.min(5, this.gameState.satellites + 1);
    
    // Generate daily funds
    this.gameState.funds += 50000;
    
    // Reduce earth damage slightly (healing)
    this.gameState.earthDamage = Math.max(0, this.gameState.earthDamage - 2);
    
    return this.gameState;
  }

  // Reset game
  resetGame() {
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
    
    return this.gameState;
  }
}

export default new GameService();
