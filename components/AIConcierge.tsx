import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { askBeautyConcierge } from '../services/geminiService';

interface AIConciergeProps {
  onClose: () => void;
  userCoords?: { lat: number; lng: number };
}

const AIConcierge: React.FC<AIConciergeProps> = ({ onClose, userCoords }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      senderId: 'ai', 
      receiverId: 'user', 
      text: "Hello! I'm your Beauty Runn AI Concierge. I have live access to Google Search and Maps for Houston. Ask me anything about local shops, products, or zones!", 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Independent shops in Zone 001?",
    "Best edge control for 4C hair?",
    "Where is Beauty Empire - Griggs?",
    "Find a local wig hub near me"
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    const userMsg = text.trim();
    if (!userMsg || isLoading) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      receiverId: 'ai',
      text: userMsg,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await askBeautyConcierge(userMsg, userCoords?.lat, userCoords?.lng);

    const newAiMsg: Message = {
      id: (Date.now() + 1).toString(),
      senderId: 'ai',
      receiverId: 'user',
      text: aiResponse.text,
      sources: aiResponse.sources,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newAiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-white/80 backdrop-blur-3xl flex flex-col animate-fadeIn overflow-hidden">
      <nav className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/90 safe-top shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#1A1A1A] transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="font-serif text-2xl italic text-[#1A1A1A]">AI Concierge</h2>
            <p className="text-[10px] font-black text-[#C48B8B] uppercase tracking-widest">Powered by Gemini & Google Search</p>
          </div>
        </div>
        <div className="w-12 h-12 bg-[#EDE4DB] text-[#C48B8B] rounded-2xl flex items-center justify-center text-xl shadow-inner">
          <i className="fa-solid fa-sparkles animate-pulse"></i>
        </div>
      </nav>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F9F6F3]/30 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] space-y-3">
              <div className={`p-6 rounded-[32px] text-sm leading-relaxed shadow-sm ${
                msg.senderId === 'user' 
                  ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-[#1A1A1A]/5 rounded-tl-none'
              }`}>
                {msg.text}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <p className="text-[8px] font-black uppercase text-gray-400 mb-2 tracking-widest">Verified Grounding:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, idx) => (
                        <a 
                          key={idx} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 py-1.5 bg-gray-50 rounded-full text-[9px] font-bold text-[#C48B8B] border border-gray-100 flex items-center gap-2 hover:bg-[#EDE4DB] transition-all"
                        >
                          <i className="fa-solid fa-link text-[7px]"></i>
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className={`text-[8px] font-black uppercase tracking-widest text-gray-400 ${msg.senderId === 'user' ? 'text-right mr-4' : 'ml-4'}`}>
                {msg.senderId === 'user' ? 'You' : 'Concierge'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white p-6 rounded-[32px] rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#C48B8B] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-[#C48B8B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-[#C48B8B] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Searching Google...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 bg-white border-t border-gray-100 safe-bottom">
        {!isLoading && messages.length < 5 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => handleSend(s)}
                className="whitespace-nowrap px-5 py-2.5 rounded-full bg-[#F9F6F3] border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-[#EDE4DB] hover:text-[#1A1A1A] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about Houston beauty..."
            className="flex-1 px-8 py-5 bg-gray-50 rounded-[28px] text-sm font-medium outline-none border-2 border-transparent focus:border-[#C48B8B]/20 transition-all shadow-inner"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-16 h-16 bg-[#1A1A1A] text-white rounded-[28px] flex items-center justify-center shadow-xl shadow-[#C48B8B]/10 active:scale-90 transition-all disabled:bg-gray-100 disabled:text-gray-300"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConcierge;