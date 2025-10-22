import React, { useRef, useMemo, Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with proper spherical texture
function Earth({ isPaused = false }) {
  const earthRef = useRef();
  
  // Rotate Earth continuously
  useFrame(({ clock }) => {
    if (earthRef.current && !isPaused) {
      earthRef.current.rotation.y += clock.getDelta() * 0.3; // Slow rotation (0.3 rad/sec)
    }
  });

  // Use NASA Blue Marble texture (EPIC images are disk photos, not sphere maps)
  const earthTextureUrl = 'https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-blue-marble.jpg';
  
  const texture = useLoader(THREE.TextureLoader, earthTextureUrl);

  // Create Earth material with texture
  const earthMaterial = useMemo(() => {
    // Configure texture for proper sphere mapping
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16; // Better quality at angles
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
      metalness: 0.1,
    });
  }, [texture]);

  return (
    <Sphere ref={earthRef} args={[2, 64, 64]} material={earthMaterial}>
      {/* Add atmosphere glow */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial
          color="#4477ff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
    </Sphere>
  );
}

// Fallback Earth (loading or error state)
function FallbackEarth() {
  const earthRef = useRef();
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005; // Faster rotation to show it's loading
    }
  });

  const earthMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a4d80', // Darker blue
      emissive: '#0a1a2e',
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  return (
    <group ref={earthRef}>
      <Sphere args={[2, 64, 64]} material={earthMaterial}>
        <Sphere args={[2.05, 64, 64]}>
          <meshBasicMaterial
            color="#4477ff"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      </Sphere>
      {/* Loading indicator - pulsing ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Create irregular asteroid geometry
function createAsteroidGeometry(size, seed) {
  const geometry = new THREE.IcosahedronGeometry(size, 1);
  const positions = geometry.attributes.position;
  
  // Randomize vertices to create irregular shape
  const random = (s) => {
    const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  
  for (let i = 0; i < positions.count; i++) {
    const vertex = new THREE.Vector3(
      positions.getX(i),
      positions.getY(i),
      positions.getZ(i)
    );
    
    const randomness = 0.3 + random(seed + i) * 0.4;
    vertex.multiplyScalar(randomness);
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

// Atmospheric Burnup Effect
function BurnupEffect({ position, intensity = 1 }) {
  const fireballRef = useRef();
  const trailRef = useRef();
  const [opacity, setOpacity] = useState(1);
  
  useFrame(({ clock }) => {
    if (fireballRef.current && opacity > 0) {
      // Pulsing fire effect
      const pulse = Math.sin(clock.getElapsedTime() * 20) * 0.3 + 0.7;
      fireballRef.current.material.opacity = pulse * opacity;
      
      // Scale fireball
      const scale = 1 + Math.sin(clock.getElapsedTime() * 15) * 0.3;
      fireballRef.current.scale.set(scale, scale, scale);
    }
    
    // Fade out over time
    if (opacity > 0) {
      setOpacity(prev => Math.max(0, prev - 0.01));
    }
  });
  
  // Always render, but make invisible when faded - no early return to avoid hook violations
  const effectOpacity = Math.max(0, opacity);
  
  return (
    <group position={position} visible={effectOpacity > 0.01}>
      {/* Main fireball */}
      <mesh ref={fireballRef}>
        <sphereGeometry args={[0.15 * intensity, 16, 16]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={0.8 * effectOpacity}
        />
      </mesh>
      
      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.08 * intensity, 12, 12]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.9 * effectOpacity}
        />
      </mesh>
      
      {/* Bright center */}
      <mesh>
        <sphereGeometry args={[0.04 * intensity, 8, 8]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={1 * effectOpacity}
        />
      </mesh>
      
      {/* Glow effect */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={intensity * 3 * effectOpacity} 
        color="#ff6600" 
        distance={2} 
      />
      
      {/* Trail particles */}
      <mesh ref={trailRef} position={[0, -0.2, 0]}>
        <coneGeometry args={[0.1 * intensity, 0.4, 8]} />
        <meshBasicMaterial 
          color="#ff8800" 
          transparent 
          opacity={0.6 * effectOpacity}
        />
      </mesh>
    </group>
  );
}

