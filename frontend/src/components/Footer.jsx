import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => (
  <footer className="print:hidden mt-auto border-t border-stone-200/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 grid gap-8 md:grid-cols-[1.2fr_1fr] items-start">
      <div>
        <Logo markClassName="w-7 h-7" />
        <p className="mt-3 text-sm text-stone-500 max-w-sm">
          From symptoms to a clear next step. An educational machine-learning project, not a substitute for
          professional medical advice.
        </p>
      </div>
      <div className="flex flex-col md:items-end gap-3 text-sm">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-stone-600">
          <Link to="/predict" className="hover:text-primary-900">Symptom checker</Link>
          <Link to="/history" className="hover:text-primary-900">History</Link>
          <Link to="/about" className="hover:text-primary-900">About</Link>
        </nav>
        <p className="text-stone-400">&copy; {new Date().getFullYear()} HealthAI · B.Tech final year project</p>
      </div>
    </div>
  </footer>
);

export default Footer;
