import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/employee/properties', label: 'Properties', icon: '🏠' },
  { to: '/employee/properties/new', label: 'Add Property', icon: '➕' },
  { to: '/employee/leads', label: 'Leads & Sessions', icon: '📥' },
];

export default function DashLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-950 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center font-black text-white">IR</div>
            <div>
              <div className="text-white font-bold text-base">IRUR</div>
              <div className="text-navy-400 text-xs">Employee Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to !== '/employee/properties/new'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500 text-white shadow-gold'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                }`
              }>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Public site link */}
        <div className="p-4 border-t border-navy-800">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-navy-400 hover:text-white text-xs transition-colors mb-4">
            <span>🌐</span> View Public Site ↗
          </a>

          {/* User info + logout */}
          <div className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl">
            <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name}</div>
              <div className="text-navy-400 text-xs truncate">{user?.role}</div>
            </div>
            <button onClick={handleLogout} title="Sign out"
              className="text-navy-400 hover:text-red-400 transition-colors text-xs p-1">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
