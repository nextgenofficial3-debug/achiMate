import { useStore } from '../Store';

export default function Settings() {
  const { settings, setSettings } = useStore();

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="page stack">
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Settings</h3>
            <p>App behavior and data tools.</p>
          </div>
        </div>
        <div className="card-body settings-grid">
          <div className="switch-row">
            <div>
              <strong>Auto-add results to queue</strong>
              <span>Every analysis result is queued automatically.</span>
            </div>
            <button 
              className={`toggle ${settings.autoQueue ? 'on' : ''}`} 
              onClick={() => toggleSetting('autoQueue')}
            >
              <i></i>
            </button>
          </div>
          <div className="switch-row">
            <div>
              <strong>Use backend proxy for preview</strong>
              <span>Improves Chrome playback.</span>
            </div>
            <button 
              className={`toggle ${settings.proxyPreview ? 'on' : ''}`} 
              onClick={() => toggleSetting('proxyPreview')}
            >
              <i></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
