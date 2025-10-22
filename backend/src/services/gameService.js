import nasaService from './nasaService.js';

class GameService {
  constructor() {
    this.gameState = {
      day: 1,
      score: 0,
      funds: 1000000, // $1M starting funds
      power: 100, // Power percentage
      satellites: [], // Array of deployed satellites with properties
      probes: [], // Array of deployed probes with properties
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
    
    // Initialize starting satellites with detection capabilities
    this.gameState.satellites = [
      this.createSatellite(0),
      this.createSatellite(1)
    ];
    
    // Initialize starting probes
    this.gameState.probes = [
      this.createProbe(0)
    ];
    
    this.eventTypes = [
      'asteroid_detected',
      'solar_flare',
      'satellite_malfunction',
      'unknown_object',
      'communication_blackout'
    ];
  }

  // Create a satellite with detection capabilities
  createSatellite(index) {
    const totalSatellites = this.gameState.satellites.length + 1;
    const angleSpacing = (Math.PI * 2) / Math.max(3, totalSatellites); // Space evenly
    
    return {
      id: `sat-${Date.now()}-${index}`,
      orbitPosition: index * angleSpacing, // Angle in orbit (radians)
      detectionRadius: 3.5, // Base detection radius (game units)
      level: 1, // Upgrade level
      type: 'standard', // standard, infrared, radio
      health: 100,
      powerDrain: 5 // Power % per day
    };
  }

  // Create a probe with deflection capabilities
  createProbe(index) {
    const totalProbes = this.gameState.probes.length + 1;
    const angleSpacing = (Math.PI * 2) / Math.max(3, totalProbes);
    
    return {
      id: `probe-${Date.now()}-${index}`,
      orbitPosition: index * angleSpacing + Math.PI, // Offset from satellites
      level: 1, // Determines laser power
      fireArc: Math.PI, // Can target 180 degrees
      laserPower: 100, // Base damage
      type: 'kinetic', // kinetic, laser, nuclear
      health: 100
    };
  }

  // Get current game state with filtered threats (only detected asteroids visible)
  getGameState() {
    // Filter threats to only show detected asteroids
    const visibleThreats = this.gameState.threats.filter(threat => {
      if (threat.type !== 'asteroid_detected') return true; // Other events always visible
      return this.isAsteroidDetected(threat); // Only show detected asteroids
    });
    
    return {
      ...this.gameState,
      threats: visibleThreats,
      allThreats: this.gameState.threats.length, // Total threats (including undetected)
      detectedThreats: visibleThreats.length // Detected threats
    };
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
      
      // TRUE 3D APPROACH - spherical coordinates
      const approachAngle = Math.random() * Math.PI * 2; // Azimuth (0-360°)
      const polarAngle = (Math.random() - 0.5) * Math.PI; // Elevation (-90° to +90°)
      
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
        // Approach mechanics - 3D SPHERICAL
        approachAngle, // Azimuth angle in radians (horizontal plane)
        polarAngle, // Polar angle in radians (vertical: -π/2=south pole, 0=equator, +π/2=north pole)
        timeToImpact: gameMinutes, // Minutes until impact
        detectedAt: (this.gameState.day - 1) * 1440, // Game time when first detected
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

  // Calculate 3D position of asteroid
  calculateAsteroidPosition3D(asteroid, elapsedMinutes) {
    const approachAngle = asteroid.data?.approachAngle || 0;
    const polarAngle = asteroid.data?.polarAngle || 0; // Vertical angle for 3D
    const distance = asteroid.data?.distance || 1000000;
    const timeToImpact = asteroid.data?.timeToImpact || 24;
    const detectedAt = asteroid.data?.detectedAt || 0;
    
    // Calculate current distance based on approach progress
    const minutesSinceDetection = Math.max(0, elapsedMinutes - detectedAt);
    const progress = Math.min(1, minutesSinceDetection / timeToImpact);
    const currentDistance = distance * (1 - progress);
    const distanceInGameUnits = currentDistance / 100000; // Scale to game units
    
    // Convert spherical coordinates to 3D Cartesian
    return {
      x: Math.cos(approachAngle) * Math.cos(polarAngle) * distanceInGameUnits,
      y: Math.sin(polarAngle) * distanceInGameUnits,
      z: Math.sin(approachAngle) * Math.cos(polarAngle) * distanceInGameUnits,
      distance: distanceInGameUnits
    };
  }

  // Calculate 3D position of satellite
  calculateSatellitePosition3D(satellite) {
    const radius = 2.5; // Satellite orbit radius
    const angle = satellite.orbitPosition || 0;
    
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle * 2) * 0.2, // Slight vertical variation
      z: Math.sin(angle) * radius
    };
  }

