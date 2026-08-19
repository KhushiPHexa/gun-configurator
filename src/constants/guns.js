export const GUNS = [
  {
    id: 'rock-island-pistol',
    name: 'Rock Island Pistol',
    icon: '/icons/rock-island-pistol.png',
    modelPath: '/rock-island-pistol.glb'
  },
  {
    id: 'antique-revolver',
    name: 'Antique Revolver',
    icon: '/icons/antique-revolver.png',
    modelPath: '/antique-revolver.glb'
  },
  {
    id: 'm416-gun',
    name: 'M416 Rifle',
    icon: '/icons/m416-gun.png',
    modelPath: '/m416-gun.glb'
  }
];

export const DEFAULT_GUN_ID = 'rock-island-pistol';

export function getGunById(gunId) {
  return GUNS.find((gun) => gun.id === gunId) ?? GUNS[0];
}
