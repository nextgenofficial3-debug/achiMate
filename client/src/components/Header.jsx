import { useStore } from '../Store';
import { ClipboardPaste } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { queue, analyzeUrl, status } = useStore();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [type, setType] = useState('auto');
  const [quality, setQuality] = useState('auto');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    try {
      await analyzeUrl({ url: url.trim(), preferredType: type, quality });
      setUrl('');
      navigate('/');
    } catch {
      // Status is already surfaced in the UI.
    }
  };

  return (
    <header className="top">
      <div className="brand-row">
        <div className="brand">
          <div className="mark">A</div>
          <div>
            <h1>AchiMate</h1>
            <p>Video, music, image downloader</p>
          </div>
        </div>
        <div className="quota">{queue.length} queued</div>
      </div>

      <form className="search-card" onSubmit={handleAnalyze}>
        <div className="url-row">
          <input 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a public media URL" 
            inputMode="url" 
            required 
          />
          <button className="btn icon-only" type="button" title="Paste" onClick={handlePaste}>
            <ClipboardPaste size={20} />
          </button>
        </div>
        <div className="filters">
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="auto">Auto detect</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
          </select>
          <select value={quality} onChange={e => setQuality(e.target.value)}>
            <option value="auto">Best available</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="audio-high">High audio</option>
          </select>
        </div>
        <button className="btn primary" type="submit" disabled={status.state === 'loading'}>
          {status.state === 'loading' ? 'Analyzing...' : 'Analyze & Prepare'}
        </button>
        {status.message && <div className={`status show ${status.state === 'error' ? 'error' : ''}`}>{status.message}</div>}
      </form>
    </header>
  );
}
