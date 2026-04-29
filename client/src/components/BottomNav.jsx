import { NavLink } from 'react-router-dom';
import { Home, ListOrdered, Library, Settings } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/queue" className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
        <ListOrdered size={22} />
        <span>Queue</span>
      </NavLink>
      <NavLink to="/library" className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
        <Library size={22} />
        <span>Library</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
        <Settings size={22} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
