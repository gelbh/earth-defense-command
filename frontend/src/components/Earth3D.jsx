import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with proper spherical texture
function Earth() {
  const earthRef = useRef();
  
  // Rotate Earth continuously
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002; // Slow rotation
    }
  });

  // Use reliable CORS-friendly Earth texture
  // Using jsdelivr CDN which is fast and reliable
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

// Asteroid marker component - APPROACHING Earth (not orbiting)
function AsteroidMarker({ threat, index, onDeflect }) {
  const markerRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Approach mechanics from threat data
  const approachAngle = threat.data?.approachAngle || (index * Math.PI * 2) / 5;
  const velocity = parseFloat(threat.data?.velocity) || 10;
  const timeToImpact = threat.data?.timeToImpact || 5; // minutes
  const detectedAt = threat.data?.detectedAt || Date.now();
  
  // Calculate current distance based on time elapsed
  // Start far away, move toward Earth over time
  const startDistance = 8; // Start far from Earth
  const earthRadius = 2; // Earth sphere radius
  
  // Track position for when paused
  const pausedPosition = useRef({ x: 0, y: 0, z: 0 });
  const pausedTime = useRef(0);
  
  useFrame(({ clock }) => {
    if (markerRef.current) {
      const currentTime = hovered ? pausedTime.current : clock.getElapsedTime();
      
      if (!hovered) {
        pausedTime.current = currentTime;
      }
      
      // Time since detection (seconds)
      const elapsedSeconds = currentTime;
      const elapsedMinutes = elapsedSeconds / 60;
      
      // Calculate progress: 0 (far) to 1 (Earth)
      const progress = Math.min(1, elapsedMinutes / Math.max(0.1, timeToImpact));
      
      // Linear approach toward Earth
      const currentDistance = startDistance - (startDistance - earthRadius) * progress;
      
      // Position along approach vector
      const x = Math.cos(approachAngle) * currentDistance;
      const z = Math.sin(approachAngle) * currentDistance;
      const y = Math.sin(approachAngle * 0.5) * 0.3; // Slight vertical variation
      
      markerRef.current.position.x = x;
      markerRef.current.position.z = z;
      markerRef.current.position.y = y;
      
      // Save position for when we pause
      pausedPosition.current = { x, y, z };
      
      // Rotation speed based on hover
      const rotationSpeed = hovered ? 0.001 : 0.01;
      markerRef.current.rotation.x += rotationSpeed;
      markerRef.current.rotation.y += rotationSpeed * 0.5;
      
      // Check if asteroid reached Earth (impact!)
      if (progress >= 1 && !hovered) {
        // TODO: Trigger impact event
        console.warn(`Asteroid ${threat.title} IMPACT!`);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onDeflect) {
      onDeflect(threat);
    }
  };

  // Color based on severity
  const getColor = () => {
    switch (threat.severity) {
      case 'critical': return '#ff0040';
      case 'moderate': return '#ff8800';
      case 'low': return '#ffd700';
      default: return '#00ff88';
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
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Selection ring when hovered */}
      {hovered && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[getSize() * 2, 0.01, 8, 32]} />
            <meshBasicMaterial color={getColor()} transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[getSize() * 2, 0.01, 8, 32]} />
            <meshBasicMaterial color={getColor()} transparent opacity={0.8} />
          </mesh>
        </>
      )}
      
      {/* Countdown Timer (always visible) */}
      <Html distanceFactor={10} position={[0, getSize() * 2.5, 0]}>
        <div className="bg-black/80 px-2 py-1 rounded border border-neon-red text-xs font-mono font-bold whitespace-nowrap pointer-events-none text-center">
          <div className="text-neon-red">
            ⏱️ {(() => {
              const elapsedMinutes = (useRef(0).current || 0) / 60;
              const remainingMinutes = Math.max(0, timeToImpact - elapsedMinutes);
              const mins = Math.floor(remainingMinutes);
              const secs = Math.floor((remainingMinutes - mins) * 60);
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            })()}
          </div>
        </div>
      </Html>
      
      {/* Trajectory line showing path to Earth */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              markerRef.current?.position.x || 0,
              markerRef.current?.position.y || 0,
              markerRef.current?.position.z || 0,
              0, 0, 0 // Earth center
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={getColor()} transparent opacity={0.3} linewidth={2} />
      </line>
      
      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/95 text-white px-3 py-2 rounded-lg border-2 border-neon-red text-xs font-mono whitespace-nowrap pointer-events-none shadow-2xl">
            <div className="font-bold text-neon-red text-sm mb-1">⚠️ {threat.title}</div>
            <div className="text-orange-400">Risk: {threat.severity.toUpperCase()}</div>
            {threat.data?.diameter && <div className="text-gray-300">Size: {Math.round(threat.data.diameter)}m</div>}
            {threat.data?.velocity && <div className="text-gray-300">Speed: {Math.round(threat.data.velocity)} km/s</div>}
            {threat.data?.distance && <div className="text-gray-400">Distance: {Math.round(threat.data.distance / 1000)}k km</div>}
            <div className="text-neon-green mt-2 text-center font-bold border-t border-gray-600 pt-1">
              🎯 CLICK TO DEFLECT
            </div>
          </div>
        </Html>
      )}
      
      {/* Pulsing outer glow */}
      <Sphere args={[getSize() * 1.5, 16, 16]}>
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Warning cone pointing to Earth */}
      {threat.severity === 'critical' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.05, 0.3, 8]} />
          <meshBasicMaterial color="#ff0040" transparent opacity={0.6} />
        </mesh>
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

