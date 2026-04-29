import { useStore } from '../Store';

export default function Library() {
  const { library } = useStore();

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
                <div>{item.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
