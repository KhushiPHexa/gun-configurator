import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { preloadIcons, preloadModels } from '../utils/preloadAssets';

export function useAssetPreload() {
  const { progress, active } = useProgress();
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    preloadModels();
    preloadIcons().then(() => setIconsLoaded(true));
  }, []);

  const isReady = !active && iconsLoaded;
  const displayProgress = isReady ? 100 : active ? progress : Math.max(progress, 95);

  return { isReady, progress: displayProgress };
}