// Asteroid marker component - APPROACHING Earth (not orbiting)
function AsteroidMarker({ threat, index, onDeflect, onImpact, isPaused = false }) {
  const markerRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [burnedUp, setBurnedUp] = useState(false);
  const [showBurnup, setShowBurnup] = useState(false);
  const impactTriggeredRef = useRef(false); // Track if impact already triggered
  
  // Timestamp-based animation
  const startTimeRef = useRef(Date.now());
  const pausedTimeRef = useRef(0);
  const pauseStartRef = useRef(null);
  
  // Approach mechanics from threat data - memoize to prevent recalculation on re-render
  const approachAngle = useMemo(() => threat.data?.approachAngle || (index * Math.PI * 2) / 5, [threat.data?.approachAngle, index]);
  const polarAngle = useMemo(() => 
    threat.data?.polarAngle !== undefined ? threat.data.polarAngle : (Math.random() - 0.5) * Math.PI,
    [threat.data?.polarAngle]
  );
  const velocity = parseFloat(threat.data?.velocity) || 10; // km/s
  const diameter = parseFloat(threat.data?.diameter) || 50; // meters
  const initialDistance = parseFloat(threat.data?.distance) || 1000000; // km
  
  // Game units conversion: 1 game unit = ~200,000 km
  const GAME_UNIT_KM = 200000;
  const startDistance = initialDistance / GAME_UNIT_KM; // Convert to game units
  const earthRadius = 2; // Earth sphere radius in game units
  const atmosphereRadius = 2.1; // Atmosphere extends slightly beyond Earth
  
  // Initialize timing
  React.useEffect(() => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = isPaused ? Date.now() : null;
  }, [threat.id]);
  
  // Track pause state
  React.useEffect(() => {
    if (isPaused && pauseStartRef.current === null) {
      pauseStartRef.current = Date.now();
    } else if (!isPaused && pauseStartRef.current !== null) {
      pausedTimeRef.current += (Date.now() - pauseStartRef.current);
      pauseStartRef.current = null;
    }
  }, [isPaused]);
  
  useFrame(() => {
    if (markerRef.current && !burnedUp) {
      // Calculate elapsed game time (excluding paused time)
      let currentPausedTime = pausedTimeRef.current;
      if ((isPaused || hovered) && pauseStartRef.current !== null) {
        currentPausedTime += (Date.now() - pauseStartRef.current);
      }
      
      const elapsedSeconds = (Date.now() - startTimeRef.current - currentPausedTime) / 1000;
      
      // Calculate distance traveled using real velocity
      // Distance = velocity * time (scaled for gameplay: 1 real second = 1000 game seconds)
      const timeScale = 1000; // Speed up asteroid movement for gameplay
      const distanceTraveled = (velocity * elapsedSeconds * timeScale) / GAME_UNIT_KM;
      const currentDistance = Math.max(earthRadius, startDistance - distanceTraveled);
      
      // Position using 3D SPHERICAL COORDINATES
      const x = Math.cos(approachAngle) * Math.cos(polarAngle) * currentDistance;
      const y = Math.sin(polarAngle) * currentDistance;
      const z = Math.sin(approachAngle) * Math.cos(polarAngle) * currentDistance;
      
      markerRef.current.position.set(x, y, z);
      
      // Rotation
      const rotationSpeed = hovered ? 0.001 : 0.01;
      markerRef.current.rotation.x += rotationSpeed;
      markerRef.current.rotation.y += rotationSpeed * 0.5;
      
      // Check for atmospheric burnup (small asteroids burn up < 25m diameter)
      if (currentDistance <= atmosphereRadius && diameter < 25 && !impactTriggeredRef.current) {
        setShowBurnup(true);
        setTimeout(() => {
          setBurnedUp(true);
        }, 2000); // Show burnup effect for 2 seconds
      }
      
      // Check if asteroid reached Earth (impact!)
      if (currentDistance <= earthRadius && !hovered && diameter >= 25 && !impactTriggeredRef.current) {
        console.warn(`💥 Asteroid ${threat.title} IMPACT! Processing damage...`);
        impactTriggeredRef.current = true; // Prevent multiple impacts
        
        // Trigger impact handler with actual impact position
        if (onImpact) {
          onImpact(threat, [x, y, z]); // Pass the actual asteroid position
        }
        
        // Hide asteroid after impact (short delay for visual effect)
        setTimeout(() => {
          setBurnedUp(true);
        }, 500);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onDeflect && markerRef.current) {
      // Pass the threat with current position data for laser targeting
      const threatWithPosition = {
        ...threat,
        currentPosition: [
          markerRef.current.position.x,
          markerRef.current.position.y,
          markerRef.current.position.z
        ]
      };
      onDeflect(threatWithPosition);
    }
  };

  // Realistic asteroid color - brownish-gray rock
  const getColor = () => {
    return '#8b7355'; // Brownish-gray for rocky appearance
  };
  
  // Get severity-based glow color for effects only
  const getGlowColor = () => {
    switch (threat.severity) {
      case 'critical': return '#ff0040';
      case 'moderate': return '#ff8800';
      case 'low': return '#ffd700';
      default: return '#888888';
    }
  };

  // Size based on real NASA diameter data or severity
  const getSize = () => {
    // Use real diameter if available (in meters)
    if (threat.diameter && !isNaN(parseFloat(threat.diameter))) {
      const diameterKm = parseFloat(threat.diameter) / 1000;
      // Scale logarithmically for better visualization (0.08 to 0.2)
      return Math.max(0.08, Math.min(0.2, 0.08 + Math.log10(diameterKm + 1) * 0.05));
    }
    
    // Fallback to severity-based sizing
    switch (threat.severity) {
      case 'critical': return 0.15;
      case 'moderate': return 0.12;
      case 'low': return 0.1;
      default: return 0.08;
    }
  };

  // Create irregular asteroid geometry
  const asteroidGeometry = useMemo(() => createAsteroidGeometry(getSize(), index * 42), [index]);

  // Don't render if burned up - but keep it after all hooks to avoid violations
  if (burnedUp) {
    return null;
  }

  return (
    <group ref={markerRef}>
      {/* Large invisible hitbox for easier clicking (3x size) */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={handleClick}
      >
        <sphereGeometry args={[getSize() * 3, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      
      {/* Irregular asteroid mesh (visual only) */}
      <mesh geometry={asteroidGeometry}>
        <meshStandardMaterial
          color={getColor()}
          emissive={hovered ? getGlowColor() : '#3a2f25'}
          emissiveIntensity={hovered ? 0.3 : 0.15}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Point light to make asteroid more visible */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" distance={0.5} />
      
      {/* Selection ring when hovered */}
      {hovered && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[getSize() * 2, 0.01, 8, 32]} />
            <meshBasicMaterial color={getGlowColor()} transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[getSize() * 2, 0.01, 8, 32]} />
            <meshBasicMaterial color={getGlowColor()} transparent opacity={0.8} />
          </mesh>
        </>
      )}
      
      {/* Atmospheric Burnup Effect */}
      {showBurnup && (
        <BurnupEffect 
          position={markerRef.current ? [markerRef.current.position.x, markerRef.current.position.y, markerRef.current.position.z] : [0, 0, 0]} 
          intensity={diameter / 25} 
        />
      )}
      
      {/* Tooltip on hover */}
      {hovered && (
        <Html 
          distanceFactor={15}
          position={[getSize() * 3, 0, 0]}
          style={{
            transform: 'translate(10px, -50%)',
            pointerEvents: 'none'
          }}
        >
          <div className="bg-black/95 text-white px-1.5 py-0.5 rounded border border-neon-red font-mono shadow-lg" style={{ fontSize: '8px', maxWidth: '140px' }}>
            <div className="font-bold text-neon-red mb-0.5 truncate" style={{ fontSize: '9px' }}>⚠️ {threat.data?.name || threat.title}</div>
            <div className="text-orange-400" style={{ fontSize: '7px' }}>{threat.severity.toUpperCase()}</div>
            {diameter && <div className="text-gray-300" style={{ fontSize: '7px' }}>Ø {Math.round(diameter)}m</div>}
            {velocity && <div className="text-blue-400" style={{ fontSize: '7px' }}>🚀 {velocity.toFixed(1)} km/s</div>}
            {diameter < 25 && (
              <div className="text-yellow-400 mt-0.5 pt-0.5 border-t border-gray-700" style={{ fontSize: '7px' }}>
                🔥 Will burn up in atmosphere
              </div>
            )}
            <div className="text-neon-green mt-0.5 text-center border-t border-gray-700 pt-0.5" style={{ fontSize: '8px' }}>
              🎯 CLICK TO DEFLECT
            </div>
          </div>
        </Html>
      )}
      
      {/* Pulsing outer glow - only visible for critical threats */}
      {threat.severity === 'critical' && (
        <Sphere args={[getSize() * 1.5, 16, 16]}>
          <meshBasicMaterial
            color={getGlowColor()}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>
      )}
    </group>
  );
}

// Orbit ring component
function OrbitRing({ radius, color = '#4477ff', opacity = 0.1 }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    return pts;
  }, [radius]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

// Satellite component with detection radius
function Satellite({ satellite, index, onUpgrade, isPaused = false }) {
  const satelliteRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  // Use timestamp-based animation instead of accumulating delta
  const startTimeRef = useRef(Date.now());
  const pausedTimeRef = useRef(0); // Total time spent paused
  const pauseStartRef = useRef(null); // When current pause started
  
  const radius = 2.5; // Close orbit for satellites
  const speed = 0.8;
  
  // Initialize timing on mount
  React.useEffect(() => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = isPaused ? Date.now() : null;
  }, [satellite?.id]);
  
  // Track pause state changes
  React.useEffect(() => {
    if (isPaused && pauseStartRef.current === null) {
      // Just paused
      pauseStartRef.current = Date.now();
    } else if (!isPaused && pauseStartRef.current !== null) {
      // Just unpaused
      pausedTimeRef.current += (Date.now() - pauseStartRef.current);
      pauseStartRef.current = null;
    }
  }, [isPaused]);
  
  // Use satellite's orbit position or calculate from index
  const orbitPosition = satellite?.orbitPosition || (index * Math.PI * 2) / 3;
  const detectionRadius = satellite?.detectionRadius || 3.5;
  const level = satellite?.level || 1;
  
  const handleClick = async (e) => {
    e.stopPropagation();
    if (upgrading || !onUpgrade || level >= 3) return;
    
    setUpgrading(true);
    await onUpgrade(satellite.id, 'satellite');
    setUpgrading(false);
  };
  
  useFrame(() => {
    if (satelliteRef.current) {
      // Calculate elapsed game time (excluding paused time)
      let currentPausedTime = pausedTimeRef.current;
      if (isPaused && pauseStartRef.current !== null) {
        currentPausedTime += (Date.now() - pauseStartRef.current);
      }
      
      const elapsedTime = (Date.now() - startTimeRef.current - currentPausedTime) / 1000;
      
      // Calculate position based on elapsed time
      const t = elapsedTime * speed + orbitPosition;
      satelliteRef.current.position.x = Math.cos(t) * radius;
      satelliteRef.current.position.z = Math.sin(t) * radius;
      satelliteRef.current.position.y = Math.sin(t * 2) * 0.2;
      satelliteRef.current.rotation.y = t;
    }
  });

  return (
    <group ref={satelliteRef}>
      {/* 3D Detection Sphere - Only show wireframe when hovered */}
      {hovered && (
        <>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[detectionRadius, 32, 32]} />
            <meshBasicMaterial 
              color="#00d4ff" 
              wireframe
              transparent 
              opacity={0.4} 
            />
          </mesh>
          
          {/* Inner detection sphere - subtle fill */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[detectionRadius, 32, 32]} />
            <meshBasicMaterial 
              color="#00d4ff" 
              transparent 
              opacity={0.08} 
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      
      {/* Tooltip */}
      {hovered && (
        <Html 
          distanceFactor={15}
          position={[0, 0.3, 0]}
          style={{
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none'
          }}
        >
          <div className="bg-black/95 text-white px-1.5 py-0.5 rounded border border-neon-blue font-mono shadow-lg" style={{ fontSize: '9px', maxWidth: '120px' }}>
            <div className="font-bold text-neon-blue mb-0.5" style={{ fontSize: '10px' }}>🛰️ Lv{level}</div>
            <div className="text-gray-300" style={{ fontSize: '8px' }}>R: {detectionRadius.toFixed(1)}</div>
            {level < 3 && (
              <div className="mt-0.5 border-t border-gray-700 pt-0.5 text-center">
                <div className="text-yellow-400" style={{ fontSize: '7px' }}>${level * 100}K</div>
              </div>
            )}
          </div>
        </Html>
      )}
      {/* Main satellite body */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = level < 3 ? 'pointer' : 'default';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={handleClick}
      >
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial 
          color={level >= 3 ? "#00ff00" : "#00d4ff"} 
          metalness={0.8} 
          roughness={0.2}
          emissive={level >= 3 ? "#00ff00" : "#00d4ff"}
          emissiveIntensity={hovered ? 0.8 : (level >= 3 ? 0.3 : 0)}
        />
      </mesh>
      {/* Solar panels */}
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.05, 0.08]} />
        <meshStandardMaterial color="#4477ff" metalness={0.6} />
      </mesh>
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.05, 0.08]} />
        <meshStandardMaterial color="#4477ff" metalness={0.6} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#00d4ff" distance={0.5} />
    </group>
  );
}

