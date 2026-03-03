import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { chatWithBot } from '../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I am HealthAI Bot. Ask me basic health questions or tell me your symptoms.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput("");

    // Call API
    const reply = await chatWithBot(userMessage);
    setMessages(prev => [...prev, { text: reply, isBot: true }]);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all z-50 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-primary-600 text-white p-4 flex items-center shadow-sm">
            <MessageSquare className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-lg">Health Assistant</h3>
          </div>
          
          <div className="flex-1 p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.isBot ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none' : 'bg-primary-600 text-white self-end rounded-tr-none shadow-sm'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-100 text-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
            />
            <button type="submit" className="ml-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
