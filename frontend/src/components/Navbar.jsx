import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Activity, History, Info, LogIn } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const navLinks = [
    { name: 'Home', path: '/', icon: <Activity className="w-5 h-5 mr-1" /> },
    { name: 'Predict', path: '/predict', icon: <Stethoscope className="w-5 h-5 mr-1" /> },
    { name: 'History', path: '/history', icon: <History className="w-5 h-5 mr-1" /> },
    { name: 'About', path: '/about', icon: <Info className="w-5 h-5 mr-1" /> },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600">
              <Stethoscope className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl tracking-tight text-slate-800">HealthAI</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4 ml-4">
                <span className="text-sm font-medium text-slate-700">Hi, {user.name}</span>
                <button 
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.reload();
                  }}
                  className="text-sm text-red-600 font-medium hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors ml-4 shadow-sm">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