// Laser Beam component
function LaserBeam({ startPosition, endPosition, level = 1, intensity = 1 }) {
  const beamRef = useRef();
  
  // Calculate beam color and thickness based on level
  const getBeamColor = (level) => {
    switch(level) {
      case 1: return '#00ff88'; // Green - basic
      case 2: return '#00d4ff'; // Blue - improved
      case 3: return '#ff00ff'; // Magenta - max power
      default: return '#00ff88';
    }
  };
  
  const beamThickness = 0.04 + (level * 0.02); // Thicker at higher levels for better visibility
  const color = getBeamColor(level);
  
  // Animate intensity
  useFrame(({ clock }) => {
    if (beamRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 10) * 0.3 + 0.7;
      beamRef.current.material.opacity = intensity * pulse * 0.9; // Slightly more opaque
    }
  });
  
  // Calculate distance and midpoint
  const start = new THREE.Vector3(...startPosition);
  const end = new THREE.Vector3(...endPosition);
  const direction = new THREE.Vector3().subVectors(end, start);
  const distance = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  // Create rotation to point towards target
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  return (
    <group position={midpoint} quaternion={quaternion}>
      {/* Main beam */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[beamThickness, beamThickness * 0.5, distance, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Core glow */}
      <mesh>
        <cylinderGeometry args={[beamThickness * 0.4, beamThickness * 0.2, distance, 8]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Particles at impact point */}
      <pointLight position={[0, distance / 2, 0]} intensity={level * 3} color={color} distance={2} />
      <pointLight position={[0, -distance / 2, 0]} intensity={level * 2} color={color} distance={2} />
    </group>
  );
}

