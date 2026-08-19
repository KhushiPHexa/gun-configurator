import React, { useState, Suspense } from 'react';
import GunCanvas from './components/3d/GunCanvas';
import ConfiguratorPanel from './components/ui/ConfiguratorPanel';
import { playShotSound, playReloadSound, playToggleSound } from './utils/AudioEngine';
import { Volume2, VolumeX, ShieldCheck } from 'lucide-react';

const INITIAL_CONFIG = {
  inspectMode: false,
  showHotspots: true
};

export default function App() {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [isFiring, setIsFiring] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);

  // Firing action
  const handleFire = () => {
    if (isFiring) return; // prevent spamming too fast
    
    // Play sound (silenced or normal)
    if (!audioMuted) {
      playShotSound();
    }
    
    // Trigger animations in Canvas/Model
    setIsFiring(true);
    setTimeout(() => {
      setIsFiring(false);
    }, 80); // flash for 80ms
  };

  // Reload action
  const handleReload = () => {
    if (!audioMuted) {
      playReloadSound();
    }
  };

  // Reset weapon configuration
  const handleReset = () => {
    if (!audioMuted) playToggleSound();
    setConfig(INITIAL_CONFIG);
    setActiveHotspot(null);
  };

  // Mute audio toggle
  const toggleMute = () => {
    setAudioMuted(!audioMuted);
    if (audioMuted) {
      // just play a small feedback sound on unmute
      playToggleSound();
    }
  };

  return (
    <div className="app-container" onClick={() => setActiveHotspot(null)}>
      {/* 3D Canvas Viewport */}
      <main className="canvas-container">
        {/* Top-left Indicator */}
        <div className="overlay-badge">
          <div className="dot-pulse-green" />
          <span style={{ fontWeight: 600 }}>ARMORY PIPELINE SECURE</span>
        </div>

        {/* 3D Renders */}
        <Suspense fallback={
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0a0b10',
            zIndex: 10,
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 242, 254, 0.1)',
              borderTopColor: '#00f2fe',
              borderRadius: '50%',
              animation: 'spin 1s infinite linear'
            }} />
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              letterSpacing: '1px'
            }}>
              RESOLVING 3D MODEL PIPELINE...
            </div>
            {/* Embedded styles for standard loader animation */}
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        }>
          <GunCanvas
            config={config}
            isFiring={isFiring}
            activeHotspot={activeHotspot}
            setActiveHotspot={setActiveHotspot}
          />
        </Suspense>

        {/* Audio Muted Indicator */}
        <div className="audio-indicator" onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
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

        {/* Interaction hint */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          pointerEvents: 'none',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} />
          <span>DRAG TO ROTATE • PINCH TO ZOOM</span>
        </div>
      </main>

      {/* Control Customizer Panel */}
      <ConfiguratorPanel
        config={config}
        setConfig={setConfig}
        onFire={handleFire}
        onReload={handleReload}
        onReset={handleReset}
      />
    </div>
  );
}
