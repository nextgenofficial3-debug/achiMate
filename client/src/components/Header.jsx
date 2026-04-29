import { useStore } from '../Store';
import { ClipboardPaste } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { queue } = useStore();
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

  const handleAnalyze = (e) => {
    e.preventDefault();
    // placeholder
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
        <button className="btn primary" type="submit">Analyze & Prepare</button>
      </form>
    </header>
  );
}
