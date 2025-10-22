import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Earth component with real NASA texture
function Earth({ textureUrl }) {
  const earthRef = useRef();
  
  // Rotate Earth continuously
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002; // Slow rotation
    }
  });

  // Try to load real NASA EPIC texture
  let texture = null;
  try {
    if (textureUrl) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      texture = useLoader(THREE.TextureLoader, textureUrl);
    }
  } catch (error) {
    console.warn('Failed to load Earth texture, using fallback');
  }

  // Create Earth material - with texture if available, otherwise blue
  const earthMaterial = useMemo(() => {
    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.2,
      });
    } else {
      return new THREE.MeshStandardMaterial({
        color: '#2233ff',
        emissive: '#112244',
        roughness: 0.9,
        metalness: 0.1,
      });
    }
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

// Fallback Earth (no texture)
function FallbackEarth() {
  const earthRef = useRef();
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  const earthMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2233ff',
      emissive: '#112244',
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  return (
    <Sphere ref={earthRef} args={[2, 64, 64]} material={earthMaterial}>
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

// Asteroid marker component
function AsteroidMarker({ threat, index }) {
  const markerRef = useRef();
  
  // Orbital parameters
  const radius = 3 + (index * 0.3); // Vary orbit radius
  const speed = 0.5 + (index * 0.1);
  const offset = (index * Math.PI * 2) / 5; // Spread evenly
  
  useFrame(({ clock }) => {
    if (markerRef.current) {
      const t = clock.getElapsedTime() * speed + offset;
      markerRef.current.position.x = Math.cos(t) * radius;
      markerRef.current.position.z = Math.sin(t) * radius;
      markerRef.current.position.y = Math.sin(t * 0.5) * 0.5; // Slight vertical movement
    }
  });

  // Color based on severity
  const getColor = () => {
    switch (threat.severity) {
      case 'critical': return '#ff0040';
      case 'moderate': return '#ff8800';
      case 'low': return '#ffd700';
      default: return '#00ff88';
    }
  };

  // Size based on severity
  const getSize = () => {
    switch (threat.severity) {
      case 'critical': return 0.15;
      case 'moderate': return 0.12;
      case 'low': return 0.1;
      default: return 0.08;
    }
  };

  return (
    <group ref={markerRef}>
      {/* Main marker sphere */}
      <Sphere args={[getSize(), 16, 16]}>
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
        />
      </Sphere>
      
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
      {/* Main satellite body */}
      <mesh>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshStandardMaterial color="#00d4ff" metalness={0.8} roughness={0.2} />
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
      {/* Probe body - cone shape */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshStandardMaterial color="#00ff88" metalness={0.7} roughness={0.3} />
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
function Scene({ threats, gameState, earthTextureUrl }) {
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
      
      {/* Earth with real NASA texture */}
      <Suspense fallback={<FallbackEarth />}>
        <Earth textureUrl={earthTextureUrl} />
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
        <AsteroidMarker key={threat.id} threat={threat} index={index} />
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
const Earth3D = ({ threats = [], gameState = null }) => {
  const [earthTextureUrl, setEarthTextureUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch latest Earth image from NASA EPIC API on mount
  React.useEffect(() => {
    const fetchEarthImage = async () => {
      try {
        const response = await fetch('/api/epic/latest');
        const data = await response.json();
        
        if (data.success && data.image?.imageUrl) {
          // Use CORS proxy for NASA images
          setEarthTextureUrl(data.image.imageUrl);
          console.log('Loaded NASA EPIC Earth image:', data.image.imageUrl);
        }
      } catch (error) {
        console.warn('Failed to load NASA Earth image, using fallback', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthImage();
    
    // Refresh Earth image every 10 minutes
    const interval = setInterval(fetchEarthImage, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-neon-blue font-mono text-sm">Loading NASA Earth data...</div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene threats={threats} gameState={gameState} earthTextureUrl={earthTextureUrl} />
      </Canvas>
    </div>
  );
};

export default Earth3D;

