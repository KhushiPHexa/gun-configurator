import { useRef, useEffect, useMemo, Suspense } from 'react';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getGunById } from '../../constants/guns';

const _muzzleWorld = new THREE.Vector3();
const _muzzleParent = new THREE.Vector3();
const layoutCache = new Map();

function resetSceneTransform(scene) {
  scene.position.set(0, 0, 0);
  scene.rotation.set(0, 0, 0);
  scene.scale.set(1, 1, 1);
  scene.updateMatrixWorld(true);
}

function buildModelLayout(scene, modelPath) {
  if (layoutCache.has(modelPath)) {
    return layoutCache.get(modelPath);
  }

  resetSceneTransform(scene);

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const longestDim = Math.max(size.x, size.y, size.z);
  const scale = 3.2 / longestDim;

  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(-center.z * scale, -center.y * scale, center.x * scale),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),
    new THREE.Vector3(scale, scale, scale)
  );

  const transformedBox = box.clone().applyMatrix4(matrix);
  const transformedSize = new THREE.Vector3();
  const transformedCenter = new THREE.Vector3();
  transformedBox.getSize(transformedSize);
  transformedBox.getCenter(transformedCenter);

  const footprint = Math.max(transformedSize.x, transformedSize.z);

  const layout = {
    scale,
    position: [-center.z * scale, -center.y * scale, center.x * scale],
    shadow: {
      position: [transformedCenter.x, transformedBox.min.y - 0.004, transformedCenter.z],
      width: footprint * 2.6,
      depth: footprint * 2.6
    },
    muzzleLocal: new THREE.Vector3(
      transformedBox.min.x - 0.08,
      transformedCenter.y,
      transformedCenter.z
    )
  };

  layoutCache.set(modelPath, layout);
  return layout;
}

function GunModelInner({ gunId, isFiring, muzzleFlashRef }) {
  const gun = getGunById(gunId);
  const { scene } = useGLTF(gun.modelPath);
  const gunGroupRef = useRef();
  const recoilRef = useRef(0);
  const muzzleLocalRef = useRef(new THREE.Vector3());

  const layout = useMemo(
    () => buildModelLayout(scene, gun.modelPath),
    [scene, gun.modelPath]
  );

  useEffect(() => {
    muzzleLocalRef.current.copy(layout.muzzleLocal);
  }, [layout, muzzleLocalRef]);

  useEffect(() => {
    resetSceneTransform(scene);

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.frustumCulled = true;

      const mat = child.material;
      if (mat.color) mat.color.set('#ffffff');
      mat.roughness = 0.6;
      mat.metalness = 0.5;
      if (mat.emissive) mat.emissive.set('#000000');
    });

    return () => resetSceneTransform(scene);
  }, [scene]);

  useEffect(() => {
    recoilRef.current = 0;
    gunGroupRef.current?.position.set(0, 0, 0);
    gunGroupRef.current?.rotation.set(0, 0, 0);
  }, [gun.modelPath]);

  useEffect(() => {
    if (isFiring) recoilRef.current = 1.0;
  }, [isFiring]);

  useFrame((_, delta) => {
    if (gunGroupRef.current && muzzleFlashRef) {
      _muzzleWorld.copy(muzzleLocalRef.current);
      gunGroupRef.current.localToWorld(_muzzleWorld);
      _muzzleParent.copy(_muzzleWorld);
      gunGroupRef.current.parent?.worldToLocal(_muzzleParent);
      muzzleFlashRef.current = _muzzleParent.toArray();
    }

    if (recoilRef.current > 0) {
      recoilRef.current = Math.max(0, recoilRef.current - delta * 12);
    }

    if (gunGroupRef.current) {
      const kick = recoilRef.current;
      gunGroupRef.current.position.x = kick * 0.18;
      gunGroupRef.current.rotation.z = -kick * 0.06;
    }
  });

  return (
    <group ref={gunGroupRef}>
      <group
        scale={[layout.scale, layout.scale, layout.scale]}
        rotation={[0, Math.PI / 2, 0]}
        position={layout.position}
      >
        <primitive object={scene} />
      </group>

      <ContactShadows
        key={gun.modelPath}
        position={layout.shadow.position}
        opacity={0.52}
        scale={layout.shadow.width}
        blur={2.5}
        far={3}
        resolution={512}
        frames={1}
        color="#000000"
      />
    </group>
  );
}

export default function GunModel(props) {
  return (
    <Suspense fallback={null}>
      <GunModelInner {...props} />
    </Suspense>
  );
}
