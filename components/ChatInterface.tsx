import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { COLORS } from '../constants';

interface ChatInterfaceProps {
  recipientName: string;
  onClose: () => void;
  role: 'CUSTOMER' | 'DRIVER';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ recipientName, onClose, role }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'other', receiverId: 'me', text: `Hi! I'm your Beauty Runn partner. I'm handling your order now.`, timestamp: Date.now() - 60000 }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = role === 'DRIVER' 
    ? ["I'm outside!", "Traffic is heavy, 5 mins.", "Order picked up!", "Can't find the door."]
    : ["Please leave at door.", "Is the order ready?", "Thank you!", "Call me when here."];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (text: string = input) => {
    const finalMsg = text.trim();
    if (!finalMsg) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      receiverId: 'other',
      text: finalMsg,
      timestamp: Date.now()
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[60] md:inset-auto md:bottom-24 md:right-8 md:w-96 h-full md:h-[550px] bg-white shadow-2xl rounded-t-[40px] md:rounded-[40px] flex flex-col border border-pink-50 overflow-hidden animate-fadeIn">
      <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center safe-top">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <span className="font-black text-gray-900 block tracking-tight">{recipientName}</span>
            <span className="text-[10px] text-green-500 uppercase font-black tracking-widest">Online Now</span>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl transition hover:bg-pink-50 hover:text-pink-600">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm shadow-sm ${
              msg.senderId === 'me' 
                ? 'bg-[#D63384] text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-pink-50 rounded-tl-none'
            }`}>
              {msg.text}
              <div className={`text-[9px] mt-2 font-bold ${msg.senderId === 'me' ? 'text-pink-100 text-right' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t bg-white safe-bottom">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
          {quickReplies.map(reply => (
            <button 
              key={reply} 
              onClick={() => handleSend(reply)}
              className="flex-shrink-0 px-4 py-2 bg-pink-50 text-pink-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-pink-100 active:scale-95 transition hover:bg-pink-100"
            >
              {reply}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your runn message..."
            className="flex-1 px-5 py-4 bg-gray-100 rounded-[24px] text-sm font-medium outline-none border-2 border-transparent focus:border-pink-200 transition-all"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-14 h-14 bg-[#D63384] disabled:bg-gray-200 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-pink-100 active:scale-90 transition-all"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
