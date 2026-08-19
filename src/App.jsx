import { useState } from 'react';
import GunCanvas from './components/3d/GunCanvas';
import ConfiguratorPanel from './components/ui/ConfiguratorPanel';
import LoadingScreen from './components/ui/LoadingScreen';
import { playShotSound, playToggleSound } from './utils/AudioEngine';
import { useAssetPreload } from './hooks/useAssetPreload';
import { Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_GUN_ID, getGunById } from './constants/guns';

const INITIAL_CONFIG = {
  gunId: DEFAULT_GUN_ID,
  autoRotate: true,
  muzzleFlashOffset: getGunById(DEFAULT_GUN_ID).muzzleFlashOffset
};

export default function App() {
  const { isReady, progress } = useAssetPreload();
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [isFiring, setIsFiring] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  const handleUpdateMuzzleFlashOffset = (newOffset) => {
    setConfig((prev) => ({
      ...prev,
      muzzleFlashOffset: newOffset,
    }));
  };

  if (!isReady) {
    return <LoadingScreen progress={progress} />;
  }

  const handleFire = () => {
    if (isFiring) return;
    if (!audioMuted) playShotSound();
    setIsFiring(true);
    setTimeout(() => setIsFiring(false), 80);
  };

  const toggleMute = () => {
    setAudioMuted(!audioMuted);
    if (audioMuted) playToggleSound();
  };

  return (
    <div className="app-container">
      <main className="canvas-container">
        {/* Canvas must stay mounted — never wrap it in Suspense */}
        <GunCanvas config={config} isFiring={isFiring} />

        <div className="audio-indicator" onClick={toggleMute}>
          {audioMuted ? (
            <>
              <VolumeX size={14} color="var(--accent-red)" />
              <span>SYNTH AUDIO: MUTED</span>
            </>
          ) : (
            <>
              <Volume2 size={14} color="var(--accent-cyan)" />
              <span>SYNTH AUDIO: ACTIVE</span>
            </>
          )}
        </div>
      </main>

      <ConfiguratorPanel
        config={config}
        setConfig={setConfig}
        onFire={handleFire}
        onUpdateMuzzleFlashOffset={handleUpdateMuzzleFlashOffset}
      />
    </div>
  );
}
