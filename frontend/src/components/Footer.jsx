import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-xl font-bold text-white tracking-tight">HealthAI</span>
          <p className="text-sm mt-1 text-slate-400">Intelligent Disease Prediction System</p>
        </div>
        <div className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Final Year B.Tech Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
