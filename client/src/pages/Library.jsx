import { Download, Image, Music, Video } from 'lucide-react';
import { useStore } from '../Store';

export default function Library() {
  const { library, downloadUrl } = useStore();

  return (
    <section className="page stack">
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Library</h3>
            <p>Saved and downloaded media.</p>
          </div>
        </div>
        <div className="card-body">
          {library.length === 0 ? (
            <div className="empty">Library is empty.</div>
          ) : (
            library.map(item => (
              <div key={item.id} className="item">
                <div className={`thumb ${item.type}`}>
                  {item.type === 'audio' ? <Music size={20} /> : item.type === 'image' ? <Image size={20} /> : <Video size={20} />}
                </div>
                <div>
                  <h4>{item.title || item.filename}</h4>
                  <p>{item.type} · {item.format || 'source'}</p>
                </div>
                <a className="btn icon-only" href={downloadUrl(item.url)} title="Download again">
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
