import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user ? user.email : 'anonymous';
    const allHistory = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    const userHistory = allHistory.filter(item => item.userEmail === userEmail || (!item.userEmail && userEmail === 'anonymous'));
    setHistory(userHistory);
  }, []);

  const clearHistory = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user ? user.email : 'anonymous';
    const allHistory = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    const remainingHistory = allHistory.filter(item => item.userEmail !== userEmail && (item.userEmail || userEmail !== 'anonymous'));
    localStorage.setItem('predictionHistory', JSON.stringify(remainingHistory));
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <HistoryIcon className="w-8 h-8 mr-3 text-primary-600" />
            Prediction History
          </h1>
          <p className="text-slate-500 mt-2">Your recent health queries and predictions.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <HistoryIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-700 mb-2">No history found</h3>
          <p className="text-slate-500 mb-6">You haven't made any predictions yet.</p>
          <Link to="/predict" className="btn-primary inline-flex">
            Start a Prediction
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between group">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <span className="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <span className="mx-3 text-slate-300">•</span>
                  <span className="font-bold text-lg text-slate-800">{item.result.final_prediction}</span>
                  <span className="ml-3 text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                    {item.result.confidence}% Confidence
                  </span>
                </div>
                <div className="text-sm text-slate-500 line-clamp-1">
                  <strong className="text-slate-600 font-medium">Symptoms: </strong>
                  {item.symptoms.join(', ')}
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center md:pl-4">
                <div className="text-right mr-4 hidden md:block">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Recommended</div>
                  <div className="text-sm text-primary-600 font-medium">{item.result.doctor_recommendation.specialist}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
