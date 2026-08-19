import React from 'react';
import { 
  Crosshair, 
  Zap, 
  Flame, 
  RotateCcw, 
  Volume2, 
  Eye, 
  MapPin
} from 'lucide-react';
import { playToggleSound } from '../../utils/AudioEngine';

const WEAPON_STATS = {
  damage: 85,
  accuracy: 60,
  range: 65,
  stability: 55,
  mobility: 80,
  ammo: 30
};

export default function ConfiguratorPanel({ 
  config, 
  setConfig, 
  onFire, 
  onReload, 
  onReset 
}) {
  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="brand">
          <Crosshair size={18} color="#00f2fe" />
          <span>ARMORY STUDIO</span>
        </div>
        <h1 className="model-title">R3F-TACTICAL</h1>
      </div>

      {/* Live Stats Gauges */}
      <section className="config-section">
        <div className="section-title">
          <Zap size={14} />
          <span>Real-time Weapon Specs</span>
        </div>
        <div className="stats-list">
          
          {/* Damage */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Firepower / Damage</span>
              <span className="stat-val">{WEAPON_STATS.damage}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${WEAPON_STATS.damage}%`, background: 'linear-gradient(to right, #eb5757, #ff7e5f)' }} />
            </div>
          </div>

          {/* Accuracy */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Precision / Accuracy</span>
              <span className="stat-val">{WEAPON_STATS.accuracy}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${WEAPON_STATS.accuracy}%`, background: 'linear-gradient(to right, #4facfe, #00f2fe)' }} />
            </div>
          </div>

          {/* Range */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Effective Range</span>
              <span className="stat-val">{WEAPON_STATS.range}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${WEAPON_STATS.range}%`, background: 'linear-gradient(to right, #9b51e0, #4facfe)' }} />
            </div>
          </div>

          {/* Recoil Stability */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Recoil Control / Stability</span>
              <span className="stat-val">{WEAPON_STATS.stability}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${WEAPON_STATS.stability}%`, background: 'linear-gradient(to right, #27ae60, #2ecc71)' }} />
            </div>
          </div>

          {/* Mobility */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Weight / Handling Speed</span>
              <span className="stat-val">{WEAPON_STATS.mobility}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${WEAPON_STATS.mobility}%`, background: 'linear-gradient(to right, #f2c94c, #ffaa44)' }} />
            </div>
          </div>

          {/* Ammo capacity label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>Magazine Size</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {WEAPON_STATS.ammo} ROUNDS
            </span>
          </div>

        </div>
      </section>

      {/* Active Actions */}
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
