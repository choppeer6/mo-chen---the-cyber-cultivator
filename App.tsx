import React from 'react';
import { useMoChen } from './hooks/useMoChen';
import { ChatInterface } from './components/ChatInterface';
import { CharacterDisplay } from './components/CharacterDisplay';
import { AffinityBar } from './components/AffinityBar';
import { UI_TEXT } from './constants';

function App() {
  const { 
    messages, 
    affinity, 
    isLoading, 
    isSpeaking, 
    language, 
    toggleLanguage, 
    sendMessage, 
    sendFile, 
    captureScreen 
  } = useMoChen();

  return (
    <div className="relative w-full h-screen bg-ink-900 overflow-hidden flex flex-col md:flex-row">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/10 to-transparent"></div>
        {/* Floating particles (CSS only) */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/10 rounded-full animate-float"></div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto">
        
        {/* Left Panel: Chat Interface */}
        <div className="w-full md:w-1/3 h-[45%] md:h-full p-4 flex flex-col order-2 md:order-1">
          <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-gray-800 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
               <span className="text-gray-400 text-xs font-mono uppercase">{UI_TEXT[language].systemStatus}</span>
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <ChatInterface 
                messages={messages} 
                onSendMessage={sendMessage} 
                onFileUpload={sendFile}
                onCaptureScreen={captureScreen}
                isLoading={isLoading}
                lang={language}
                onToggleLanguage={toggleLanguage}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Character & Stats */}
        <div className="w-full md:w-2/3 h-[55%] md:h-full p-4 flex flex-col justify-center items-center order-1 md:order-2">
           
           <div className="absolute top-8 right-8 w-64 z-20">
             <AffinityBar affinity={affinity} lang={language} />
           </div>

           <CharacterDisplay isSpeaking={isSpeaking} affinity={affinity} />

           {/* Mobile Only: Quick Status */}
           <div className="md:hidden absolute top-4 left-4 text-xs text-gray-500 font-mono">
              Affinity: {affinity}%
           </div>
        </div>

      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-2 left-0 w-full text-center text-[10px] text-gray-800 pointer-events-none">
        {UI_TEXT[language].footer}
      </div>
    </div>
  );
}

export default App;