import { useState } from 'react';
import { Info } from 'lucide-react';

const WEAPON_STATS = [
  { key: 'damage', label: 'Damage', value: 85, color: '#ff7e5f' },
  { key: 'accuracy', label: 'Accuracy', value: 60, color: '#00f2fe' },
  { key: 'range', label: 'Range', value: 65, color: '#4facfe' },
  { key: 'stability', label: 'Stability', value: 55, color: '#2ecc71' },
  { key: 'mobility', label: 'Mobility', value: 80, color: '#ffaa44' },
  { key: 'ammo', label: 'Ammo', value: 30, color: '#00f2fe' }
];

export default function WeaponKPIs() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="weapon-kpi-wrapper">
      <button
        type="button"
        className={`kpi-toggle-btn${isOpen ? ' is-active' : ''}`}
        aria-label={isOpen ? 'Hide weapon stats' : 'Show weapon stats'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Info size={16} />
      </button>

      <div className={`weapon-kpi-panel${isOpen ? ' is-open' : ''}`}>
        {WEAPON_STATS.map((stat) => (
          <div key={stat.key} className="kpi-row">
            <div className="kpi-row-header">
              <span className="kpi-label">{stat.label}</span>
              <span className="kpi-value">{stat.value}</span>
            </div>
            <div className="kpi-track">
              <div
                className="kpi-bar"
                style={{
                  width: `${Math.min(stat.value, 100)}%`,
                  background: stat.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