// Satellite component
function Satellite({ index, total }) {
  const satelliteRef = useRef();
  const [hovered, setHovered] = useState(false);
  const radius = 2.5; // Close orbit for satellites
  const speed = 0.8;
  const offset = (index * Math.PI * 2) / total;
  
  useFrame(({ clock }) => {
    if (satelliteRef.current) {
      const t = clock.getElapsedTime() * speed + offset;
      satelliteRef.current.position.x = Math.cos(t) * radius;
      satelliteRef.current.position.z = Math.sin(t) * radius;
      satelliteRef.current.position.y = Math.sin(t * 2) * 0.2;
      // Rotate satellite
      satelliteRef.current.rotation.y = t;
    }
  });

  return (
    <group ref={satelliteRef}>
      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg border border-neon-blue text-xs font-mono whitespace-nowrap pointer-events-none">
            <div className="font-bold text-neon-blue">🛰️ Monitoring Satellite</div>
            <div className="text-gray-300">Detects incoming threats</div>
            <div className="text-gray-400">Orbital tracking system</div>
          </div>
        </Html>
      )}
      {/* Main satellite body */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial 
          color="#00d4ff" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#00d4ff"
          emissiveIntensity={hovered ? 0.5 : 0}
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

// Probe component
function Probe({ index, total }) {
  const probeRef = useRef();
  const [hovered, setHovered] = useState(false);
  const radius = 2.8;
  const speed = 0.6;
  const offset = (index * Math.PI * 2) / total + Math.PI; // Offset from satellites
  
  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime() * speed + offset;
      probeRef.current.position.x = Math.cos(t) * radius;
      probeRef.current.position.z = Math.sin(t) * radius;
      probeRef.current.position.y = Math.cos(t * 1.5) * 0.3;
      // Point probe in direction of travel
      probeRef.current.rotation.y = t + Math.PI / 2;
    }
  });

  return (
    <group ref={probeRef}>
      {/* Tooltip */}
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg border border-neon-green text-xs font-mono whitespace-nowrap pointer-events-none">
            <div className="font-bold text-neon-green">🚀 Deflection Probe</div>
            <div className="text-gray-300">Ready to intercept threats</div>
            <div className="text-gray-400">Kinetic impactor system</div>
          </div>
        </Html>
      )}
      {/* Probe body - cone shape */}
      <mesh 
        rotation={[0, 0, Math.PI / 2]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial 
          color="#00ff88" 
          metalness={0.7} 
          roughness={0.3}
          emissive="#00ff88"
          emissiveIntensity={hovered ? 0.5 : 0}
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
function Scene({ threats, gameState, onDeflectAsteroid }) {
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
        speed={1}
      />
      
      {/* Earth with NASA Blue Marble texture */}
      <Suspense fallback={<FallbackEarth />}>
        <Earth />
      </Suspense>
      
      {/* Orbit rings */}
      <OrbitRing radius={2.5} color="#00d4ff" opacity={0.12} /> {/* Satellite orbit */}
      <OrbitRing radius={2.8} color="#00ff88" opacity={0.10} /> {/* Probe orbit */}
      <OrbitRing radius={3.5} opacity={0.08} />
      <OrbitRing radius={4} opacity={0.06} />
      
      {/* Deployed Satellites */}
      {gameState && Array.from({ length: gameState.satellites }).map((_, index) => (
        <Satellite key={`sat-${index}`} index={index} total={gameState.satellites} />
      ))}
      
      {/* Deployed Probes */}
      {gameState && Array.from({ length: gameState.probes }).map((_, index) => (
        <Probe key={`probe-${index}`} index={index} total={gameState.probes} />
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
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// Main Earth3D component
const Earth3D = ({ threats = [], gameState = null, onDeflectAsteroid = null }) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene threats={threats} gameState={gameState} onDeflectAsteroid={onDeflectAsteroid} />
      </Canvas>
    </div>
  );
};

export default Earth3D;

