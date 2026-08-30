import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Inbox, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const NAV = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/properties', label: 'Properties', icon: Building2 },
  { to: '/employee/properties/new', label: 'Add Property', icon: PlusCircle },
  { to: '/employee/leads', label: 'Leads & Sessions', icon: Inbox },
];

export default function DashLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col flex-shrink-0 shadow-premium">
        
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Logo size="sm" variant="light" showTagline={false} />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to !== '/employee/properties/new'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-premium'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-500 hover:text-gold-500 text-xs transition-colors mb-3 font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </a>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-xs font-bold text-red-500 hover:underline ml-2 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
}
