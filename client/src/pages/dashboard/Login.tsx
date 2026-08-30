import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function DashLogin() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/employee/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs mb-6 font-semibold transition-colors">
          ← Return to IRENTURENT Website
        </Link>

        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Logo size="md" variant="light" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Employee Portal
            </span>
          </div>

          <h1 className="font-display text-xl font-bold text-white mb-1">Sign In</h1>
          <p className="text-slate-400 text-xs mb-6">Access administration dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                placeholder="employee@irenturent.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 pr-14"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300">Demo Credentials:</span> Use the employee account provided by your administrator.
          </div>
        </div>

      </div>
    </div>
  );
}
