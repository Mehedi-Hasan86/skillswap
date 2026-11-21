import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SwapMark } from './ui';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-hairline bg-page/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <SwapMark className="h-6 w-6" />
          <span className="text-lg font-semibold tracking-tight text-ink">
            SkillSwap
          </span>
        </Link>
        <div className="hidden items-center gap-1 text-sm font-medium text-ink-2 md:flex">
          <a href="/#how" className="btn btn-ghost">How it works</a>
          <a href="/#matching" className="btn btn-ghost">Matching</a>
          <a href="/#features" className="btn btn-ghost">Features</a>
          <a href="/#credits" className="btn btn-ghost">Credits</a>
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Join free</Link>
            </>
          ) : (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="btn btn-secondary"
              >
                {user.role === 'admin' ? 'Admin panel' : 'Dashboard'}
              </Link>
              <span className="mono hidden items-center gap-1 text-sm font-medium text-ink-2 sm:flex">
                {user.credits ?? 0} credits
              </span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn btn-ghost"
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
