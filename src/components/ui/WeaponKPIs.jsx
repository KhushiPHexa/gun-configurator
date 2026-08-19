const WEAPON_STATS = [
  { key: 'damage', label: 'Damage', value: 85, color: '#ff7e5f' },
  { key: 'accuracy', label: 'Accuracy', value: 60, color: '#00f2fe' },
  { key: 'range', label: 'Range', value: 65, color: '#4facfe' },
  { key: 'stability', label: 'Stability', value: 55, color: '#2ecc71' },
  { key: 'mobility', label: 'Mobility', value: 80, color: '#ffaa44' },
  { key: 'ammo', label: 'Ammo', value: 30, color: '#00f2fe' }
];

export default function WeaponKPIs() {
  return (
    <div className="weapon-kpi-panel">
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
  );
}
