import { Video, Music, Image } from 'lucide-react';

export default function Home() {
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
            <h3>Recent Results</h3>
            <p>Latest analyzed media options.</p>
          </div>
        </div>
        <div className="card-body">
          <div className="empty">Paste a URL to get started.</div>
        </div>
      </div>
    </section>
  );
}
