import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import GunModel from './GunModel';

const CASING_GEOMETRY = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 6);
const CASING_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#c29b38',
  metalness: 0.9,
  roughness: 0.2
});

function SceneControls({ gunId, inspectMode }) {
  const controlsRef = useRef();

  useEffect(() => {
    controlsRef.current?.reset();
  }, [gunId]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      autoRotate={inspectMode}
      autoRotateSpeed={0.8}
      minDistance={1.4}
      maxDistance={5.5}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 + 0.05}
      target={[0, 0, 0]}
    />
  );
}

function FireParticles({ isFiring, muzzleFlashRef }) {
  const casingsRef = useRef([]);
  const flashRef = useRef(null);
  const flashGroupRef = useRef(null);
  const flashTimeRef = useRef(0);

  useEffect(() => {
    if (!isFiring || !muzzleFlashRef?.current) return;

    flashRef.current?.scale.setScalar(1.2 + Math.random() * 0.5);
    flashTimeRef.current = 0.06;

    casingsRef.current.push({
      pos: new THREE.Vector3(0.15, 0.2, 0.08),
      vel: new THREE.Vector3(
        1.5 + Math.random() * 1.5,
        2.0 + Math.random() * 1.5,
        1.0 + Math.random() * 1.5
      ),
      rot: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      rotVel: new THREE.Vector3(Math.random() * 15, Math.random() * 15, Math.random() * 15),
      life: 1.0,
      decay: 1.0
    });

    if (casingsRef.current.length > 4) {
      casingsRef.current.shift();
    }
  }, [isFiring, muzzleFlashRef]);

  useFrame((_, delta) => {
    if (muzzleFlashRef.current && flashGroupRef.current) {
      flashGroupRef.current.position.set(...muzzleFlashRef.current);
    }

    if (flashTimeRef.current > 0) {
      flashTimeRef.current -= delta;
      if (flashTimeRef.current <= 0) {
        flashRef.current?.scale.setScalar(0);
      } else {
        flashRef.current?.scale.multiplyScalar(0.75);
      }
    }

    casingsRef.current = casingsRef.current.filter((c) => {
      c.life -= delta * c.decay;
      if (c.life <= 0) return false;

      c.pos.addScaledVector(c.vel, delta);
      c.vel.y -= delta * 9.81;
      c.rot.addScaledVector(c.rotVel, delta);

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
      <group ref={flashGroupRef}>
        <mesh ref={flashRef} scale={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color="#ffbb44" transparent opacity={0.9} />
        </mesh>
      </group>

      {casingsRef.current.map((c, idx) => (
        <mesh
          key={`c-${idx}`}
          geometry={CASING_GEOMETRY}
          material={CASING_MATERIAL}
          position={c.pos.toArray()}
          rotation={c.rot.toArray()}
        />
      ))}
    </group>
  );
}

export default function GunCanvas({ config, isFiring }) {
  const muzzleFlashRef = useRef([0, 0, 0]);

  return (
    <Canvas
      camera={{ position: [0, 0.1, 3.2], fov: 60 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false
      }}
      dpr={1}
    >
      <color attach="background" args={['#cecece']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 10, 3]} intensity={2.2} />
      <directionalLight position={[-4, 4, -6]} intensity={1.2} />

      <group position={[0, 0.05, 0]}>
        <GunModel
          gunId={config.gunId}
          isFiring={isFiring}
          muzzleFlashRef={muzzleFlashRef}
        />

        <FireParticles isFiring={isFiring} muzzleFlashRef={muzzleFlashRef} />
      </group>

      <SceneControls gunId={config.gunId} inspectMode={config.inspectMode} />
    </Canvas>
  );
}
