import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Earth component
function Earth() {
  const earthRef = useRef();
  
  // Rotate Earth continuously
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002; // Slow rotation
    }
  });

  // Create Earth material with colors (simplified without texture loading)
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

// Main 3D Scene
function Scene({ threats }) {
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
      
      {/* Earth */}
      <Earth />
      
      {/* Orbit rings */}
      <OrbitRing radius={3} opacity={0.15} />
      <OrbitRing radius={3.5} opacity={0.1} />
      <OrbitRing radius={4} opacity={0.08} />
      
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
const Earth3D = ({ threats = [] }) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene threats={threats} />
      </Canvas>
    </div>
  );
};

export default Earth3D;

