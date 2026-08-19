import { 
  Flame, 
  RotateCcw, 
  Crosshair,
  Settings
} from 'lucide-react';
import { playToggleSound } from '../../utils/AudioEngine';
import { GUNS } from '../../constants/guns';
import { useGLTF } from '@react-three/drei';

export default function ConfiguratorPanel({ 
  config, 
  setConfig, 
  onFire,
  onUpdateMuzzleFlashOffset
}) {
  const handleGunChange = (gunId) => {
    if (config.gunId === gunId) return;
    playToggleSound();
    setConfig((prev) => ({ ...prev, gunId }));
  };

  return (
    <aside className="sidebar">
      <section className="config-section gun-selector-section">
        <div className="section-title">
          <Crosshair size={14} />
          <span>Select Weapon</span>
        </div>
        <div className="gun-selector-list">
          {GUNS.map((gun) => (
            <button
              key={gun.id}
              type="button"
              className={`gun-option-card ${config.gunId === gun.id ? 'active' : ''}`}
              onMouseEnter={() => useGLTF.preload(gun.modelPath)}
              onClick={() => handleGunChange(gun.id)}
            >
              <img
                src={gun.icon}
                alt={gun.name}
                className="gun-option-thumb"
              />
              <span className="gun-option-name">{gun.name}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="actions-footer">
        <button className="fire-btn" onClick={onFire}>
          <Flame size={18} fill="white" />
          <span>ENGAGE FIRE</span>
        </button>

        <button
          type="button"
          className={`util-btn auto-rotate-btn ${config.autoRotate ? 'active' : ''}`}
          onClick={() => {
            playToggleSound();
            setConfig((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
          }}
        >
          <RotateCcw size={15} />
          <span>{config.autoRotate ? 'AUTO ROTATE: ON' : 'AUTO ROTATE: OFF'}</span>
        </button>

        {/* Debug Muzzle Flash Offset Controls */}
        <div className="config-section">
          <div className="section-title">
            <Settings size={14} />
            <span>Muzzle Flash Offset (Debug)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['x', 'y', 'z'].map((axis, index) => (
              <div key={axis}>
                <label>{axis.toUpperCase()} Offset:</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={config.muzzleFlashOffset[index]}
                  onChange={(e) => {
                    const newOffset = [...config.muzzleFlashOffset];
                    newOffset[index] = parseFloat(e.target.value);
                    onUpdateMuzzleFlashOffset(newOffset);
                  }}
                  style={{ width: '100%' }}
                />
                <span>{config.muzzleFlashOffset[index].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </footer>
    </aside>
  );
}
