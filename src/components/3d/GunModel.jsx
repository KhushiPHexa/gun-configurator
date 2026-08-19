import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GunModel({ isFiring, muzzleFlashRef }) {
  const { scene } = useGLTF('/gun.glb');
  const gunGroupRef = useRef();
  const recoilRef = useRef(0);

  const modelStats = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    const longestDim = Math.max(size.x, size.y, size.z);
    const scale = 3.2 / longestDim;
    
    return {
      size: new THREE.Vector3(size.z * scale, size.y * scale, size.x * scale),
      center: new THREE.Vector3(center.z * scale, center.y * scale, center.x * scale),
      scale,
      isAlongX: true,
      originalCenter: center.clone()
    };
  }, [scene]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (!child.userData.originalMap) {
          child.userData.originalMap = child.material.map;
          child.userData.originalColor = child.material.color ? child.material.color.clone() : new THREE.Color('#ffffff');
          child.userData.originalRoughness = child.material.roughness !== undefined ? child.material.roughness : 0.5;
          child.userData.originalMetalness = child.material.metalness !== undefined ? child.material.metalness : 0.5;
        }

        const mat = child.material.clone();
        mat.map = child.userData.originalMap;
        mat.emissive = new THREE.Color('#000000');
        mat.clearcoat = 0;
        mat.color = new THREE.Color('#ffffff');
        mat.roughness = 0.6;
        mat.metalness = 0.5;

        child.material = mat;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (isFiring) {
      recoilRef.current = 1.0;
    }
  }, [isFiring]);

  useFrame((state, delta) => {
    if (recoilRef.current > 0) {
      recoilRef.current -= delta * 12;
      if (recoilRef.current < 0) recoilRef.current = 0;
    }

    if (gunGroupRef.current) {
      const kick = recoilRef.current;
      gunGroupRef.current.position.x = kick * 0.18;
      gunGroupRef.current.rotation.z = -kick * 0.06;
    }
  });

  const shadowPlane = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const s = modelStats.scale;

    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(
        -modelStats.originalCenter.z * s,
        -modelStats.originalCenter.y * s,
        modelStats.originalCenter.x * s
      ),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
      new THREE.Vector3(s, s, s)
    );

    const transformedBox = box.clone().applyMatrix4(matrix);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    transformedBox.getSize(size);
    transformedBox.getCenter(center);

    return {
      position: [center.x, transformedBox.min.y - 0.002, center.z],
      scale: Math.max(size.x, size.z) * 2.6
    };
  }, [scene, modelStats]);

  const attachPositions = useMemo(() => {
    const s = modelStats.size;
    const c = new THREE.Vector3(0, 0, 0);

    return {
      muzzle: [c.x - s.x * 0.5 - 0.1, c.y + s.y * 0.1, c.z]
    };
  }, [modelStats]);

  useEffect(() => {
    if (muzzleFlashRef && attachPositions) {
      muzzleFlashRef.current = attachPositions.muzzle;
    }
  }, [attachPositions, muzzleFlashRef]);

  return (
    <group ref={gunGroupRef}>
      <primitive
        object={scene}
        scale={[modelStats.scale, modelStats.scale, modelStats.scale]}
        rotation={[0, Math.PI / 2, 0]}
        position={[
          -modelStats.originalCenter.z * modelStats.scale,
          -modelStats.originalCenter.y * modelStats.scale,
          modelStats.originalCenter.x * modelStats.scale
        ]}
      />

      <ContactShadows
        position={shadowPlane.position}
        opacity={0.55}
        scale={shadowPlane.scale}
        blur={1.8}
        far={3.5}
        resolution={1024}
        frames={Infinity}
        color="#000000"
      />
    </group>
  );
}

useGLTF.preload('/gun.glb');
