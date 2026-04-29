import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Queue from './pages/Queue';
import Library from './pages/Library';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="pages">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
      <div className="toast" id="toast" aria-live="polite"></div>
    </div>
  );
}
