import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { preloadIcons, preloadModels } from '../utils/preloadAssets';

export function useAssetPreload() {
  const { progress, active } = useProgress();
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    preloadModels();
    preloadIcons().then(() => setIconsLoaded(true));
  }, []);

  useEffect(() => {
    if (!active && iconsLoaded) {
      setInitialLoadComplete(true);
    }
  }, [active, iconsLoaded]);

  const isReady = initialLoadComplete;
  const displayProgress = isReady ? 100 : active ? progress : Math.max(progress, 95);

  return { isReady, progress: displayProgress };
}
