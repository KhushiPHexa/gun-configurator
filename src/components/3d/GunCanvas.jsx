import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import GunModel from './GunModel';
import { getGunById } from '../../constants/guns';

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

function useBulletMesh() {
  const { scene } = useGLTF('/Bullet.glb');

  return useMemo(() => {
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    let geometry = null;
    let material = null;

    scene.traverse((child) => {
      if (child.isMesh && !geometry) {
        geometry = child.geometry;
        material = child.material;
      }
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);

    return { geometry, material, scale: 1, center };
  }, [scene]);
}

const BULLET_SCALE = 3;
const BULLET_SPEED = 2;

function getSplashPosition(muzzle, yOffset, target = new THREE.Vector3()) {
  return target.set(muzzle[0], muzzle[1] + yOffset, muzzle[2]);
}

function FireParticlesInner({ gunId, isFiring, muzzleFlashRef }) {
  const gun = getGunById(gunId);
  const spawnYOffset = gun.bulletSpawnYOffset;
  const bulletsRef = useRef([]);
  const bulletPoolRef = useRef();
  const flashRef = useRef(null);
  const flashGroupRef = useRef(null);
  const flashTimeRef = useRef(0);
  const bulletMesh = useBulletMesh();
  const offset = useMemo(
    () => new THREE.Vector3(
      -bulletMesh.center.x * BULLET_SCALE,
      -bulletMesh.center.y * BULLET_SCALE,
      -bulletMesh.center.z * BULLET_SCALE
    ),
    [bulletMesh.center]
  );
  const splashPosRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!isFiring || !muzzleFlashRef?.current || !bulletMesh.geometry) return;

    flashRef.current?.scale.setScalar(1.2 + Math.random() * 0.5);
    flashTimeRef.current = 0.06;

    const muzzle = muzzleFlashRef.current;
    bulletsRef.current.push({
      pos: getSplashPosition(muzzle, spawnYOffset, new THREE.Vector3()),
      vel: new THREE.Vector3(
        (-14 - Math.random() * 4) * BULLET_SPEED,
        (Math.random() - 0.5) * 0.4 * BULLET_SPEED,
        (Math.random() - 0.5) * 0.4 * BULLET_SPEED
      ),
      life: 1.0,
      decay: 1.4
    });

    if (bulletsRef.current.length > 4) {
      bulletsRef.current.shift();
    }
  }, [isFiring, muzzleFlashRef, bulletMesh.geometry, spawnYOffset]);

  useFrame((_, delta) => {
    if (muzzleFlashRef.current && flashGroupRef.current) {
      flashGroupRef.current.position.copy(
        getSplashPosition(muzzleFlashRef.current, spawnYOffset, splashPosRef.current)
      );
    }

    if (flashTimeRef.current > 0) {
      flashTimeRef.current -= delta;
      if (flashTimeRef.current <= 0) {
        flashRef.current?.scale.setScalar(0);
      } else {
        flashRef.current?.scale.multiplyScalar(0.75);
      }
    }

    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      bullet.life -= delta * bullet.decay;
      if (bullet.life <= 0) return false;

      bullet.pos.addScaledVector(bullet.vel, delta);
      bullet.vel.multiplyScalar(0.985);
      return bullet.pos.x > -8;
    });

    const pool = bulletPoolRef.current;
    if (!pool || !bulletMesh.geometry) return;

    while (pool.children.length > bulletsRef.current.length) {
      pool.remove(pool.children[pool.children.length - 1]);
    }

    while (pool.children.length < bulletsRef.current.length) {
      const mesh = new THREE.Mesh(bulletMesh.geometry, bulletMesh.material);
      mesh.rotation.set(0, Math.PI / 2, 0);
      mesh.scale.setScalar(BULLET_SCALE);
      pool.add(mesh);
    }

    bulletsRef.current.forEach((bullet, index) => {
      const mesh = pool.children[index];
      mesh.position.copy(bullet.pos).add(offset);
      mesh.visible = true;
    });
  });

  if (!bulletMesh.geometry || !bulletMesh.material) return null;

  return (
    <group>
      <group ref={flashGroupRef}>
        <mesh ref={flashRef} scale={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial color="#ffbb44" transparent opacity={0.9} />
        </mesh>
      </group>

      <group ref={bulletPoolRef} />
    </group>
  );
}

function FireParticles(props) {
  return (
    <Suspense fallback={null}>
      <FireParticlesInner {...props} />
    </Suspense>
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

        <FireParticles gunId={config.gunId} isFiring={isFiring} muzzleFlashRef={muzzleFlashRef} />
      </group>

      <SceneControls gunId={config.gunId} inspectMode={config.inspectMode} />
    </Canvas>
  );
}

useGLTF.preload('/Bullet.glb');
