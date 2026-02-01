import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, Language } from '../types';
import { Send, Upload, Eye, Globe } from 'lucide-react';
import { UI_TEXT } from '../constants';

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  onCaptureScreen: () => void;
  isLoading: boolean;
  lang: Language;
  onToggleLanguage: () => void;
}

export const ChatInterface: React.FC<Props> = ({ 
  messages, 
  onSendMessage, 
  onFileUpload, 
  onCaptureScreen, 
  isLoading, 
  lang,
  onToggleLanguage
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ui = UI_TEXT[lang];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-md shadow-lg border animate-fade-in
                ${msg.role === Role.USER 
                  ? 'bg-ink-800/80 border-gray-700 text-gray-200 rounded-tr-none' 
                  : 'bg-indigo-950/40 border-cyan-spirit/30 text-cyan-100 rounded-tl-none font-serif'
                }`}
            >
              {msg.type === 'analysis_result' && (
                <div className="text-[10px] text-cyan-spirit mb-2 uppercase tracking-widest border-b border-cyan-spirit/20 pb-1 flex items-center gap-1">
                  <Eye size={10} /> {ui.divineSenseActive}
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-indigo-950/20 border border-cyan-spirit/20 text-cyan-spirit/70 px-4 py-2 rounded-2xl text-xs rounded-tl-none italic">
               {ui.thinking}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-black via-ink-900 to-transparent">
        <div className="relative glass-panel rounded-full flex items-center p-1 pr-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
           {/* Language Toggle */}
           <button
            onClick={onToggleLanguage}
            className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 font-mono text-xs flex items-center gap-1"
            title="Switch Language"
          >
            <Globe size={16} /> {lang === 'en' ? 'EN' : '中'}
          </button>

           {/* Upload File */}
           <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-cyan-spirit transition-colors rounded-full hover:bg-white/5"
            title={ui.presentArtifact}
          >
            <Upload size={18} />
          </button>
          
          {/* Screen Capture */}
          <button
            onClick={onCaptureScreen}
            className="p-3 text-gray-400 hover:text-mystic-gold transition-colors rounded-full hover:bg-white/5"
            title={ui.divineSense}
          >
            <Eye size={18} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*,text/*"
          />
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ui.inputPlaceholder}
            className="flex-1 bg-transparent border-none text-gray-200 placeholder-gray-600 focus:ring-0 text-sm px-2 font-serif"
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className={`p-2 rounded-full transition-all duration-300
              ${inputText.trim() && !isLoading 
                ? 'bg-cyan-spirit/20 text-cyan-spirit hover:bg-cyan-spirit hover:text-black shadow-[0_0_15px_rgba(0,188,212,0.3)]' 
                : 'text-gray-600 cursor-not-allowed'}`}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-gray-700 font-mono tracking-wider">
          {ui.linkEstablished}
        </div>
      </div>
    </div>
  );
};