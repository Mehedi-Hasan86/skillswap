import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
            ⇄
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Skill<span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Swap</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
          <a href="/#how" className="transition hover:text-white">How it works</a>
          <a href="/#matching" className="transition hover:text-white">Matching</a>
          <a href="/#features" className="transition hover:text-white">Features</a>
          <a href="/#credits" className="transition hover:text-white">Credits</a>
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
                Log in
              </Link>
              <Link to="/register" className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-90">
                Join free
              </Link>
            </>
          ) : (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {user.role === 'admin' ? 'Admin panel' : 'Dashboard'}
              </Link>
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-xs font-bold text-amber-300 sm:flex">
                ✦ {user.credits ?? 0} credits
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
