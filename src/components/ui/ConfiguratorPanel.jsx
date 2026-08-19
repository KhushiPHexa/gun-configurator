import React, { useMemo } from 'react';
import { 
  Crosshair, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Flame, 
  RotateCcw, 
  Volume2, 
  Layers, 
  Sliders, 
  Eye, 
  MapPin,
  Disc
} from 'lucide-react';
import { playToggleSound } from '../../utils/AudioEngine';

export default function ConfiguratorPanel({ 
  config, 
  setConfig, 
  onFire, 
  onReload, 
  activeHotspot,
  onReset 
}) {
  
  // Calculate dynamic stats based on active attachments
  const stats = useMemo(() => {
    let baseDamage = 85;
    let baseAccuracy = 60;
    let baseRange = 65;
    let baseStability = 55;
    let baseMobility = 80;
    let ammoCount = 30;

    // Silencer modifications
    if (config.silencer) {
      baseDamage -= 6;
      baseRange -= 8;
      baseStability += 12;
      baseMobility -= 5;
    }

    // Laser sight modifications
    if (config.laserActive) {
      baseAccuracy += 15;
      baseStability += 8;
    }

    // Optic holographic scope modifications
    if (config.optic) {
      baseAccuracy += 20;
      baseMobility -= 6;
      baseRange += 10;
    }

    // Extended magazine modifications
    if (config.magazine) {
      ammoCount = 45;
      baseMobility -= 12;
      baseStability -= 5;
    }

    // Cap values between 0 and 100
    const cap = (val) => Math.max(0, Math.min(100, val));

    return {
      damage: cap(baseDamage),
      accuracy: cap(baseAccuracy),
      range: cap(baseRange),
      stability: cap(baseStability),
      mobility: cap(baseMobility),
      ammo: ammoCount
    };
  }, [config.silencer, config.laserActive, config.optic, config.magazine]);

  const presetSkins = [
    { id: 'matte', name: 'Tactical Matte', desc: 'Customizable solid base colors', previewBg: 'linear-gradient(135deg, #2b2e3a 0%, #17181c 100%)' },
    { id: 'gold', name: 'Royal Gold', desc: '18K polished mirror chrome gold', previewBg: 'linear-gradient(135deg, #ecc844 0%, #c49d21 100%)' },
    { id: 'chrome', name: 'Bright Chrome', desc: 'Polished silver mirror steel', previewBg: 'linear-gradient(135deg, #ffffff 0%, #a2a8ba 100%)' },
    { id: 'carbon', name: 'Carbon Fiber', desc: 'Woven carbon composites', previewBg: 'repeating-linear-gradient(45deg, #181818 0px, #181818 2px, #2a2a2a 2px, #2a2a2a 4px)' },
    { id: 'damascus', name: 'Damascus Steel', desc: 'Organic pattern ripple metal', previewBg: 'radial-gradient(circle, #3d424e 0%, #15171b 100%)' },
    { id: 'neon', name: 'Cyberpunk Neon', desc: 'Trace neon circuitry paths', previewBg: 'linear-gradient(135deg, #00f2fe 0%, #ff007f 100%)' }
  ];

  const colorSwatches = [
    { hex: '#ffffff', name: 'Factory Original' },
    { hex: '#111318', name: 'Tactical Black' },
    { hex: '#8b8070', name: 'Desert Tan' },
    { hex: '#4b5340', name: 'Olive Drab' },
    { hex: '#212f45', name: 'Navy Steel' },
    { hex: '#801818', name: 'Crimson Red' }
  ];

  const handleSkinChange = (skinId) => {
    playToggleSound();
    setConfig(prev => ({ ...prev, skin: skinId }));
  };

  const handleColorChange = (hex) => {
    playToggleSound();
    setConfig(prev => ({ ...prev, color: hex }));
  };

  const toggleAttachment = (attachmentKey) => {
    playToggleSound();
    setConfig(prev => ({ ...prev, [attachmentKey]: !prev[attachmentKey] }));
  };

  const handleSliderChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  const handleEnvChange = (envId) => {
    playToggleSound();
    setConfig(prev => ({ ...prev, environment: envId }));
  };

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

      {/* 1. Weapon Skins */}
      <section className="config-section">
        <div className="section-title">
          <Sparkles size={14} />
          <span>Select Skin Pattern</span>
        </div>
        <div className="skin-grid">
          {presetSkins.map((skin) => (
            <div 
              key={skin.id}
              className={`skin-card ${config.skin === skin.id ? 'active' : ''}`}
              onClick={() => handleSkinChange(skin.id)}
            >
              <div 
                className="skin-preview" 
                style={{ background: skin.previewBg }}
              >
                {skin.id === config.skin && "ACTIVE"}
              </div>
              <div>
                <div className="skin-name">{skin.name}</div>
                <div className="skin-desc">{skin.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Custom Matte Color Adjusters (Only active for Matte Skin) */}
      {config.skin === 'matte' && (
        <section className="config-section" style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
          <div className="section-title">
            <Sliders size={14} />
            <span>Matte Customizer</span>
          </div>
          
          {/* Swatches */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {colorSwatches.map((color) => (
              <div 
                key={color.hex}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color.hex,
                  cursor: 'pointer',
                  border: config.color === color.hex ? '3px solid #00f2fe' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: config.color === color.hex ? '0 0 10px #00f2fe' : 'none',
                  transition: 'all 0.2s'
                }}
                title={color.name}
                onClick={() => handleColorChange(color.hex)}
              />
            ))}
          </div>

          {/* Roughness */}
          <div className="material-slider">
            <div className="slider-labels">
              <span>Roughness (Matte vs Shiny)</span>
              <span>{Math.round(config.roughness * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={config.roughness}
              onChange={(e) => handleSliderChange('roughness', e.target.value)}
              className="slider-input"
            />
          </div>

          {/* Metalness */}
          <div className="material-slider">
            <div className="slider-labels">
              <span>Metalness</span>
              <span>{Math.round(config.metalness * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={config.metalness}
              onChange={(e) => handleSliderChange('metalness', e.target.value)}
              className="slider-input"
            />
          </div>
        </section>
      )}

      {/* 3. Attachments */}
      <section className="config-section">
        <div className="section-title">
          <Layers size={14} />
          <span>Modular Attachments</span>
        </div>
        <div className="attachment-list">
          
          {/* Suppressor */}
          <div 
            className={`attachment-item ${config.silencer ? 'active' : ''}`}
            onClick={() => toggleAttachment('silencer')}
          >
            <div className="attachment-info">
              <div className="attachment-name">Suppressor (Silencer)</div>
              <div className="attachment-desc">Reduces sound & recoil (-damage, -range)</div>
            </div>
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </div>

          {/* Tactical Laser */}
          <div 
            className={`attachment-item ${config.laserActive ? 'active' : ''}`}
            onClick={() => toggleAttachment('laserActive')}
          >
            <div className="attachment-info">
              <div className="attachment-name">Tactical Laser Sight</div>
              <div className="attachment-desc">Emits red targeting ray (+accuracy, +control)</div>
            </div>
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </div>

          {/* Optic Scope */}
          <div 
            className={`attachment-item ${config.optic ? 'active' : ''}`}
            onClick={() => toggleAttachment('optic')}
          >
            <div className="attachment-info">
              <div className="attachment-name">Red Dot Reflex Scope</div>
              <div className="attachment-desc">Futuristic glass sight (+range, ++accuracy)</div>
            </div>
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </div>

          {/* Extended Mag */}
          <div 
            className={`attachment-item ${config.magazine ? 'active' : ''}`}
            onClick={() => toggleAttachment('magazine')}
          >
            <div className="attachment-info">
              <div className="attachment-name">Curved Extended Magazine</div>
              <div className="attachment-desc">Increases capacity to 45 rounds (--mobility)</div>
            </div>
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. Environments */}
      <section className="config-section">
        <div className="section-title">
          <Disc size={14} />
          <span>Armory Environment</span>
        </div>
        <div className="env-selector">
          <button 
            className={`env-btn ${config.environment === 'studio' ? 'active' : ''}`}
            onClick={() => handleEnvChange('studio')}
          >
            STUDIO
          </button>
          <button 
            className={`env-btn ${config.environment === 'neon' ? 'active' : ''}`}
            onClick={() => handleEnvChange('neon')}
          >
            CYBER LAB
          </button>
          <button 
            className={`env-btn ${config.environment === 'warehouse' ? 'active' : ''}`}
            onClick={() => handleEnvChange('warehouse')}
          >
            HANGAR
          </button>
        </div>
      </section>

      {/* 5. Live Stats Gauges */}
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
              <span className="stat-val">{stats.damage}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${stats.damage}%`, background: 'linear-gradient(to right, #eb5757, #ff7e5f)' }} />
            </div>
          </div>

          {/* Accuracy */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Precision / Accuracy</span>
              <span className="stat-val">{stats.accuracy}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${stats.accuracy}%`, background: 'linear-gradient(to right, #4facfe, #00f2fe)' }} />
            </div>
          </div>

          {/* Range */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Effective Range</span>
              <span className="stat-val">{stats.range}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${stats.range}%`, background: 'linear-gradient(to right, #9b51e0, #4facfe)' }} />
            </div>
          </div>

          {/* Recoil Stability */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Recoil Control / Stability</span>
              <span className="stat-val">{stats.stability}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${stats.stability}%`, background: 'linear-gradient(to right, #27ae60, #2ecc71)' }} />
            </div>
          </div>

          {/* Mobility */}
          <div className="stat-item">
            <div className="stat-label-container">
              <span>Weight / Handling Speed</span>
              <span className="stat-val">{stats.mobility}</span>
            </div>
            <div className="stat-track">
              <div className="stat-bar" style={{ width: `${stats.mobility}%`, background: 'linear-gradient(to right, #f2c94c, #ffaa44)' }} />
            </div>
          </div>

          {/* Ammo capacity label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span>Magazine Size</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {stats.ammo} ROUNDS
            </span>
          </div>

        </div>
      </section>

      {/* 6. Active Actions */}
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
