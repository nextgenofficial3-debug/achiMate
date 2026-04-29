import { useStore } from '../Store';

export default function Queue() {
  const { queue, clearQueue } = useStore();

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
                <div>{item.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
