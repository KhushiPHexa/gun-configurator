export default function LoadingScreen({ progress }) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <p className="loading-brand">GUN CONFIGURATOR</p>
        <h1 className="loading-title">Loading assets</h1>
        <p className="loading-subtitle">Preparing 3D models and textures</p>

        <div className="loading-progress-track">
          <div
            className="loading-progress-bar"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        <p className="loading-percent">{clampedProgress}%</p>
      </div>
    </div>
  );
}
