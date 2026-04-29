import { Download, Image, Music, Plus, Video } from 'lucide-react';
import { useStore } from '../Store';

export default function Home() {
  const { activeResult, recent, addManyToQueue, addLibrary, downloadUrl, streamUrl, settings } = useStore();
  const primary = activeResult?.options?.[0];
  const recentOptions = recent.flatMap(result => result.options || []).slice(0, 5);
  const mediaSrc = primary ? (settings.proxyPreview ? streamUrl(primary.url) : primary.url) : '';

  return (
    <section className="page stack">
      <div className="hero">
        <h2>Download public media with a real backend.</h2>
        <p>Analyze direct files or public pages, preview the media, queue downloads, and keep a local library.</p>
      </div>
      
      <div className="quick-grid">
        <button className="quick">
          <Video size={28} />
          <strong>Video</strong>
          <span>MP4, WebM</span>
        </button>
        <button className="quick">
          <Music size={28} />
          <strong>Audio</strong>
          <span>MP3, M4A</span>
        </button>
        <button className="quick">
          <Image size={28} />
          <strong>Image</strong>
          <span>JPG, PNG</span>
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Media Preview</h3>
            <p>{primary ? activeResult.title : 'Analyze a URL to preview playable media.'}</p>
          </div>
          {activeResult?.options?.length > 1 && (
            <button className="btn" onClick={() => addManyToQueue(activeResult.options)}>
              <Plus size={18} /> Queue all
            </button>
          )}
        </div>
        <div className="card-body">
          {!primary ? (
            <div className="empty">No media selected yet.</div>
          ) : (
            <div className="preview-panel">
              {primary.type === 'video' && <video className="preview-media" src={mediaSrc} controls playsInline />}
              {primary.type === 'audio' && <audio className="preview-media" src={mediaSrc} controls />}
              {primary.type === 'image' && <img className="preview-media" src={mediaSrc} alt={primary.title || primary.filename} />}
              <div className="preview-meta">
                <strong>{primary.title || primary.filename}</strong>
                <div className="chips">
                  <span className="chip active">{primary.type}</span>
                  <span className="chip">{primary.format || 'source'}</span>
                  <span className="chip">{primary.quality || 'source'}</span>
                </div>
                <div className="item-actions">
                  <a className="btn primary" href={downloadUrl(primary.url)} onClick={() => addLibrary(primary)}>
                    <Download size={18} /> Download
                  </a>
                  <button className="btn" onClick={() => addLibrary(primary)}>Save to Library</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Recent Results</h3>
            <p>Latest analyzed media options.</p>
          </div>
        </div>
        <div className="card-body">
          {recentOptions.length === 0 ? (
            <div className="empty">Paste a URL to get started.</div>
          ) : (
            recentOptions.map(item => (
              <div className="item" key={item.id}>
                <div className={`thumb ${item.type}`}>{item.type === 'audio' ? <Music size={20} /> : item.type === 'image' ? <Image size={20} /> : <Video size={20} />}</div>
                <div>
                  <h4>{item.title || item.filename}</h4>
                  <p>{item.type} · {item.format || 'source'} · {item.quality || 'source'}</p>
                </div>
                <a className="btn icon-only" href={downloadUrl(item.url)} onClick={() => addLibrary(item)} title="Download">
                  <Download size={18} />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
