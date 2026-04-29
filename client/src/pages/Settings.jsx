import { useEffect, useState } from 'react';
import { useStore } from '../Store';

export default function Settings() {
  const { settings, setSettings, library, clearLibrary } = useStore();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(window.matchMedia?.('(display-mode: standalone)').matches || false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
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
          <button className="btn primary" disabled={!installPrompt || installed} onClick={installApp}>
            {installed ? 'AchiMate is Installed' : installPrompt ? 'Install AchiMate App' : 'Install Available After Browser Check'}
          </button>
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
          <button
            className="btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'achimate-library.json';
              link.click();
            }}
          >
            Export Library JSON
          </button>
          <button className="btn" onClick={clearLibrary}>Clear Library</button>
        </div>
      </div>
    </section>
  );
}
