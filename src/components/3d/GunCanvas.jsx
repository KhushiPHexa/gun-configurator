import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import GunModel from './GunModel';

// Performance-optimized Particle Component for Firing Effects
// Defined OUTSIDE to prevent unmounting and recreating WebGL context
function FireParticles({ isFiring, muzzleFlashRef }) {
  const casingsRef = useRef([]);
  const flashRef = useRef(null);
  const flashLightRef = useRef(null);
  const flashGroupRef = useRef(null);
  const flashTimeRef = useRef(0);

  // Trigger burst when firing is active
  useEffect(() => {
    if (isFiring && muzzleFlashRef && muzzleFlashRef.current) {
      // Trigger Muzzle Flash (turn on visual sphere and point light)
      if (flashRef.current) flashRef.current.scale.setScalar(1.2 + Math.random() * 0.5);
      if (flashLightRef.current) flashLightRef.current.intensity = 8.0;
      flashTimeRef.current = 0.06; // show for 60ms

      // Generate Ejecting Bullet Casing (brass shell flying right and up)
      const shellPos = new THREE.Vector3(0.15, 0.2, 0.08);
      const casing = {
        pos: shellPos,
        vel: new THREE.Vector3(
          1.5 + Math.random() * 1.5,
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

  const renderEnvironment = () => (
    <>
      <color attach="background" args={['#cecece']} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[5, 10, 3]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
        shadow-radius={2}
      />
      <directionalLight position={[-5, 5, -8]} intensity={1.5} color="#fff" />
      <pointLight position={[0, 4, 6]} color="#ffffff" intensity={0.5} />
    </>
  );

  return (
    <Canvas
      shadows="soft"
      camera={{ position: [0, 0.1, 3.2], fov: 60 }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMappingExposure :3  }}
    >
      {renderEnvironment()}

      <group position={[0, 0.05, 0]}>
        <GunModel
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
