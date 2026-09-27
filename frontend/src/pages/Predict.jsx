import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { getSymptoms, predictDisease } from '../utils/api';
import { addHistoryEntry } from '../utils/storage';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Mic, Search, X, Loader2, AlertCircle, Plus, RotateCcw } from 'lucide-react';

const MIN_SYMPTOMS = 2;
const MAX_RESULTS = 40;
const COMMON_SYMPTOM_IDS = [
  'fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting', 'diarrhea',
  'shortness_of_breath', 'sore_throat', 'dizziness', 'skin_rash', 'abdominal_pain',
];

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : undefined;

// "Runny nose (coryza)" -> "runny nose", so spoken phrases match clarified names.
const spokenName = (sym) => sym.name.toLowerCase().replace(/\s*\(.*?\)/g, '').trim();

const Predict = () => {
  useDocumentTitle('Symptom Checker | HealthAI');
  const [symptoms, setSymptoms] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSymptoms()
      .then(setSymptoms)
      .catch(() => setError('Could not load the symptom list. Please check that the backend server is running.'))
      .finally(() => setLoadingSymptoms(false));
  }, []);

  const fuse = useMemo(() => new Fuse(symptoms, {
    keys: [{ name: 'name', weight: 2 }, { name: 'aliases', weight: 1 }],
    threshold: 0.35,
    ignoreLocation: true,
  }), [symptoms]);
  const selectedIds = useMemo(() => new Set(selectedSymptoms.map(s => s.id)), [selectedSymptoms]);

  const suggestions = useMemo(() => {
    const term = searchTerm.trim();
    if (!term) return [];
    return fuse.search(term).map(r => r.item).filter(s => !selectedIds.has(s.id)).slice(0, MAX_RESULTS);
  }, [fuse, searchTerm, selectedIds]);

  const commonSymptoms = useMemo(() => {
    const byId = new Map(symptoms.map(s => [s.id, s]));
    return COMMON_SYMPTOM_IDS.map(id => byId.get(id)).filter(s => s && !selectedIds.has(s.id));
  }, [symptoms, selectedIds]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const addSymptoms = (items) => {
    setSelectedSymptoms(prev => [...prev, ...items.filter(i => !prev.some(p => p.id === i.id))]);
    setError(null);
  };

  const handleSelect = (symptom) => {
    addSymptoms([symptom]);
    setSearchTerm('');
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const handleRemove = (id) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !searchTerm && selectedSymptoms.length) {
      handleRemove(selectedSymptoms[selectedSymptoms.length - 1].id);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(suggestions[Math.min(activeIndex, suggestions.length - 1)]);
    } else if (e.key === 'Escape') {
      setSearchTerm('');
    }
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length < MIN_SYMPTOMS) {
      setError(`Please add at least ${MIN_SYMPTOMS} symptoms for a meaningful prediction.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await predictDisease(selectedSymptoms.map(s => s.id));
      const names = selectedSymptoms.map(s => s.name);
      addHistoryEntry(names, result);
      navigate('/results', { state: { result, symptoms: names } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setNotice(null);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const available = symptoms.filter(s => !selectedIds.has(s.id));
      const phrases = (s) => [spokenName(s), ...(s.aliases || [])];
      let matched = available.filter(s => s.name.toLowerCase() === transcript || phrases(s).includes(transcript));
      if (!matched.length) matched = available.filter(s => phrases(s).some(p => transcript.includes(p)));

      if (matched.length) {
        addSymptoms(matched);
        setNotice(`Added from voice: ${matched.map(m => m.name).join(', ')}`);
      } else {
        setSearchTerm(transcript);
        setNotice(`No exact match for "${transcript}". Pick from the closest matches below.`);
      }
    };
    recognition.onerror = (event) => {
      setError(event.error === 'not-allowed'
        ? 'Microphone access was blocked. Allow it in your browser settings to use voice input.'
        : `Voice recognition error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const remaining = Math.max(0, MIN_SYMPTOMS - selectedSymptoms.length);
  const showDropdown = searchTerm.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Symptom Checker</h1>
        <p className="text-slate-600">
          Add everything you are experiencing. The more symptoms you add, the more reliable the result.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
        {error && (
          <div role="alert" className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start text-sm border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Search & voice input */}
        <label htmlFor="symptom-search" className="block text-sm font-semibold text-slate-700 mb-2">
          Search symptoms
        </label>
        <div className="relative mb-6">
          <div className="flex items-center border border-slate-300 rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow">
            <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              id="symptom-search"
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="symptom-options"
              aria-autocomplete="list"
              aria-activedescendant={showDropdown && suggestions[activeIndex] ? `opt-${suggestions[activeIndex].id}` : undefined}
              autoComplete="off"
              placeholder={loadingSymptoms ? 'Loading symptoms…' : 'e.g. headache, fever, cough'}
              disabled={loadingSymptoms && !symptoms.length}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setActiveIndex(0); setNotice(null); }}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-3 bg-transparent focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleVoiceInput}
              className={`px-4 py-3 border-l border-slate-200 rounded-r-xl transition-colors ${isListening ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50'}`}
              aria-label={isListening ? 'Listening…' : 'Add symptoms by voice'}
              title="Speak your symptoms"
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {showDropdown && (
            <ul
              id="symptom-options"
              ref={listRef}
              role="listbox"
              className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-auto py-1"
            >
              {suggestions.length ? suggestions.map((sym, idx) => (
                <li
                  key={sym.id}
                  id={`opt-${sym.id}`}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(sym); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`px-4 py-2.5 cursor-pointer text-slate-700 flex items-center justify-between ${idx === activeIndex ? 'bg-primary-50 text-primary-800' : ''}`}
                >
                  {sym.name}
                  {idx === activeIndex && <span className="text-xs text-primary-500">Enter ↵</span>}
                </li>
              )) : (
                <li className="px-4 py-3 text-slate-500 text-sm">No matching symptoms. Try a simpler word, e.g. "pain" or "rash".</li>
              )}
            </ul>
          )}
        </div>
        {notice && <p className="-mt-4 mb-6 text-sm text-slate-600" role="status">{notice}</p>}

        {/* Selected symptoms */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">
              Your symptoms <span className="text-slate-400 font-normal">({selectedSymptoms.length})</span>
            </h2>
            {selectedSymptoms.length > 0 && (
              <button onClick={() => setSelectedSymptoms([])} className="flex items-center text-xs font-medium text-slate-500 hover:text-red-600">
                <RotateCcw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[56px] p-3 bg-slate-50 rounded-xl border border-slate-100">
            {selectedSymptoms.length === 0 ? (
              <span className="text-slate-400 text-sm self-center px-1">Nothing added yet. Search above or tap a common symptom below.</span>
            ) : (
              selectedSymptoms.map(sym => (
                <span key={sym.id} className="inline-flex items-center bg-primary-100 text-primary-800 pl-3 pr-1.5 py-1 rounded-full text-sm font-medium">
                  {sym.name}
                  <button
                    onClick={() => handleRemove(sym.id)}
                    className="ml-1 p-0.5 rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-900"
                    aria-label={`Remove ${sym.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Common symptoms */}
        {commonSymptoms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Common symptoms</h2>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map(sym => (
                <button
                  key={sym.id}
                  onClick={() => addSymptoms([sym])}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm text-slate-600 bg-white border border-slate-200 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  {sym.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading || remaining > 0}
            className="btn-primary w-full sm:w-auto px-10 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                Analyzing…
              </>
            ) : 'Predict Disease'}
          </button>
          <p className="text-xs text-slate-500" aria-live="polite">
            {remaining > 0
              ? `Add ${remaining} more symptom${remaining > 1 ? 's' : ''} to continue.`
              : 'Results are suggestions, not a diagnosis.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predict;
