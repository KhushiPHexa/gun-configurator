export const GUNS = [
  {
    id: 'rock-island-pistol',
    name: 'Rock Island Pistol',
    icon: '/icons/rock_island_pistol.webp',
    modelPath: '/rock-island-pistol.glb',
    bulletSpawnYOffset: 0.75
  },
  {
    id: 'antique-revolver',
    name: 'Antique Revolver',
    icon: '/icons/antique_revolver.webp',
    modelPath: '/antique-revolver.glb',
    bulletSpawnYOffset: 0.55
  },
  {
    id: 'm416-gun',
    name: 'M416 Rifle',
    icon: '/icons/m416_gun.webp',
    modelPath: '/m416-gun.glb',
    bulletSpawnYOffset: 0.15
  }
];

export const DEFAULT_GUN_ID = 'rock-island-pistol';

export function getGunById(gunId) {
  return GUNS.find((gun) => gun.id === gunId) ?? GUNS[0];
}
