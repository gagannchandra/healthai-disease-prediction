import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { chatWithBot } from '../utils/api';

const QUICK_QUESTIONS = ['I have a fever', 'I have a headache', 'Stomach pain'];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hi! I am the HealthAI assistant. Ask a basic health question, or use the Symptom Checker for a full prediction.', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, waiting]);

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || waiting) return;
    setMessages(prev => [...prev, { text: message, isBot: false }]);
    setInput('');
    setWaiting(true);
    const reply = await chatWithBot(message);
    setMessages(prev => [...prev, { text: reply, isBot: true }]);
    setWaiting(false);
  };

  return (
    <div className="print:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all z-50"
        aria-label={isOpen ? 'Close health assistant' : 'Open health assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Health assistant"
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-5 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
        >
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Health Assistant</h2>
              <p className="text-xs text-primary-100">General information only, not medical advice</p>
            </div>
          </div>

          <div className="p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col space-y-3" aria-live="polite">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.isBot ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none' : 'bg-primary-600 text-white self-end rounded-tr-none'}`}
              >
                {msg.text}
              </div>
            ))}
            {waiting && (
              <div className="self-start bg-white border border-slate-200 rounded-xl rounded-tl-none px-3 py-2.5 flex gap-1" aria-label="Assistant is typing">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full border border-primary-200 text-primary-700 bg-white hover:bg-primary-50">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 bg-white border-t border-slate-100 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              aria-label="Message"
              className="flex-1 bg-slate-100 text-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            />
            <button
              type="submit"
              disabled={waiting || !input.trim()}
              className="ml-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
