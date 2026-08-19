import { useGLTF } from '@react-three/drei';
import { GUNS } from '../constants/guns';

export const BULLET_MODEL_PATH = '/Bullet.glb';

export const MODEL_PATHS = [
  ...GUNS.map((gun) => gun.modelPath),
  BULLET_MODEL_PATH
];

export function preloadModels() {
  MODEL_PATHS.forEach((path) => useGLTF.preload(path));
}

export function preloadIcons() {
  return Promise.all(
    GUNS.map(
      (gun) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = gun.icon;
        })
    )
  );
}
