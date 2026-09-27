import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Page not found | HealthAI');
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Compass className="w-14 h-14 mx-auto text-slate-300 mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-600 mb-8">The page you are looking for does not exist or has moved.</p>
      <div className="flex justify-center gap-3">
        <Link to="/" className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Go home
        </Link>
        <Link to="/predict" className="btn-primary">Check symptoms</Link>
      </div>
    </div>
  );
};

export default NotFound;
