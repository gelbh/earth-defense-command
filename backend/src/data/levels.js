// Level configurations for Earth Defense Command

const levels = [
  // ========================================
  // TRAINING ARC (Levels 1-5) - TUTORIAL
  // ========================================
  {
    id: 1,
    name: "First Contact",
    description:
      "Your first asteroid threat. Learn the basics of detection and deflection.",
    type: "tutorial",
    difficulty: "easy",

    objectives: [
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 3,
        current: 0,
        completed: false,
        description: "Destroy 3 asteroids",
      },
      {
        id: "maintain_health",
        type: "maintain_health",
        threshold: 70,
        current: 100,
        completed: false,
        description: "Keep Earth health above 70%",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10, // 10 seconds before first asteroid
        spawnPattern: "sequential",
        asteroids: [
          {
            diameter: 50,
            velocity: 8,
            distance: 1500000,
            approachAngle: 0,
            polarAngle: 0,
          },
        ],
      },
      {
        id: 2,
        delay: 30,
        spawnPattern: "sequential",
        asteroids: [
          {
            diameter: 75,
            velocity: 10,
            distance: 1800000,
            approachAngle: Math.PI / 2,
            polarAngle: 0.3,
          },
        ],
      },
      {
        id: 3,
        delay: 30,
        spawnPattern: "sequential",
        asteroids: [
          {
            diameter: 60,
            velocity: 9,
            distance: 1600000,
            approachAngle: Math.PI,
            polarAngle: -0.2,
          },
        ],
      },
    ],

    startingResources: {
      funds: 1000000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 2,
        },
      ],
      probes: [{ level: 1, laserPower: 100, orbitPosition: Math.PI }],
      availableProbes: 3,
    },

    restrictions: null,
    environment: {
      hazards: [],
      powerups: [],
    },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, healthRemaining: 60 },
        2: { objectivesCompleted: 2, healthRemaining: 80, asteroidsHit: 0 },
        3: {
          objectivesCompleted: 2,
          healthRemaining: 100,
          asteroidsHit: 0,
          timeUnder: 120,
        },
      },
      unlocks: ["level_2"],
      gems: 50,
    },
  },

  {
    id: 2,
    name: "Detection Training",
    description:
      "Deploy satellites to extend your detection range. Some asteroids may approach from blind spots.",
    type: "tutorial",
    difficulty: "easy",

    objectives: [
      {
        id: "deploy_satellite",
        type: "deploy_satellite",
        target: 1,
        current: 0,
        completed: false,
        description: "Deploy 1 satellite",
      },
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 4,
        current: 0,
        completed: false,
        description: "Destroy 4 asteroids",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 15,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 55,
            velocity: 9,
            distance: 2000000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.5,
          },
          {
            diameter: 60,
            velocity: 10,
            distance: 1900000,
            approachAngle: (Math.PI * 5) / 3,
            polarAngle: -0.4,
          },
        ],
      },
      {
        id: 2,
        delay: 35,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 70,
            velocity: 11,
            distance: 1700000,
            approachAngle: Math.PI / 4,
            polarAngle: 0.3,
          },
          {
            diameter: 65,
            velocity: 10,
            distance: 1800000,
            approachAngle: (Math.PI * 7) / 4,
            polarAngle: -0.3,
          },
        ],
      },
    ],

    startingResources: {
      funds: 900000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 2,
        },
      ],
      probes: [{ level: 1, laserPower: 100, orbitPosition: Math.PI }],
      availableProbes: 4,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, healthRemaining: 60 },
        2: { objectivesCompleted: 2, healthRemaining: 80, asteroidsHit: 0 },
        3: {
          objectivesCompleted: 2,
          healthRemaining: 100,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_3"],
      gems: 60,
    },
  },

  {
    id: 3,
    name: "Fragmentation 101",
    description:
      "Large asteroids may fragment when hit with insufficient power. Destroy both the original and all fragments.",
    type: "tutorial",
    difficulty: "easy",

    objectives: [
      {
        id: "fragment_asteroids",
        type: "fragment_asteroids",
        target: 2,
        current: 0,
        completed: false,
        description: "Fragment 2 asteroids",
      },
      {
        id: "destroy_all",
        type: "destroy_asteroids",
        target: 6, // 2 original + ~4 fragments
        current: 0,
        completed: false,
        description: "Destroy all threats including fragments",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 15,
        spawnPattern: "sequential",
        asteroids: [
          {
            diameter: 180,
            velocity: 12,
            distance: 2000000,
            approachAngle: 0,
            polarAngle: 0,
          },
        ],
      },
      {
        id: 2,
        delay: 40,
        spawnPattern: "sequential",
        asteroids: [
          {
            diameter: 200,
            velocity: 11,
            distance: 2100000,
            approachAngle: Math.PI,
            polarAngle: 0.3,
          },
        ],
      },
    ],

    startingResources: {
      funds: 850000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 2,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 6,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, healthRemaining: 50 },
        2: { objectivesCompleted: 2, healthRemaining: 75, asteroidsHit: 1 },
        3: {
          objectivesCompleted: 2,
          healthRemaining: 90,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_4"],
      gems: 70,
    },
  },

  {
    id: 4,
    name: "Multiple Threats",
    description:
      "Face multiple waves of asteroids. Manage your probe missions carefully - they're limited!",
    type: "survival",
    difficulty: "medium",

    objectives: [
      {
        id: "survive_waves",
        type: "survive_waves",
        target: 2,
        current: 0,
        completed: false,
        description: "Survive 2 waves",
      },
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 5,
        current: 0,
        completed: false,
        description: "Destroy 5 asteroids",
      },
      {
        id: "maintain_health",
        type: "maintain_health",
        threshold: 70,
        current: 100,
        completed: false,
        description: "Keep Earth health above 70%",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 80,
            velocity: 12,
            distance: 1800000,
            approachAngle: 0,
            polarAngle: 0.2,
          },
          {
            diameter: 90,
            velocity: 13,
            distance: 1900000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 75,
            velocity: 11,
            distance: 1700000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.4,
          },
        ],
      },
      {
        id: 2,
        delay: 45,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 100,
            velocity: 14,
            distance: 2000000,
            approachAngle: Math.PI / 2,
            polarAngle: 0,
          },
          {
            diameter: 85,
            velocity: 12,
            distance: 1800000,
            approachAngle: (Math.PI * 3) / 2,
            polarAngle: -0.2,
          },
        ],
      },
    ],

    startingResources: {
      funds: 700000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 3,
        },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 4) / 3,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 4, // Limited! Must manage carefully
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 3, healthRemaining: 60 },
        2: { objectivesCompleted: 3, healthRemaining: 80, asteroidsHit: 1 },
        3: {
          objectivesCompleted: 3,
          healthRemaining: 90,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_5"],
      gems: 80,
    },
  },

  {
    id: 5,
    name: "Graduation Test",
    description:
      "Your final training mission. Prove you've mastered the basics by surviving three challenging waves.",
    type: "survival",
    difficulty: "medium",

    objectives: [
      {
        id: "survive_waves",
        type: "survive_waves",
        target: 3,
        current: 0,
        completed: false,
        description: "Survive 3 waves",
      },
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 9,
        current: 0,
        completed: false,
        description: "Destroy 9 asteroids",
      },
      {
        id: "maintain_health",
        type: "maintain_health",
        threshold: 80,
        current: 100,
        completed: false,
        description: "Keep Earth health above 80%",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 70,
            velocity: 12,
            distance: 1900000,
            approachAngle: 0,
            polarAngle: 0.3,
          },
          {
            diameter: 80,
            velocity: 13,
            distance: 2000000,
            approachAngle: Math.PI,
            polarAngle: -0.2,
          },
        ],
      },
      {
        id: 2,
        delay: 35,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 120,
            velocity: 14,
            distance: 2100000,
            approachAngle: Math.PI / 2,
            polarAngle: 0.4,
          },
          {
            diameter: 90,
            velocity: 12,
            distance: 1800000,
            approachAngle: (Math.PI * 3) / 2,
            polarAngle: 0,
          },
          {
            diameter: 85,
            velocity: 11,
            distance: 1700000,
            approachAngle: (Math.PI * 5) / 4,
            polarAngle: -0.3,
          },
        ],
      },
      {
        id: 3,
        delay: 40,
        spawnPattern: "focused",
        asteroids: [
          {
            diameter: 150,
            velocity: 15,
            distance: 2200000,
            approachAngle: 0,
            polarAngle: 0,
          },
          {
            diameter: 100,
            velocity: 14,
            distance: 2000000,
            approachAngle: 0.2,
            polarAngle: 0.2,
          },
          {
            diameter: 95,
            velocity: 13,
            distance: 1900000,
            approachAngle: -0.2,
            polarAngle: -0.2,
          },
          {
            diameter: 80,
            velocity: 12,
            distance: 1800000,
            approachAngle: 0.4,
            polarAngle: 0.1,
          },
        ],
      },
    ],

    startingResources: {
      funds: 800000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 3,
        },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 4) / 3,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 7,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 3, healthRemaining: 70 },
        2: { objectivesCompleted: 3, healthRemaining: 85, asteroidsHit: 2 },
        3: {
          objectivesCompleted: 3,
          healthRemaining: 95,
          asteroidsHit: 0,
          timeUnder: 180,
        },
      },
      unlocks: ["level_6", "infrared_satellite"], // First asset unlock!
      gems: 100,
    },
  },

  // ========================================
  // RISING THREAT (Levels 6-10) - MEDIUM
  // ========================================
  {
    id: 6,
    name: "Double Trouble",
    description:
      "Asteroids approach from opposite sides simultaneously. You'll need strategic satellite placement.",
    type: "precision",
    difficulty: "medium",

    objectives: [
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 8,
        current: 0,
        completed: false,
        description: "Destroy 8 asteroids",
      },
      {
        id: "perfect_clear",
        type: "perfect_clear",
        allowedMisses: 0,
        current: 0,
        completed: false,
        description: "Perfect clear - no asteroids hit Earth",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "opposite",
        asteroids: [
          {
            diameter: 90,
            velocity: 14,
            distance: 1900000,
            approachAngle: 0,
            polarAngle: 0,
          },
          {
            diameter: 95,
            velocity: 14,
            distance: 1900000,
            approachAngle: Math.PI,
            polarAngle: 0,
          },
        ],
      },
      {
        id: 2,
        delay: 30,
        spawnPattern: "opposite",
        asteroids: [
          {
            diameter: 85,
            velocity: 15,
            distance: 2000000,
            approachAngle: Math.PI / 2,
            polarAngle: 0.3,
          },
          {
            diameter: 100,
            velocity: 15,
            distance: 2000000,
            approachAngle: (Math.PI * 3) / 2,
            polarAngle: 0.3,
          },
        ],
      },
      {
        id: 3,
        delay: 30,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 110,
            velocity: 16,
            distance: 2100000,
            approachAngle: Math.PI / 4,
            polarAngle: -0.2,
          },
          {
            diameter: 105,
            velocity: 16,
            distance: 2100000,
            approachAngle: (Math.PI * 5) / 4,
            polarAngle: -0.2,
          },
          {
            diameter: 95,
            velocity: 15,
            distance: 2000000,
            approachAngle: (Math.PI * 3) / 4,
            polarAngle: 0.4,
          },
          {
            diameter: 90,
            velocity: 14,
            distance: 1900000,
            approachAngle: (Math.PI * 7) / 4,
            polarAngle: 0.4,
          },
        ],
      },
    ],

    startingResources: {
      funds: 750000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 2,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 6,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, healthRemaining: 60 },
        2: { objectivesCompleted: 2, healthRemaining: 90 },
        3: { objectivesCompleted: 2, healthRemaining: 100, timeUnder: 150 },
      },
      unlocks: ["level_7"],
      gems: 120,
    },
  },

  {
    id: 7,
    name: "Speed Demons",
    description:
      "Fast-moving asteroids are harder to track and require quick reflexes. Stay alert!",
    type: "survival",
    difficulty: "medium",

    objectives: [
      {
        id: "destroy_fast",
        type: "destroy_large",
        target: 6,
        minSize: 0, // All asteroids
        maxVelocity: 100, // But fast ones
        current: 0,
        completed: false,
        description: "Destroy 6 fast asteroids (>18 km/s)",
      },
      {
        id: "maintain_health",
        type: "maintain_health",
        threshold: 75,
        current: 100,
        completed: false,
        description: "Keep Earth health above 75%",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 70,
            velocity: 20,
            distance: 2200000,
            approachAngle: 0,
            polarAngle: 0.2,
          },
          {
            diameter: 75,
            velocity: 22,
            distance: 2300000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
        ],
      },
      {
        id: 2,
        delay: 25,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 80,
            velocity: 21,
            distance: 2100000,
            approachAngle: Math.PI,
            polarAngle: 0.4,
          },
          {
            diameter: 85,
            velocity: 23,
            distance: 2400000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: -0.2,
          },
        ],
      },
      {
        id: 3,
        delay: 25,
        spawnPattern: "spiral",
        asteroids: [
          {
            diameter: 90,
            velocity: 24,
            distance: 2500000,
            approachAngle: Math.PI / 4,
            polarAngle: 0,
          },
          {
            diameter: 75,
            velocity: 22,
            distance: 2300000,
            approachAngle: (Math.PI * 5) / 4,
            polarAngle: 0.3,
          },
        ],
      },
    ],

    startingResources: {
      funds: 850000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 3,
        },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 4) / 3,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 7,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, healthRemaining: 65 },
        2: { objectivesCompleted: 2, healthRemaining: 85, asteroidsHit: 1 },
        3: {
          objectivesCompleted: 2,
          healthRemaining: 100,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_8", "laser_probe"], // Unlock laser probe
      gems: 130,
    },
  },

  {
    id: 8,
    name: "Budget Crisis",
    description:
      "Funding is tight. Complete the mission without exceeding your budget allocation.",
    type: "challenge",
    difficulty: "medium",

    objectives: [
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 7,
        current: 0,
        completed: false,
        description: "Destroy 7 asteroids",
      },
      {
        id: "resource_limit",
        type: "resource_limit",
        maxSpent: 300000,
        current: 0,
        completed: false,
        description: "Spend less than $300K",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 90,
            velocity: 13,
            distance: 1900000,
            approachAngle: 0,
            polarAngle: 0.2,
          },
          {
            diameter: 100,
            velocity: 14,
            distance: 2000000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 85,
            velocity: 12,
            distance: 1800000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.4,
          },
        ],
      },
      {
        id: 2,
        delay: 40,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 110,
            velocity: 15,
            distance: 2100000,
            approachAngle: Math.PI / 2,
            polarAngle: 0,
          },
          {
            diameter: 95,
            velocity: 13,
            distance: 1900000,
            approachAngle: (Math.PI * 3) / 2,
            polarAngle: -0.2,
          },
          {
            diameter: 105,
            velocity: 14,
            distance: 2000000,
            approachAngle: Math.PI / 4,
            polarAngle: 0.3,
          },
          {
            diameter: 90,
            velocity: 12,
            distance: 1800000,
            approachAngle: (Math.PI * 7) / 4,
            polarAngle: -0.4,
          },
        ],
      },
    ],

    startingResources: {
      funds: 500000, // Limited budget!
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 2,
        },
      ],
      probes: [{ level: 1, laserPower: 100, orbitPosition: Math.PI }],
      availableProbes: 6,
    },

    restrictions: {
      maxFundsSpent: 300000,
    },
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2, fundsSpent: 300000 },
        2: { objectivesCompleted: 2, fundsSpent: 250000, asteroidsHit: 1 },
        3: {
          objectivesCompleted: 2,
          fundsSpent: 200000,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_9"],
      gems: 140,
    },
  },

  {
    id: 9,
    name: "Atmospheric Defense",
    description:
      "Learn when NOT to deflect. Small asteroids will burn up naturally - save your resources for the real threats.",
    type: "precision",
    difficulty: "medium",

    objectives: [
      {
        id: "burnup_count",
        type: "atmospheric_burnup",
        target: 5,
        current: 0,
        completed: false,
        description: "Let 5 small asteroids burn up naturally",
      },
      {
        id: "destroy_large",
        type: "destroy_large",
        target: 5,
        minSize: 50,
        current: 0,
        completed: false,
        description: "Destroy 5 large asteroids (>50m)",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "mixed",
        asteroids: [
          // Small - will burn up
          {
            diameter: 18,
            velocity: 10,
            distance: 800000,
            approachAngle: 0,
            polarAngle: 0,
          },
          {
            diameter: 20,
            velocity: 11,
            distance: 850000,
            approachAngle: Math.PI / 3,
            polarAngle: 0.2,
          },
          // Large - must deflect
          {
            diameter: 120,
            velocity: 14,
            distance: 2000000,
            approachAngle: Math.PI,
            polarAngle: 0.3,
          },
        ],
      },
      {
        id: 2,
        delay: 30,
        spawnPattern: "mixed",
        asteroids: [
          // Small
          {
            diameter: 22,
            velocity: 12,
            distance: 900000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 19,
            velocity: 11,
            distance: 850000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.4,
          },
          // Large
          {
            diameter: 150,
            velocity: 15,
            distance: 2200000,
            approachAngle: Math.PI / 2,
            polarAngle: 0,
          },
          {
            diameter: 130,
            velocity: 14,
            distance: 2100000,
            approachAngle: (Math.PI * 3) / 2,
            polarAngle: -0.2,
          },
        ],
      },
      {
        id: 3,
        delay: 35,
        spawnPattern: "mixed",
        asteroids: [
          // Small
          {
            diameter: 21,
            velocity: 10,
            distance: 800000,
            approachAngle: Math.PI / 4,
            polarAngle: 0.3,
          },
          // Large
          {
            diameter: 140,
            velocity: 16,
            distance: 2300000,
            approachAngle: (Math.PI * 5) / 4,
            polarAngle: -0.4,
          },
          {
            diameter: 125,
            velocity: 15,
            distance: 2100000,
            approachAngle: (Math.PI * 7) / 4,
            polarAngle: 0.2,
          },
        ],
      },
    ],

    startingResources: {
      funds: 700000,
      power: 100,
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 3,
        },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 4) / 3,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 6,
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 2 },
        2: { objectivesCompleted: 2, healthRemaining: 85 },
        3: {
          objectivesCompleted: 2,
          healthRemaining: 100,
          asteroidsHit: 0,
        },
      },
      unlocks: ["level_10"],
      gems: 150,
    },
  },

  {
    id: 10,
    name: "Asteroid Storm",
    description:
      "Your toughest challenge yet. Multiple waves of asteroids approach from all angles. This is what you've been training for.",
    type: "survival",
    difficulty: "hard",

    objectives: [
      {
        id: "survive_waves",
        type: "survive_waves",
        target: 5,
        current: 0,
        completed: false,
        description: "Survive 5 waves",
      },
      {
        id: "destroy_count",
        type: "destroy_asteroids",
        target: 20,
        current: 0,
        completed: false,
        description: "Destroy 20 asteroids",
      },
      {
        id: "maintain_health",
        type: "maintain_health",
        threshold: 60,
        current: 100,
        completed: false,
        description: "Keep Earth health above 60%",
      },
    ],

    waves: [
      {
        id: 1,
        delay: 10,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 95,
            velocity: 14,
            distance: 2000000,
            approachAngle: 0,
            polarAngle: 0.2,
          },
          {
            diameter: 100,
            velocity: 15,
            distance: 2100000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 90,
            velocity: 13,
            distance: 1900000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.4,
          },
        ],
      },
      {
        id: 2,
        delay: 25,
        spawnPattern: "focused",
        asteroids: [
          {
            diameter: 110,
            velocity: 16,
            distance: 2200000,
            approachAngle: Math.PI / 2,
            polarAngle: 0,
          },
          {
            diameter: 105,
            velocity: 15,
            distance: 2100000,
            approachAngle: Math.PI / 2 + 0.3,
            polarAngle: 0.2,
          },
          {
            diameter: 100,
            velocity: 14,
            distance: 2000000,
            approachAngle: Math.PI / 2 - 0.3,
            polarAngle: -0.2,
          },
          {
            diameter: 95,
            velocity: 13,
            distance: 1900000,
            approachAngle: Math.PI / 2 + 0.5,
            polarAngle: 0.3,
          },
        ],
      },
      {
        id: 3,
        delay: 20,
        spawnPattern: "spread",
        asteroids: [
          {
            diameter: 120,
            velocity: 17,
            distance: 2300000,
            approachAngle: 0,
            polarAngle: 0,
          },
          {
            diameter: 115,
            velocity: 16,
            distance: 2200000,
            approachAngle: Math.PI,
            polarAngle: 0.3,
          },
          {
            diameter: 110,
            velocity: 15,
            distance: 2100000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 105,
            velocity: 14,
            distance: 2000000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: 0.4,
          },
          {
            diameter: 100,
            velocity: 13,
            distance: 1900000,
            approachAngle: Math.PI / 2,
            polarAngle: -0.2,
          },
        ],
      },
      {
        id: 4,
        delay: 15,
        spawnPattern: "spiral",
        asteroids: [
          {
            diameter: 130,
            velocity: 18,
            distance: 2400000,
            approachAngle: 0,
            polarAngle: 0.2,
          },
          {
            diameter: 125,
            velocity: 17,
            distance: 2300000,
            approachAngle: Math.PI / 3,
            polarAngle: 0,
          },
          {
            diameter: 120,
            velocity: 16,
            distance: 2200000,
            approachAngle: (Math.PI * 2) / 3,
            polarAngle: -0.3,
          },
          {
            diameter: 115,
            velocity: 15,
            distance: 2100000,
            approachAngle: Math.PI,
            polarAngle: 0.4,
          },
          {
            diameter: 110,
            velocity: 14,
            distance: 2000000,
            approachAngle: (Math.PI * 4) / 3,
            polarAngle: -0.2,
          },
          {
            diameter: 105,
            velocity: 13,
            distance: 1900000,
            approachAngle: (Math.PI * 5) / 3,
            polarAngle: 0.3,
          },
        ],
      },
      {
        id: 5,
        delay: 10,
        spawnPattern: "random",
        asteroids: [
          {
            diameter: 140,
            velocity: 19,
            distance: 2500000,
            approachAngle: 0.5,
            polarAngle: 0.4,
          },
          {
            diameter: 135,
            velocity: 18,
            distance: 2400000,
            approachAngle: 1.8,
            polarAngle: -0.3,
          },
          {
            diameter: 130,
            velocity: 17,
            distance: 2300000,
            approachAngle: 3.2,
            polarAngle: 0.2,
          },
          {
            diameter: 125,
            velocity: 16,
            distance: 2200000,
            approachAngle: 4.5,
            polarAngle: -0.4,
          },
          {
            diameter: 120,
            velocity: 15,
            distance: 2100000,
            approachAngle: 5.7,
            polarAngle: 0,
          },
          {
            diameter: 115,
            velocity: 14,
            distance: 2000000,
            approachAngle: 2.4,
            polarAngle: 0.3,
          },
          {
            diameter: 110,
            velocity: 13,
            distance: 1900000,
            approachAngle: 3.9,
            polarAngle: -0.2,
          },
        ],
      },
    ],

    startingResources: {
      funds: 800000,
      power: 80, // Reduced power!
      satellites: [
        { level: 1, detectionRadius: 3.5, orbitPosition: 0 },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 2) / 3,
        },
        {
          level: 1,
          detectionRadius: 3.5,
          orbitPosition: (Math.PI * 4) / 3,
        },
      ],
      probes: [
        { level: 1, laserPower: 100, orbitPosition: Math.PI },
        { level: 1, laserPower: 100, orbitPosition: 0 },
      ],
      availableProbes: 15, // Need lots of probe missions!
    },

    restrictions: null,
    environment: { hazards: [], powerups: [] },

    rewards: {
      starsThreshold: {
        1: { objectivesCompleted: 3, healthRemaining: 50 },
        2: { objectivesCompleted: 3, healthRemaining: 70, asteroidsHit: 3 },
        3: {
          objectivesCompleted: 3,
          healthRemaining: 85,
          asteroidsHit: 1,
          timeUnder: 240,
        },
      },
      unlocks: ["level_11", "radar_satellite", "shield_ability"], // Major milestone rewards!
      gems: 200,
    },
  },
];

export default levels;
