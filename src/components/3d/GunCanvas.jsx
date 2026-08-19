import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import GunModel from './GunModel';

// Performance-optimized Particle Component for Firing Effects
// Defined OUTSIDE to prevent unmounting and recreating WebGL context
function FireParticles({ isFiring, muzzleFlashRef }) {
  const sparksRef = useRef([]);
  const casingsRef = useRef([]);
  const flashRef = useRef(null);
  const flashLightRef = useRef(null);
  const flashGroupRef = useRef(null);
  const flashTimeRef = useRef(0);

  // Trigger burst when firing is active
  useEffect(() => {
    if (isFiring && muzzleFlashRef && muzzleFlashRef.current) {
      const pos = muzzleFlashRef.current; // [x, y, z]

      // 1. Trigger Muzzle Flash (turn on visual sphere and point light)
      if (flashRef.current) flashRef.current.scale.setScalar(1.2 + Math.random() * 0.5);
      if (flashLightRef.current) flashLightRef.current.intensity = 8.0;
      flashTimeRef.current = 0.06; // show for 60ms

      // 2. Generate Sparks (18 bright yellow/red sparks shooting out of muzzle tip)
      const sparkCount = 18;
      for (let i = 0; i < sparkCount; i++) {
        const spark = {
          pos: new THREE.Vector3(...pos),
          // Gun barrel points to left (-X), so shoot sparks along -X axis
          vel: new THREE.Vector3(
            -4.5 - Math.random() * 4,
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 2.5
          ),
          color: Math.random() > 0.4 ? '#ffaa44' : '#ff3300',
          size: 0.015 + Math.random() * 0.02,
          life: 1.0,
          decay: 2.5 + Math.random() * 2.0
        };
        sparksRef.current.push(spark);
      }

      // 3. Generate Ejecting Bullet Casing (brass shell flying right and up)
      // Casing eject position is roughly in the center receiver area (0.1, 0.2, 0.08)
      const shellPos = new THREE.Vector3(0.15, 0.2, 0.08);
      const casing = {
        pos: shellPos,
        vel: new THREE.Vector3(
          1.5 + Math.random() * 1.5, // fly up/right
          2.0 + Math.random() * 1.5,
          1.0 + Math.random() * 1.5
        ),
        rot: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        rotVel: new THREE.Vector3(Math.random() * 15, Math.random() * 15, Math.random() * 15),
        life: 1.0,
        decay: 1.0
      };
      casingsRef.current.push(casing);
    }
  }, [isFiring, muzzleFlashRef]);

  // Frame animation loop for particles
  useFrame((state, delta) => {
    // Keep muzzle flash sphere aligned to actual gun tip
    if (muzzleFlashRef.current && flashGroupRef.current) {
      flashGroupRef.current.position.set(...muzzleFlashRef.current);
    }

    // Decay muzzle flash
    if (flashTimeRef.current > 0) {
      flashTimeRef.current -= delta;
      if (flashTimeRef.current <= 0) {
        if (flashRef.current) flashRef.current.scale.setScalar(0);
        if (flashLightRef.current) flashLightRef.current.intensity = 0;
      } else {
        if (flashRef.current) flashRef.current.scale.multiplyScalar(0.75);
        if (flashLightRef.current) flashLightRef.current.intensity *= 0.65;
      }
    }

    // Update Sparks
    sparksRef.current = sparksRef.current.filter((s) => {
      s.life -= delta * s.decay;
      if (s.life <= 0) return false;
      
      s.pos.addScaledVector(s.vel, delta);
      s.vel.y -= delta * 1.5; // gravity
      s.vel.multiplyScalar(0.95); // drag
      return true;
    });

    // Update Casings
    casingsRef.current = casingsRef.current.filter((c) => {
      c.life -= delta * c.decay;
      if (c.life <= 0) return false;

      c.pos.addScaledVector(c.vel, delta);
      c.vel.y -= delta * 9.81; // heavy gravity
      c.rot.addScaledVector(c.rotVel, delta);
      
      // Floor bounce check (y = -0.7)
      if (c.pos.y < -0.7) {
        c.pos.y = -0.7;
        c.vel.y = -c.vel.y * 0.4;
        c.vel.x *= 0.6;
        c.vel.z *= 0.6;
        c.rotVel.multiplyScalar(0.3);
      }
      return true;
    });
  });

  return (
    <group>
      {/* Muzzle Flash Sphere Group */}
      <group ref={flashGroupRef}>
        <mesh ref={flashRef} scale={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#ffbb44" transparent opacity={0.9} />
        </mesh>
        <pointLight ref={flashLightRef} color="#ff7700" intensity={0} distance={4} />
      </group>

      {/* Sparks */}
      {sparksRef.current.map((s, idx) => (
        <mesh key={`s-${idx}`} position={s.pos.toArray()}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshBasicMaterial color={s.color} transparent opacity={s.life} />
        </mesh>
      ))}

      {/* Casings */}
      {casingsRef.current.map((c, idx) => (
        <mesh key={`c-${idx}`} position={c.pos.toArray()} rotation={c.rot.toArray()} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 8]} />
          <meshStandardMaterial color="#c29b38" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function GunCanvas({ config, isFiring, activeHotspot, setActiveHotspot }) {
  const muzzleFlashRef = useRef([0, 0, 0]);

  // Dynamic Hotspots definitions matching horizontal layout coordinates
  const hotspots = [
    {
      id: 'barrel',
      title: 'Muzzle & Barrel',
      desc: 'Normalized match-grade barrel supporting suppressor mount attachments.',
      pos: [-1.6, 0.18, 0]
    },
    {
      id: 'scope',
      title: 'Optic Rail Mount',
      desc: 'Universal picatinny tactical rail system. Fits holographic/red-dot scopes.',
      pos: [0.25, 0.45, 0]
    },
    {
      id: 'receiver',
      title: 'Receiver & Bolt',
      desc: 'Durable CNC steel housing with a smooth bolt and casing ejection port.',
      pos: [0.15, 0.15, 0.05]
    },
    {
      id: 'magazine',
      title: 'Magazine Well',
      desc: 'Quick-release release latch. Holds extended high-capacity curved mags.',
      pos: [-0.03, -0.42, 0]
    },
    {
      id: 'grip',
      title: 'Ergonomic Grip',
      desc: 'Textured slip-resistant grip structure providing high stability.',
      pos: [0.65, -0.4, 0]
    }
  ];

  const renderEnvironment = () => {
    switch (config.environment) {
      case 'neon':
        return (
          <>
            <color attach="background" args={['#030408']} />
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
            <pointLight position={[-4, 2, -2]} color="#00f2fe" intensity={3} distance={10} />
            <pointLight position={[4, 2, 2]} color="#ff007f" intensity={3} distance={10} />
            <pointLight position={[0, 4, -4]} color="#9b51e0" intensity={2} distance={8} />
            
            <gridHelper args={[30, 30, '#00f2fe', '#ff007f']} position={[0, -0.85, 0]} opacity={0.2} transparent />
            <mesh position={[0, -0.86, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#030408" roughness={0.9} metalness={0.1} />
            </mesh>
          </>
        );
      case 'warehouse':
        return (
          <>
            <color attach="background" args={['#0d0d12']} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[0, 15, 2]} intensity={2.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <pointLight position={[6, 3, -4]} color="#ffad5a" intensity={1.5} distance={12} />
            <pointLight position={[-6, 3, 4]} color="#ffddaa" intensity={1.0} distance={12} />
            
            <gridHelper args={[20, 20, '#555555', '#222222']} position={[0, -0.85, 0]} opacity={0.15} transparent />
            <ContactShadows position={[0, -0.84, 0]} opacity={0.7} scale={10} blur={2.5} far={2} />
            <mesh position={[0, -0.86, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <meshStandardMaterial color="#0d0d12" roughness={0.5} metalness={0.4} />
            </mesh>
          </>
        );
      case 'studio':
      default:
        return (
          <>
            <color attach="background" args={['#0e0f15']} />
            <ambientLight intensity={0.45} />
            <directionalLight position={[5, 10, 3]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
            <directionalLight position={[-5, 5, -8]} intensity={1.5} color="#fff" />
            <pointLight position={[0, 4, 6]} color="#ffffff" intensity={0.5} />
            
            <ContactShadows position={[0, -0.85, 0]} opacity={0.65} scale={8} blur={2.2} far={2} />
          </>
        );
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.1, 3.2], fov: 60 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      {renderEnvironment()}

      <group position={[0, 0.05, 0]}>
        <GunModel
          config={config}
          isFiring={isFiring}
          muzzleFlashRef={muzzleFlashRef}
        />

        <FireParticles
          isFiring={isFiring}
          muzzleFlashRef={muzzleFlashRef}
        />

        {config.showHotspots &&
          hotspots.map((spot) => (
            <Html key={spot.id} position={spot.pos} center distanceFactor={4.5}>
              <div style={{ position: 'relative' }}>
                <div
                  className="hotspot-dot"
                  style={{
                    backgroundColor: activeHotspot === spot.id ? '#4facfe' : '#00f2fe',
                    borderColor: activeHotspot === spot.id ? '#fff' : '#00f2fe'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === spot.id ? null : spot.id);
                  }}
                />
                
                {activeHotspot === spot.id && (
                  <div className="hotspot-card">
                    <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px', color: '#00f2fe' }}>
                      {spot.title}
                    </div>
                    <div>{spot.desc}</div>
                  </div>
                )}
              </div>
            </Html>
          ))}
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={config.inspectMode}
        autoRotateSpeed={0.8}
        minDistance={1.4}
        maxDistance={5.5}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 + 0.05}
      />
    </Canvas>
  );
}
