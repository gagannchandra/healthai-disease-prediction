import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, ChevronRight, Stethoscope, X, Siren } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getUserHistory, removeHistoryEntry, clearUserHistory } from '../utils/storage';

const confidenceTone = (score) => {
  if (score >= 70) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-rose-700 bg-rose-50 border-rose-100';
};

const History = () => {
  useDocumentTitle('History | HealthAI');
  const [history, setHistory] = useState(getUserHistory);

  const deleteEntry = (id) => {
    removeHistoryEntry(id);
    setHistory(getUserHistory());
  };

  const clearAll = () => {
    if (!window.confirm('Delete all saved predictions? This cannot be undone.')) return;
    clearUserHistory();
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-12">
      <div className="flex flex-wrap gap-4 justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <HistoryIcon className="w-8 h-8 mr-3 text-primary-600" aria-hidden="true" />
            Prediction History
          </h1>
          <p className="text-slate-500 mt-2">Saved on this device only. Your last 50 checks are kept.</p>
        </div>
        {history.length > 0 && (
          <button onClick={clearAll} className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium">
            <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <HistoryIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" aria-hidden="true" />
          <h2 className="text-xl font-medium text-slate-700 mb-2">No history yet</h2>
          <p className="text-slate-500 mb-6">Your symptom checks will appear here.</p>
          <Link to="/predict" className="btn-primary inline-flex">
            <Stethoscope className="w-4 h-4 mr-2" aria-hidden="true" />
            Start a check
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="relative group">
              <Link
                to="/results"
                state={{ result: item.result, symptoms: item.symptoms }}
                className="bg-white rounded-xl border border-slate-200 p-5 pr-14 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col md:flex-row md:items-center justify-between"
              >
                <div className="mb-3 md:mb-0 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md font-medium">
                      {new Date(item.date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors">
                      {item.result.final_prediction}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confidenceTone(item.result.confidence)}`}>
                      {item.result.confidence}%
                    </span>
                    {item.result.urgent && (
                      <span className="inline-flex items-center text-xs font-semibold text-red-700">
                        <Siren className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    <span className="text-slate-600 font-medium">Symptoms: </span>
                    {item.symptoms.join(', ')}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center md:pl-6 md:ml-4 md:border-l md:border-slate-100">
                  <div className="text-left md:text-right mr-4">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Specialist</div>
                    <div className="text-sm text-primary-600 font-bold">{item.result.doctor_recommendation?.specialist}</div>
                  </div>
                  <ChevronRight className="hidden md:block w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" aria-hidden="true" />
                </div>
              </Link>
              <button
                onClick={() => deleteEntry(item.id)}
                className="absolute top-3 right-3 p-2 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label={`Delete ${item.result.final_prediction} from history`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default History;