  // Calculate 3D distance between two points
  distance3D(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
      Math.pow(pos1.y - pos2.y, 2) +
      Math.pow(pos1.z - pos2.z, 2)
    );
  }

  // Check if an asteroid is detected by any satellite (3D SPHERICAL RADAR)
  isAsteroidDetected(asteroid) {
    if (!asteroid.data) return false;
    
    const elapsedMinutes = (this.gameState.day - 1) * 1440; // Minutes since game start
    const asteroidPos = this.calculateAsteroidPosition3D(asteroid, elapsedMinutes);
    
    // Always detect asteroids that are very close (emergency detection)
    if (asteroidPos.distance < 2) return true;
    
    // Check if within 3D spherical detection range of any satellite
    for (const satellite of this.gameState.satellites) {
      const satPos = this.calculateSatellitePosition3D(satellite);
      const detectionRadius = satellite.detectionRadius || 3.5;
      
      // Calculate 3D distance from satellite to asteroid
      const dist = this.distance3D(satPos, asteroidPos);
      
      // If asteroid is within the satellite's spherical detection radius
      if (dist < detectionRadius) {
        asteroid.detectedBy = satellite.id;
        return true;
      }
    }
    
    return false; // Not detected by any satellite!
  }

  // Calculate if an asteroid will burn up in atmosphere using simplified Chapman equation
  calculateAtmosphericBurnup(asteroid) {
    if (!asteroid.data) return { willBurnUp: false };
    
    const diameter = asteroid.data.diameter || 50; // meters
    const velocity = asteroid.data.velocity || 20000; // m/s
    const density = 3000; // kg/m³ (typical rocky asteroid)
    const distance = asteroid.data.distance || 1000000; // km
    
    // Constants
    const ATMOSPHERE_HEIGHT = 100; // km - Karman line
    const AIR_DENSITY_SEA_LEVEL = 1.225; // kg/m³
    const SCALE_HEIGHT = 8.5; // km - atmospheric scale height
    
    // Check if asteroid is entering atmosphere
    if (distance > ATMOSPHERE_HEIGHT) {
      return { willBurnUp: false };
    }
    
    // Calculate current atmospheric density using barometric formula
    const altitude = distance; // km above surface
    const atmosphericDensity = AIR_DENSITY_SEA_LEVEL * Math.exp(-altitude / SCALE_HEIGHT);
    
    // Calculate mass and cross-sectional area
    const radius = diameter / 2; // meters
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const mass = density * volume; // kg
    const crossSection = Math.PI * Math.pow(radius, 2); // m²
    
    // Calculate ablation parameter (simplified)
    // Smaller, faster objects with less mass burn up more easily
    const dragCoefficient = 1.0; // typical for irregular asteroids
    const dragForce = 0.5 * atmosphericDensity * Math.pow(velocity, 2) * crossSection * dragCoefficient;
    const deceleration = dragForce / mass;
    
    // Critical diameter for burn-up at this velocity (empirical formula)
    // Objects smaller than ~25m typically burn up completely
    const criticalDiameter = 25 * Math.pow(velocity / 20000, 0.5);
    
    const willBurnUp = diameter < criticalDiameter && distance < 50; // Within 50km altitude
    
    return {
      willBurnUp,
      burnupAltitude: altitude,
      energyReleased: 0.5 * mass * Math.pow(velocity, 2), // Joules
      visualIntensity: willBurnUp ? Math.min(1, diameter / 10) : 0
    };
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
        // ADD a new satellite to the array
        const newSatellite = this.createSatellite(this.gameState.satellites.length);
        this.gameState.satellites.push(newSatellite);
        this.gameState.funds -= 150000;
        this.gameState.power -= 10;
        result.success = true;
        result.message = `Satellite deployed! Detection coverage increased.`;
        result.scoreChange = 50;
        break;

      case 'launch_probe':
        if (this.gameState.funds < 200000) {
          result.message = 'Insufficient funds ($200K required)';
          break;
        }
        // ADD a new probe to the array
        const newProbe = this.createProbe(this.gameState.probes.length);
        this.gameState.probes.push(newProbe);
        this.gameState.availableProbes++; // Also add to available for deflection
        this.gameState.funds -= 200000;
        result.success = true;
        result.message = 'New probe launched and ready';
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
        
        // Calculate success based on asteroid size, player upgrades, and probe levels
        const avgProbeLevel = this.gameState.probes.length > 0 
          ? this.gameState.probes.reduce((sum, p) => sum + p.level, 0) / this.gameState.probes.length 
          : 1;
        const avgProbePower = this.gameState.probes.length > 0
          ? this.gameState.probes.reduce((sum, p) => sum + (p.laserPower || 100), 0) / this.gameState.probes.length
          : 100;
        
        let successChance = this.calculateDeflectionSuccess(threat.data);
        successChance = Math.min(0.95, successChance + (avgProbeLevel - 1) * 0.1); // +10% per avg probe level
        const success = Math.random() < successChance;
        
        const asteroidDiameter = threat.data?.diameter || 50;
        const powerRatio = avgProbePower / asteroidDiameter; // Higher = more destructive power vs asteroid
        
        // Check for FRAGMENTATION instead of complete destruction
        const willFragment = asteroidDiameter > 100 && powerRatio < 5; // Large asteroids fragment if probe power is insufficient
        
        if (success) {
          if (willFragment) {
            // PARTIAL DESTRUCTION - create fragments
            const fragmentCount = Math.floor(Math.random() * 2) + 2; // 2-3 fragments
            const fragments = [];
            
            for (let i = 0; i < fragmentCount; i++) {
              const fragmentDiameter = asteroidDiameter / (fragmentCount + Math.random());
              const fragmentThreat = {
                id: `${threat.id}-frag-${i}`,
                type: 'asteroid_detected',
                severity: fragmentDiameter > 50 ? 'moderate' : 'low',
                title: `💥 ${threat.data.name} Fragment ${i+1}`,
                description: `Deflection partially successful - asteroid broke into ${fragmentCount} smaller pieces`,
                timestamp: new Date().toISOString(),
                data: {
                  ...threat.data,
                  name: `${threat.data.name} Fragment ${i+1}`,
                  diameter: fragmentDiameter,
                  distance: threat.data.distance * 1.2, // Fragments scatter slightly further
                  approachAngle: threat.data.approachAngle + (Math.random() - 0.5) * 0.5, // Scatter angle
                  timeToImpact: threat.data.timeToImpact * 1.5, // More time to deal with fragments
                  velocity: threat.data.velocity * 0.8 // Slower
                },
                risk: fragmentDiameter > 50 ? 'moderate' : 'low'
              };
              fragments.push(fragmentThreat);
            }
            
            // Remove original, add fragments
            this.gameState.threats = this.gameState.threats.filter(t => t.id !== targetId);
            this.gameState.threats.push(...fragments);
            
            result.success = true;
            result.fragmented = true;
            result.fragmentCount = fragmentCount;
            result.message = `Partially deflected ${threat.data.name} - broke into ${fragmentCount} smaller fragments!`;
            result.scoreChange = 150;
            this.gameState.reputation += 3;
          } else {
            // COMPLETE DESTRUCTION
            result.success = true;
            result.fragmented = false;
            result.message = `Successfully destroyed ${threat.data.name}!`;
            result.scoreChange = 300;
            this.gameState.reputation += 10;
            
            // Remove threat
            this.gameState.threats = this.gameState.threats.filter(t => t.id !== targetId);
          }
        } else {
          result.success = false;
          result.message = `Failed to deflect ${threat.data.name}`;
          result.scoreChange = -100;
          this.gameState.earthDamage += 5;
          this.gameState.reputation -= 5;
        }
        break;

      case 'upgrade_satellite':
        const satellite = this.gameState.satellites.find(s => s.id === targetId);
        if (!satellite) {
          result.message = 'Satellite not found';
          break;
        }
        if (satellite.level >= 3) {
          result.message = 'Satellite already at max level (3)';
          break;
        }
        const satCost = satellite.level * 100000; // L1→L2 = $100K, L2→L3 = $200K
        if (this.gameState.funds < satCost) {
          result.message = `Insufficient funds ($${satCost/1000}K required)`;
          break;
        }
        
        satellite.level++;
        satellite.detectionRadius += 1.0; // +1 unit per level (3.5 → 4.5 → 5.5)
        this.gameState.funds -= satCost;
        result.success = true;
        result.message = `Satellite upgraded to Level ${satellite.level}! Detection radius increased to ${satellite.detectionRadius.toFixed(1)} units.`;
        result.scoreChange = 100;
        break;

      case 'upgrade_probe':
        const probe = this.gameState.probes.find(p => p.id === targetId);
        if (!probe) {
          result.message = 'Probe not found';
          break;
        }
        if (probe.level >= 3) {
          result.message = 'Probe already at max level (3)';
          break;
        }
        const probeCost = probe.level * 150000; // L1→L2 = $150K, L2→L3 = $300K
        if (this.gameState.funds < probeCost) {
          result.message = `Insufficient funds ($${probeCost/1000}K required)`;
          break;
        }
        
        probe.level++;
        probe.laserPower += 50; // +50% power per level (100 → 150 → 200)
        this.gameState.funds -= probeCost;
        result.success = true;
        result.message = `Probe upgraded to Level ${probe.level}! Laser power increased to ${probe.laserPower}%.`;
        result.scoreChange = 150;
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
    
    // Check for atmospheric burn-up FIRST
    const burnedUpAsteroids = [];
    this.gameState.threats = this.gameState.threats.filter(threat => {
      if (threat.type !== 'asteroid_detected') return true; // Keep non-asteroid threats
      
      const burnupResult = this.calculateAtmosphericBurnup(threat);
      
      if (burnupResult.willBurnUp) {
        burnedUpAsteroids.push({
          name: threat.data?.name || 'Unknown',
          diameter: threat.data?.diameter || 0,
          altitude: burnupResult.burnupAltitude
        });
        return false; // Remove from threats - burned up!
      }
      
      return true; // Keep asteroids that don't burn up
    });
    
    // Add events for burned-up asteroids
    if (burnedUpAsteroids.length > 0) {
      burnedUpAsteroids.forEach(asteroid => {
        this.gameState.events.push({
          id: `burnup-${Date.now()}-${Math.random()}`,
          type: 'atmospheric_burnup',
          severity: 'low',
          title: '🔥 Atmospheric Burn-up',
          description: `${asteroid.name} (${asteroid.diameter}m) safely burned up at ${asteroid.altitude.toFixed(1)}km altitude`,
          timestamp: new Date().toISOString(),
          icon: '🔥'
        });
      });
      
      // Award points for natural burn-ups
      this.gameState.score += burnedUpAsteroids.length * 50;
    }
    
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
