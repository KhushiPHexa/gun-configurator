import React from 'react';
import { 
  Flame, 
  RotateCcw, 
  Volume2, 
  Eye, 
  MapPin
} from 'lucide-react';
import { playToggleSound } from '../../utils/AudioEngine';

export default function ConfiguratorPanel({ 
  config, 
  setConfig, 
  onFire, 
  onReload, 
  onReset 
}) {
  return (
    <aside className="sidebar">
      <footer className="actions-footer">
        <button className="fire-btn" onClick={onFire}>
          <Flame size={18} fill="white" />
          <span>ENGAGE FIRE</span>
        </button>

        <div className="utility-buttons">
          <button className="util-btn" onClick={onReload}>
            <Volume2 size={15} />
            <span>RELOAD</span>
          </button>

          <button 
            className={`util-btn ${config.inspectMode ? 'active' : ''}`}
            onClick={() => {
              playToggleSound();
              setConfig(prev => ({ ...prev, inspectMode: !prev.inspectMode }));
            }}
          >
            <RotateCcw size={15} />
            <span>{config.inspectMode ? 'ROTATING' : 'INSPECT'}</span>
          </button>
        </div>

        <div className="utility-buttons" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <button 
            className={`util-btn ${config.showHotspots ? 'active' : ''}`}
            style={{ width: '100%' }}
            onClick={() => {
              playToggleSound();
              setConfig(prev => ({ ...prev, showHotspots: !prev.showHotspots }));
            }}
          >
            <MapPin size={15} />
            <span>{config.showHotspots ? 'HIDE ANNOTATIONS' : 'SHOW ANNOTATIONS'}</span>
          </button>
          
          <button className="util-btn" style={{ padding: '8px' }} title="Reset Weapon" onClick={onReset}>
            <Eye size={15} />
            <span>RESET</span>
          </button>
        </div>
      </footer>
    </aside>
  );
}
