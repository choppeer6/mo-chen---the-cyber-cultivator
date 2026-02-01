import React, { useState, useEffect } from 'react';
import { MO_CHEN_CONFIG } from '../constants';

interface Props {
  isSpeaking: boolean;
  affinity: number;
}

export const CharacterDisplay: React.FC<Props> = ({ isSpeaking, affinity }) => {
  // Visual effects based on affinity
  const glowColor = affinity > 80 ? 'rgba(212, 175, 55, 0.4)' : 'rgba(0, 188, 212, 0.2)';
  const scale = 1 + (affinity / 500); // Slight size increase as affinity grows

  const [imgSrc, setImgSrc] = useState(MO_CHEN_CONFIG.avatar);

  // Reset image source if config changes or on mount, but protect against loop if avatar is bad
  useEffect(() => {
    setImgSrc(MO_CHEN_CONFIG.avatar);
  }, [MO_CHEN_CONFIG.avatar]);

  const handleImageError = () => {
    console.warn("Could not load local character image. Switching to fallback.");
    setImgSrc("https://picsum.photos/seed/mochen_fallback/400/600");
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
      {/* Aura/Background Effects */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
          transform: 'translateY(50px)' 
        }}
      />

      {/* Character Image Container */}
      <div 
        className={`relative z-10 transition-transform duration-1000 ease-in-out ${isSpeaking ? 'animate-float' : ''}`}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative group">
            {/* Image Mask / Shape */}
            <div className="relative w-64 h-96 md:w-80 md:h-[500px] overflow-hidden rounded-[100px] border border-white/10 shadow-2xl bg-black/20">
                 <img 
                    src={imgSrc} 
                    alt="Mo Chen" 
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top opacity-95 transition-opacity duration-500 group-hover:opacity-100"
                />
                
                {/* Overlay Texture (Old Paper/Digital Noise) */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
            </div>

             {/* Interactive Particles (Simulated with simple divs) */}
             <div className="absolute -top-4 -right-4 w-4 h-4 bg-cyan-spirit rounded-full blur animate-pulse" />
             <div className="absolute top-1/2 -left-8 w-2 h-2 bg-mystic-gold rounded-full blur animate-ping" />
        </div>
      </div>

      {/* Name Tag */}
      <div className="mt-8 z-10 text-center">
        <h1 className="text-3xl font-serif text-gray-200 tracking-[0.2em] drop-shadow-lg">
          {MO_CHEN_CONFIG.name}
        </h1>
        <p className="text-sm text-cyan-spirit/60 tracking-widest mt-1 uppercase text-[10px]">
          {MO_CHEN_CONFIG.title}
        </p>
      </div>
    </div>
  );
};