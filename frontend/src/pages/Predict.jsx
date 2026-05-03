import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSymptoms, predictDisease } from '../utils/api';
import { Mic, Search, X, Loader2, AlertCircle } from 'lucide-react';

const Predict = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const data = await getSymptoms();
        setSymptoms(data);
      } catch {
        setError("Failed to load symptoms. Is the backend running?");
      }
    };
    fetchSymptoms();
  }, []);

  const handleSelect = (symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSearchTerm('');
  };

  const handleRemove = (id) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length < 2) {
      setError("Please select at least 2 symptoms for an accurate prediction.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const symptomIds = selectedSymptoms.map(s => s.id);
      const result = await predictDisease(symptomIds);
      
      // Save to history
      const user = JSON.parse(localStorage.getItem('user'));
      const userEmail = user ? user.email : 'anonymous';
      const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
      const newEntry = {
        id: Date.now().toString(),
        userEmail: userEmail,
        date: new Date().toISOString(),
        symptoms: selectedSymptoms.map(s => s.name),
        result: result
      };
      localStorage.setItem('predictionHistory', JSON.stringify([newEntry, ...history].slice(0, 50)));

      // Navigate to results
      navigate('/results', { state: { result, symptoms: selectedSymptoms } });
    } catch {
      setError("An error occurred during prediction. Please try again.");
      setLoading(false);
    }
  };

  // Voice Input Logic using Web Speech API
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      // Try to match transcript with symptoms
      const words = transcript.split(' ');
      const matched = [];
      
      symptoms.forEach(sym => {
        if (transcript.includes(sym.name.toLowerCase()) || words.some(w => sym.id.includes(w))) {
          if (!selectedSymptoms.find(s => s.id === sym.id)) {
            matched.push(sym);
          }
        }
      });

      if (matched.length > 0) {
        setSelectedSymptoms(prev => {
          const newSymptoms = [...prev];
          matched.forEach(m => {
            if (!newSymptoms.find(s => s.id === m.id)) newSymptoms.push(m);
          });
          return newSymptoms;
        });
      } else {
        setError("Could not match your voice input to any symptoms. Try typing them instead.");
      }
    };

    recognition.onerror = (event) => {
      setError("Voice recognition error: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredSymptoms = symptoms.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !selectedSymptoms.find(sel => sel.id === s.id)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Symptom Checker</h1>
        <p className="text-slate-600">Select your symptoms from the list or use voice input to let our AI predict potential conditions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Selected Symptoms */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Selected Symptoms ({selectedSymptoms.length})</h3>
          <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-slate-50 rounded-xl border border-slate-100">
            {selectedSymptoms.length === 0 ? (
              <span className="text-slate-400 text-sm italic">No symptoms selected yet.</span>
            ) : (
              selectedSymptoms.map(sym => (
                <span key={sym.id} className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  {sym.name}
                  <button onClick={() => handleRemove(sym.id)} className="ml-2 text-primary-600 hover:text-primary-800 focus:outline-none">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Search & Voice Input */}
        <div className="relative mb-6">
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow">
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 focus:outline-none text-slate-700"
            />
            <button 
              onClick={handleVoiceInput}
              className={`px-4 py-3 border-l border-slate-200 transition-colors flex items-center justify-center ${isListening ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              title="Click to speak symptoms"
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {filteredSymptoms.length > 0 ? (
                filteredSymptoms.map(sym => (
                  <div
                    key={sym.id}
                    onClick={() => handleSelect(sym)}
                    className="px-4 py-3 hover:bg-primary-50 cursor-pointer text-slate-700 transition-colors"
                  >
                    {sym.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-slate-500 italic">No matching symptoms found.</div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || selectedSymptoms.length === 0}
            className="btn-primary w-full sm:w-auto px-10 py-4 text-lg rounded-xl flex items-center justify-center min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Predict Disease"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Predict;
