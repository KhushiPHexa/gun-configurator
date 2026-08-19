import { 
  Flame, 
  RotateCcw, 
  Crosshair
} from 'lucide-react';
import { playToggleSound } from '../../utils/AudioEngine';
import { GUNS } from '../../constants/guns';
import { useGLTF } from '@react-three/drei';

export default function ConfiguratorPanel({ 
  config, 
  setConfig, 
  onFire
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
      </footer>
    </aside>
  );
}
