import { Download, Image, Music, Trash2, Video } from 'lucide-react';
import { useStore } from '../Store';

export default function Queue() {
  const { queue, clearQueue, removeQueue, addLibrary, downloadUrl } = useStore();

  return (
    <section className="page stack">
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Download Queue</h3>
            <p>Multiple items with status tracking.</p>
          </div>
          <button className="btn" onClick={clearQueue}>Clear</button>
        </div>
        <div className="card-body">
          {queue.length === 0 ? (
            <div className="empty">No downloads prepared yet.</div>
          ) : (
            queue.map(item => (
              <div key={item.id} className="item">
                <div className={`thumb ${item.type}`}>
                  {item.type === 'audio' ? <Music size={20} /> : item.type === 'image' ? <Image size={20} /> : <Video size={20} />}
                </div>
                <div>
                  <h4>{item.title || item.filename}</h4>
                  <p>{item.type} · {item.format || 'source'} · {item.status || 'ready'}</p>
                  <div className="bar"><span style={{ width: `${item.progress || 100}%` }} /></div>
                </div>
                <div className="item-actions">
                  <a className="btn icon-only" href={downloadUrl(item.url)} onClick={() => addLibrary(item)} title="Download">
                    <Download size={18} />
                  </a>
                  <button className="btn icon-only" onClick={() => removeQueue(item.id)} title="Remove">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
