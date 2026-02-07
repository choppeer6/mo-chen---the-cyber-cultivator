import React, { useState } from 'react';
import { MO_CHEN_CONFIG } from '../constants';
// APNG 格式 - 浏览器会原生播放其内置动画
import mochenApng from '../mochen.png';

interface Props {
  isSpeaking: boolean;
  affinity: number;
}

export const CharacterDisplay: React.FC<Props> = ({ isSpeaking, affinity }) => {
  // Visual effects based on affinity
  const glowColor = affinity > 80 ? 'rgba(212, 175, 55, 0.4)' : 'rgba(0, 188, 212, 0.2)';
  const scale = 1 + (affinity / 500); // Slight size increase as affinity grows

  const [imgSrc, setImgSrc] = useState<string>(mochenApng);

  const handleImageError = () => {
    console.warn("Could not load APNG. Switching to fallback.");
    setImgSrc("https://picsum.photos/seed/mochen_fallback/400/600");
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
      {/* Aura/Background Effects - 动态光晕 */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] animate-aura-glow transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
          transform: 'translateY(50px)' 
        }}
      />

      {/* Character Image Container - 持续浮动 + 说话时更明显 */}
      <div 
        className={`relative z-10 transition-transform duration-1000 ease-in-out ${isSpeaking ? 'animate-float' : 'animate-float-subtle'}`}
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative group">
            {/* Image Mask / Shape */}
            <div className="relative w-64 h-96 md:w-80 md:h-[500px] overflow-hidden rounded-[100px] border border-white/10 shadow-2xl bg-black/20">
                 {/* APNG 角色立绘 - 浏览器原生播放其内置帧动画 */}
                 <img 
                    src={imgSrc} 
                    alt="Mo Chen" 
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top opacity-95 transition-opacity duration-500 group-hover:opacity-100"
                />
                
                {/* 流光扫过效果 */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 6s ease-in-out infinite',
                  }}
                />
                
                {/* Overlay Texture (Old Paper/Digital Noise) */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
            </div>

             {/* 灵气粒子 - 增强动画 */}
             <div className="absolute -top-4 -right-4 w-4 h-4 bg-cyan-spirit rounded-full blur animate-pulse" />
             <div className="absolute top-1/2 -left-8 w-2 h-2 bg-mystic-gold rounded-full blur animate-ping" />
             <div className="absolute -bottom-2 right-1/4 w-1.5 h-1.5 bg-cyan-spirit/80 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
             <div className="absolute top-1/4 -right-6 w-2 h-2 bg-mystic-gold/70 rounded-full blur animate-ping" style={{ animationDelay: '0.5s' }} />
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