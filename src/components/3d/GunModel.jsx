import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getCarbonFiberTexture,
  getArcticCamoTexture,
  getDamascusSteelTexture,
  getNeonGlitchTexture
} from '../../utils/TextureGenerator';

export default function GunModel({ config, isFiring, muzzleFlashRef }) {
  // Load the GLB file
  const { scene } = useGLTF('/gun.glb');
  const gunGroupRef = useRef();
  const recoilRef = useRef(0);

  // 1. Calculate normalization and dimensions of the gun model
  const modelStats = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // Find the longest dimension (which is Z in the raw gun.glb)
    const longestDim = Math.max(size.x, size.y, size.z);
    const scale = 3.2 / longestDim;
    
    // After rotating by 90 degrees around Y, the Z axis lies along X, and X lies along Z
    return {
      // Swapped sizes based on 90 deg rotation around Y
      size: new THREE.Vector3(size.z * scale, size.y * scale, size.x * scale),
      center: new THREE.Vector3(center.z * scale, center.y * scale, center.x * scale),
      scale,
      isAlongX: true, // We force it to X since we rotate it sideways
      originalCenter: center.clone() // unscaled, unrotated
    };
  }, [scene]);

  // Apply textures and material settings based on configuration
  useEffect(() => {
    // Generate or fetch procedural textures
    const carbonTexture = getCarbonFiberTexture();
    const camoTexture = getArcticCamoTexture();
    const damascusTexture = getDamascusSteelTexture();
    const neonTexture = getNeonGlitchTexture();

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Cache original texture and properties if not already done
        if (!child.userData.originalMap) {
          child.userData.originalMap = child.material.map;
          child.userData.originalColor = child.material.color ? child.material.color.clone() : new THREE.Color('#ffffff');
          child.userData.originalRoughness = child.material.roughness !== undefined ? child.material.roughness : 0.5;
          child.userData.originalMetalness = child.material.metalness !== undefined ? child.material.metalness : 0.5;
        }

        // Clone the material to avoid mutating shared references
        const mat = child.material.clone();
        
        // Default to original texture map
        mat.map = child.userData.originalMap;
        mat.emissive = new THREE.Color('#000000');
        mat.clearcoat = 0;

        // Apply skin configurations
        switch (config.skin) {
          case 'carbon':
            mat.map = carbonTexture;
            mat.roughness = 0.35;
            mat.metalness = 0.85;
            mat.color = new THREE.Color('#222222');
            break;
          case 'camo':
            mat.map = camoTexture;
            mat.roughness = 0.8;
            mat.metalness = 0.15;
            mat.color = new THREE.Color('#ffffff');
            break;
          case 'damascus':
            mat.map = damascusTexture;
            mat.roughness = 0.25;
            mat.metalness = 0.95;
            mat.color = new THREE.Color('#33353d');
            break;
          case 'neon':
            mat.map = neonTexture;
            mat.roughness = 0.25;
            mat.metalness = 0.8;
            mat.color = new THREE.Color('#ffffff');
            mat.emissive = new THREE.Color('#00f2fe');
            mat.emissiveIntensity = config.laserActive ? 0.35 : 0.08;
            break;
          case 'gold':
            mat.map = null; // shiny solid gold
            mat.color = new THREE.Color('#d4af37');
            mat.roughness = 0.12;
            mat.metalness = 0.95;
            mat.clearcoat = 0.8;
            mat.clearcoatRoughness = 0.05;
            break;
          case 'chrome':
            mat.map = null; // shiny solid chrome
            mat.color = new THREE.Color('#e0e0e0');
            mat.roughness = 0.04;
            mat.metalness = 1.0;
            break;
          case 'matte':
          default:
            // Custom sliders: Keep original textures but apply color/roughness/metalness tint
            mat.color = new THREE.Color(config.color);
            mat.roughness = config.roughness;
            mat.metalness = config.metalness;
            break;
        }

        child.material = mat;
      }
    });
  }, [scene, config.skin, config.color, config.roughness, config.metalness, config.laserActive]);

  // Recoil effect animation logic
  useEffect(() => {
    if (isFiring) {
      // Snappy kickback
      recoilRef.current = 1.0;
    }
  }, [isFiring]);

  useFrame((state, delta) => {
    if (recoilRef.current > 0) {
      // Exponential decay back to 0
      recoilRef.current -= delta * 12;
      if (recoilRef.current < 0) recoilRef.current = 0;
    }

    if (gunGroupRef.current) {
      const kick = recoilRef.current;
      // Points along X axis. If pointing left (-X): kick is +X
      gunGroupRef.current.position.x = kick * 0.18;
      gunGroupRef.current.rotation.z = -kick * 0.06; // tip rotates up
    }
  });

  // 2. Compute coordinates of attachments relative to normalized gun bounds
  // After rotating the gun by 90 degrees around Y, it is oriented sideways along X.
  // The barrel points to the left (-X).
  const attachPositions = useMemo(() => {
    const s = modelStats.size;
    const c = new THREE.Vector3(0, 0, 0); // centered

    return {
      silencer: [c.x - s.x * 0.5, c.y + s.y * 0.1, c.z], // Tip of the barrel
      laser: [c.x - s.x * 0.22, c.y - s.y * 0.02, c.z + 0.08], // Side mount under barrel
      scope: [c.x + s.x * 0.08, c.y + s.y * 0.38, c.z], // Top receiver rail
      mag: [c.x - s.x * 0.03, c.y - s.y * 0.38, c.z], // Magazine well at bottom
      muzzle: [c.x - s.x * 0.5 - 0.1, c.y + s.y * 0.1, c.z], // Barrel muzzle flash output
      
      // Orientations
      silencerRot: [0, 0, Math.PI / 2], // Lie along X axis
      laserRot: [0, 0, 0],
      scopeRot: [0, 0, 0],
      magRot: [0, 0, 0]
    };
  }, [modelStats]);

  // Keep muzzle flash synced
  useEffect(() => {
    if (muzzleFlashRef && attachPositions) {
      muzzleFlashRef.current = attachPositions.muzzle;
    }
  }, [attachPositions, muzzleFlashRef]);

  return (
    <group ref={gunGroupRef}>
      {/* 3D Gun Model Primitive */}
      <primitive
        object={scene}
        scale={[modelStats.scale, modelStats.scale, modelStats.scale]}
        rotation={[0, Math.PI / 2, 0]} // Rotate 90 deg around Y to align sideways along X
        position={[
          -modelStats.originalCenter.z * modelStats.scale,
          -modelStats.originalCenter.y * modelStats.scale,
          modelStats.originalCenter.x * modelStats.scale
        ]}
      />

      {/* 3D ATTACHMENT: Silencer/Suppressor */}
      {config.silencer && (
        <group position={attachPositions.silencer} rotation={attachPositions.silencerRot}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.5, 32]} />
            <meshStandardMaterial
              color="#111113"
              roughness={0.65}
              metalness={0.8}
            />
          </mesh>
          {/* Suppressor grooves */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
            <meshStandardMaterial color="#1a1a1c" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
            <meshStandardMaterial color="#1a1a1c" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* 3D ATTACHMENT: Tactical Laser Sight */}
      {config.laserActive && (
        <group position={attachPositions.laser} rotation={attachPositions.laserRot}>
          {/* Laser Module Box */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.08, 0.12]} />
            <meshStandardMaterial color="#1f2127" roughness={0.5} metalness={0.7} />
          </mesh>
          {/* Laser Lens */}
          <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
          {/* The Laser Ray Line */}
          <line>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    0, 0, 0, // start at module
                    -15, 0, 0 // shoot far forward along -X
                  ]),
                  3
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff0000" linewidth={1.5} opacity={0.65} transparent />
          </line>
        </group>
      )}

      {/* 3D ATTACHMENT: Holographic Red-Dot Scope */}
      {config.optic && (
        <group position={attachPositions.scope} rotation={attachPositions.scopeRot}>
          {/* Scope Mount Base */}
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.05, 0.22]} />
            <meshStandardMaterial color="#1c1e22" roughness={0.6} metalness={0.8} />
          </mesh>
          {/* Scope Cylinder Body */}
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 24]} />
            <meshStandardMaterial color="#15171a" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Glass Lenses */}
          <mesh position={[0, 0.04, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
            <meshPhysicalMaterial
              color="#00f2fe"
              transparent
              opacity={0.4}
              roughness={0.1}
              transmission={0.9}
              ior={1.5}
            />
          </mesh>
          <mesh position={[0, 0.04, -0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
            <meshPhysicalMaterial
              color="#ff007f"
              transparent
              opacity={0.3}
              roughness={0.1}
              transmission={0.9}
              ior={1.5}
            />
          </mesh>
        </group>
      )}

      {/* 3D ATTACHMENT: Extended Curved Magazine */}
      {config.magazine && (
        <group position={attachPositions.mag} rotation={attachPositions.magRot}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.45, 0.12]} />
            <meshStandardMaterial
              color={config.skin === 'gold' ? '#d4af37' : '#1a1b1f'}
              roughness={config.skin === 'gold' ? 0.2 : 0.6}
              metalness={config.skin === 'gold' ? 0.9 : 0.7}
            />
          </mesh>
          <mesh position={[0, -0.225, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.03, 0.13]} />
            <meshStandardMaterial color="#0f1013" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/gun.glb');
