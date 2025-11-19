import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { Message } from '../types';
import { Send, Bot, User, Loader2, Sparkles, Wrench } from 'lucide-react';

const ChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'AltekBot Online. I can assist with troubleshooting, maintenance schedules for your mining equipment, and safety protocols. What issue are you facing?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await getChatResponse(history, input);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-alti-green to-emerald-700 rounded-full flex items-center justify-center shadow-lg shadow-green-900/50">
          <Wrench className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            Maintenance Support
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-green-400 font-mono border border-green-500/30">ONLINE</span>
          </h3>
          <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-slate-200' : 'bg-white border border-slate-200'}`}>
                  {isUser ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-alti-green" />}
                </div>

                <div className={`
                  p-4 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${isUser 
                    ? 'bg-slate-900 text-white leaf-shape-inv' 
                    : 'bg-white text-slate-700 border border-slate-100 leaf-shape'}
                `}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-alti-green animate-pulse" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 leaf-shape flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Analyzing manual...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-alti-green rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-alti-green rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-alti-green rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the fault or ask for a procedure..."
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 rounded-xl pl-4 pr-12 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-alti-green/50 focus:border-alti-green transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-alti-green hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400">Follow all physical safety guidelines. AI advice does not replace supervisor approval.</span>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;