// Probe component with laser capabilities
function Probe({ probe, index, onUpgrade, isPaused = false, onPositionUpdate }) {
  const probeRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  
  // Use timestamp-based animation instead of accumulating delta
  const startTimeRef = useRef(Date.now());
  const pausedTimeRef = useRef(0); // Total time spent paused
  const pauseStartRef = useRef(null); // When current pause started
  
  const radius = 2.8;
  const speed = 0.6;
  
  // Initialize timing on mount
  React.useEffect(() => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = isPaused ? Date.now() : null;
  }, [probe?.id]);
  
  // Track pause state changes
  React.useEffect(() => {
    if (isPaused && pauseStartRef.current === null) {
      // Just paused
      pauseStartRef.current = Date.now();
    } else if (!isPaused && pauseStartRef.current !== null) {
      // Just unpaused
      pausedTimeRef.current += (Date.now() - pauseStartRef.current);
      pauseStartRef.current = null;
    }
  }, [isPaused]);
  
  // Use probe's orbit position or calculate from index
  const orbitPosition = probe?.orbitPosition || (index * Math.PI * 2) / 3 + Math.PI;
  const level = probe?.level || 1;
  const laserPower = probe?.laserPower || 100;
  
  const handleClick = async (e) => {
    e.stopPropagation();
    if (upgrading || !onUpgrade || level >= 3) return;
    
    setUpgrading(true);
    await onUpgrade(probe.id, 'probe');
    setUpgrading(false);
  };
  
  useFrame(() => {
    if (probeRef.current) {
      // Calculate elapsed game time (excluding paused time)
      let currentPausedTime = pausedTimeRef.current;
      if (isPaused && pauseStartRef.current !== null) {
        currentPausedTime += (Date.now() - pauseStartRef.current);
      }
      
      const elapsedTime = (Date.now() - startTimeRef.current - currentPausedTime) / 1000;
      
      // Calculate position based on elapsed time
      const t = elapsedTime * speed + orbitPosition;
      const x = Math.cos(t) * radius;
      const y = Math.cos(t * 1.5) * 0.3;
      const z = Math.sin(t) * radius;
      
      probeRef.current.position.x = x;
      probeRef.current.position.z = z;
      probeRef.current.position.y = y;
      probeRef.current.rotation.y = t + Math.PI / 2;
      
      // Update parent with current position for laser targeting
      if (onPositionUpdate) {
        onPositionUpdate(probe.id, [x, y, z]);
      }
    }
  });

  return (
    <group ref={probeRef}>
      {/* Tooltip */}
      {hovered && (
        <Html 
          distanceFactor={15}
          position={[0, 0.3, 0]}
          style={{
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none'
          }}
        >
          <div className="bg-black/95 text-white px-1.5 py-0.5 rounded border border-neon-green font-mono shadow-lg" style={{ fontSize: '9px', maxWidth: '120px' }}>
            <div className="font-bold text-neon-green mb-0.5" style={{ fontSize: '10px' }}>🚀 Lv{level}</div>
            <div className="text-gray-300" style={{ fontSize: '8px' }}>⚡{laserPower}%</div>
            {level < 3 && (
              <div className="mt-0.5 border-t border-gray-700 pt-0.5 text-center">
                <div className="text-yellow-400" style={{ fontSize: '7px' }}>${level * 150}K</div>
              </div>
            )}
          </div>
        </Html>
      )}
      {/* Probe body - cone shape */}
      <mesh 
        rotation={[0, 0, Math.PI / 2]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = level < 3 ? 'pointer' : 'default';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onClick={handleClick}
      >
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial 
          color={level >= 3 ? "#ffaa00" : "#00ff88"} 
          metalness={0.7} 
          roughness={0.3}
          emissive={level >= 3 ? "#ffaa00" : "#00ff88"}
          emissiveIntensity={hovered ? 0.8 : (level >= 3 ? 0.3 : 0)}
        />
      </mesh>
      {/* Engine glow */}
      <mesh position={[-0.08, 0, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      <pointLight position={[-0.08, 0, 0]} intensity={0.4} color="#ffaa00" distance={0.4} />
    </group>
  );
}

// Research Station (shown when research teams are active)
function ResearchStation({ index }) {
  const stationRef = useRef();
  const radius = 2.3;
  const angle = (index * Math.PI * 2) / 3; // Fixed position
  
  useFrame(() => {
    if (stationRef.current) {
      stationRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group
      ref={stationRef}
      position={[
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]}
    >
      {/* Station core */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Ring modules */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial color="#ffaa00" metalness={0.6} />
      </mesh>
      {/* Glow */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#ffd700" distance={0.6} />
    </group>
  );
}

// Main 3D Scene
function Scene({ threats, gameState, onDeflectAsteroid, onImpact, onUpgrade, activeLasers = [], impactFlashes = [], isPaused = false, onProbePositionUpdate }) {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Point light simulating the sun */}
      <pointLight position={[10, 5, 5]} intensity={1.5} color="#ffffff" />
      
      {/* Additional fill light */}
      <pointLight position={[-10, -5, -5]} intensity={0.5} color="#4477ff" />
      
      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={isPaused ? 0 : 1}
      />
      
      {/* Earth with NASA Blue Marble texture */}
      <Suspense fallback={<FallbackEarth />}>
        <Earth isPaused={isPaused} />
      </Suspense>
      
      {/* Orbit rings */}
      <OrbitRing radius={2.5} color="#00d4ff" opacity={0.12} /> {/* Satellite orbit */}
      <OrbitRing radius={2.8} color="#00ff88" opacity={0.10} /> {/* Probe orbit */}
      <OrbitRing radius={3.5} opacity={0.08} />
      <OrbitRing radius={4} opacity={0.06} />
      
      {/* Deployed Satellites with detection radii */}
      {gameState && Array.isArray(gameState.satellites) && gameState.satellites.map((satellite, index) => (
        <Satellite key={satellite.id || `sat-${index}`} satellite={satellite} index={index} onUpgrade={onUpgrade} isPaused={isPaused} />
      ))}
      
      {/* Deployed Probes */}
      {gameState && Array.isArray(gameState.probes) && gameState.probes.map((probe, index) => (
        <Probe 
          key={probe.id || `probe-${index}`} 
          probe={probe} 
          index={index} 
          onUpgrade={onUpgrade} 
          isPaused={isPaused}
          onPositionUpdate={onProbePositionUpdate}
        />
      ))}
      
      {/* Research Stations */}
      {gameState && Array.from({ length: gameState.researchTeams }).map((_, index) => (
        <ResearchStation key={`research-${index}`} index={index} />
      ))}
      
      {/* Upgrade Effects - AI Tracking Network */}
      {gameState?.upgrades?.aiTracking && (
        <mesh>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshBasicMaterial
            color="#00d4ff"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
      
      {/* Upgrade Effects - Improved Radar */}
      {gameState?.upgrades?.improvedRadar && (
        <>
          <mesh>
            <torusGeometry args={[2.4, 0.02, 16, 100]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.4, 0.02, 16, 100]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
          </mesh>
        </>
      )}
      
      {/* Asteroid threat markers */}
      {threats.slice(0, 5).map((threat, index) => (
        <AsteroidMarker 
          key={threat.id} 
          threat={threat} 
          index={index}
          onDeflect={onDeflectAsteroid}
          onImpact={onImpact}
          isPaused={isPaused}
        />
      ))}
      
      {/* Active laser beams */}
      {activeLasers.map((laser) => (
        <LaserBeam
          key={laser.id}
          startPosition={laser.startPosition}
          endPosition={laser.endPosition}
          level={laser.level}
          intensity={laser.intensity}
        />
      ))}
      
      {/* Impact flash effects */}
      {impactFlashes.map((flash) => (
        <ImpactFlash
          key={flash.id}
          position={flash.position}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Impact flash effect component
function ImpactFlash({ position = [0, 0, 0], onComplete }) {
  const flashRef = useRef();
  const [scale, setScale] = useState(0.1);
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    let startTime = Date.now();
    const duration = 1000; // 1 second flash
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      setScale(0.1 + progress * 1.5); // Expand from 0.1 to 1.6
      setOpacity(1 - progress); // Fade out
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete && onComplete();
      }
    };
    
    animate();
  }, [onComplete]);
  
  return (
    <group position={position}>
      <mesh ref={flashRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight 
        color="#ff4400" 
        intensity={opacity * 3} 
        distance={5}
      />
    </group>
  );
}

// Main Earth3D component
const Earth3D = ({ threats = [], gameState = null, onDeflectAsteroid = null, onImpact = null, onUpgrade = null }) => {
  const [activeLasers, setActiveLasers] = useState([]);
  const [impactFlashes, setImpactFlashes] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  
  // Track real-time probe positions for accurate laser targeting
  const probePositionsRef = useRef({});
  
  // Callback for probes to update their positions
  const handleProbePositionUpdate = useCallback((probeId, position) => {
    probePositionsRef.current[probeId] = position;
  }, []);
  
  // Wrapper for impact that shows flash effect
  const handleImpactWithFlash = (threat, asteroidPosition) => {
    if (!onImpact) return;
    
    // Use actual asteroid position at moment of impact
    const earthRadius = 2;
    
    // Normalize position to Earth surface
    const magnitude = Math.sqrt(
      asteroidPosition[0] ** 2 + 
      asteroidPosition[1] ** 2 + 
      asteroidPosition[2] ** 2
    );
    const surfacePosition = [
      (asteroidPosition[0] / magnitude) * earthRadius,
      (asteroidPosition[1] / magnitude) * earthRadius,
      (asteroidPosition[2] / magnitude) * earthRadius
    ];
    
    // Add flash effect at actual impact location
    const flashId = `impact-${Date.now()}`;
    setImpactFlashes(prev => [...prev, {
      id: flashId,
      position: surfacePosition
    }]);
    
    // Remove flash after animation
    setTimeout(() => {
      setImpactFlashes(prev => prev.filter(f => f.id !== flashId));
    }, 1200);
    
    // Process the impact
    onImpact(threat);
  };
  
  // Wrapper for deflect that shows laser beam
  const handleDeflectWithLaser = async (threat) => {
    if (!onDeflectAsteroid || !gameState) return;
    
    // Check if we have available probe missions (not just deployed probes)
    if (!gameState.availableProbes || gameState.availableProbes <= 0) {
      // No probe missions available - execute deflection without laser visual
      return onDeflectAsteroid(threat);
    }
    
    // Find nearest probe to the asteroid
    const asteroidPosition = calculateAsteroidPosition(threat);
    const nearestProbe = findNearestProbe(gameState.probes, asteroidPosition);
    
    // If no probe with line of sight, use any available probe (gameplay over realism)
    let selectedProbe = nearestProbe;
    if (!selectedProbe && gameState.probes.length > 0) {
      selectedProbe = gameState.probes[0];
      console.log('No line of sight - using first available probe');
    }
    
    if (!selectedProbe) {
      // No deployed probes - execute deflection without laser visual
      return onDeflectAsteroid(threat);
    }
    
    // Calculate probe position
    const probePosition = calculateProbePosition(selectedProbe);
    
    // Show laser beam
    const laserId = `${selectedProbe.id}-${threat.id}-${Date.now()}`;
    setActiveLasers(prev => [...prev, {
      id: laserId,
      probeId: selectedProbe.id,
      targetId: threat.id,
      startPosition: probePosition,
      endPosition: asteroidPosition,
      level: selectedProbe.level || 1,
      intensity: 1
    }]);
    
    // Wait for laser animation (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Execute deflection
    const result = await onDeflectAsteroid(threat);
    
    // Keep laser for another 300ms
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Remove laser
    setActiveLasers(prev => prev.filter(l => l.id !== laserId));
    
    return result;
  };
  
  // Helper to calculate asteroid position based on approach data
  const calculateAsteroidPosition = (threat) => {
    // Use actual current position if available (passed from asteroid click)
    if (threat.currentPosition) {
      return threat.currentPosition;
    }
    
    if (!threat?.data) return [0, 0, 0];
    
    const approachAngle = threat.data?.approachAngle || 0;
    const polarAngle = threat.data?.polarAngle || 0;
    const velocity = parseFloat(threat.data?.velocity) || 10; // km/s
    const initialDistance = parseFloat(threat.data?.distance) || 1000000; // km
    
    // Match the AsteroidMarker calculation
    const GAME_UNIT_KM = 200000;
    const startDistance = initialDistance / GAME_UNIT_KM;
    const earthRadius = 2;
    
    // Estimate current position (rough approximation for laser targeting)
    const estimatedProgress = 0.3; // Assume asteroid is ~30% along its path when clicked
    const estimatedDistance = startDistance * (1 - estimatedProgress);
    const currentDistance = Math.max(earthRadius, estimatedDistance);
    
    // Position using 3D SPHERICAL COORDINATES (same as AsteroidMarker)
    const x = Math.cos(approachAngle) * Math.cos(polarAngle) * currentDistance;
    const y = Math.sin(polarAngle) * currentDistance;
    const z = Math.sin(approachAngle) * Math.cos(polarAngle) * currentDistance;
    
    return [x, y, z];
  };
  
  // Helper to check if there's a clear line of sight (no Earth blocking)
  const hasLineOfSight = (probePos, asteroidPos) => {
    const earthRadius = 2; // Earth's radius in game units
    
    // Vector from probe to asteroid
    const dx = asteroidPos[0] - probePos[0];
    const dy = asteroidPos[1] - probePos[1];
    const dz = asteroidPos[2] - probePos[2];
    
    // Find closest point on line segment to Earth center (0,0,0)
    const t = -(probePos[0] * dx + probePos[1] * dy + probePos[2] * dz) / (dx * dx + dy * dy + dz * dz);
    const clampedT = Math.max(0, Math.min(1, t));
    
    // Closest point coordinates
    const closestX = probePos[0] + clampedT * dx;
    const closestY = probePos[1] + clampedT * dy;
    const closestZ = probePos[2] + clampedT * dz;
    
    // Distance from closest point to Earth center
    const distanceToEarth = Math.sqrt(closestX * closestX + closestY * closestY + closestZ * closestZ);
    
    // Line of sight is clear if closest point is outside Earth
    return distanceToEarth > earthRadius;
  };
  
  // Helper to find nearest probe with line of sight
  const findNearestProbe = (probes, asteroidPosition) => {
    if (!Array.isArray(probes) || probes.length === 0) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    probes.forEach(probe => {
      const probePos = calculateProbePosition(probe);
      
      // Check line of sight
      if (!hasLineOfSight(probePos, asteroidPosition)) {
        return; // Skip this probe, Earth is in the way
      }
      
      const dist = Math.sqrt(
        Math.pow(probePos[0] - asteroidPosition[0], 2) +
        Math.pow(probePos[1] - asteroidPosition[1], 2) +
        Math.pow(probePos[2] - asteroidPosition[2], 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = probe;
      }
    });
    
    return nearest;
  };
  
  // Helper to calculate probe position - uses real-time positions from probe updates
  const calculateProbePosition = (probe) => {
    // Use the real-time position if available
    if (probePositionsRef.current[probe.id]) {
      return probePositionsRef.current[probe.id];
    }
    
    // Fallback to calculated position based on orbitPosition
    const radius = 2.8;
    const angle = probe?.orbitPosition || 0;
    
    return [
      Math.cos(angle) * radius,
      Math.cos(angle * 1.5) * 0.3,
      Math.sin(angle) * radius
    ];
  };
  
  return (
    <div 
      className="w-full h-full bg-black rounded-lg overflow-hidden relative"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
    >
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene 
          threats={threats} 
          gameState={gameState}
          onDeflectAsteroid={handleDeflectWithLaser}
          onImpact={handleImpactWithFlash} 
          onUpgrade={onUpgrade}
          activeLasers={activeLasers}
          impactFlashes={impactFlashes}
          isPaused={isPaused}
          onProbePositionUpdate={handleProbePositionUpdate}
        />
      </Canvas>
    </div>
  );
};

export default Earth3D;

