import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Stethoscope, Activity, History, Info, LogIn, LogOut, Menu, X } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '../utils/storage';

const navLinks = [
  { name: 'Home', path: '/', icon: Activity },
  { name: 'Symptom Checker', path: '/predict', icon: Stethoscope },
  { name: 'History', path: '/history', icon: History },
  { name: 'About', path: '/about', icon: Info },
];

const linkClass = ({ isActive }) =>
  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'text-primary-700 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
  }`;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openedAt, setOpenedAt] = useState(null);
  // The mobile menu closes itself whenever the route changes.
  const menuOpen = openedAt === location.pathname;
  // Re-read on every render: the route changes after login/logout, which re-renders the navbar.
  const user = getCurrentUser();

  const logout = () => {
    setCurrentUser(null);
    setOpenedAt(null);
    navigate('/');
  };

  const account = user ? (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-700 truncate max-w-[10rem]">Hi, {user.name}</span>
      <button
        onClick={logout}
        className="flex items-center text-sm text-slate-600 font-medium hover:text-red-600 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-1" aria-hidden="true" />
        Logout
      </button>
    </div>
  ) : (
    <Link to="/auth" className="btn-primary px-4 py-2 rounded-lg">
      <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
      Login
    </Link>
  );

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center text-primary-600">
            <Stethoscope className="h-7 w-7 mr-2" aria-hidden="true" />
            <span className="font-bold text-xl tracking-tight text-slate-800">HealthAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <NavLink key={path} to={path} end={path === '/'} className={linkClass}>
                <Icon className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {name}
              </NavLink>
            ))}
            <div className="ml-4 pl-4 border-l border-slate-200">{account}</div>
          </div>

          <button
            className="md:hidden p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpenedAt(menuOpen ? null : location.pathname)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-sm">
          {navLinks.map(({ name, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={linkClass}>
              <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
              {name}
            </NavLink>
          ))}
          <div className="pt-3 mt-2 border-t border-slate-100">{account}</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
