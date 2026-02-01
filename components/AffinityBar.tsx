import React from 'react';
import { getAffinityStageName } from '../services/geminiService';
import { Language, AffinityStage } from '../types';
import { UI_TEXT } from '../constants';

interface Props {
  affinity: number;
  lang: Language;
}

export const AffinityBar: React.FC<Props> = ({ affinity, lang }) => {
  const stageName = getAffinityStageName(affinity, lang);
  const percentage = Math.min(100, Math.max(0, affinity));

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-mystic-gold uppercase tracking-widest font-serif">{UI_TEXT[lang].daoHeart}</span>
        <span className="text-xs text-gray-400 font-serif">{stageName}</span>
      </div>
      <div className="w-full h-1 bg-ink-800 rounded-full overflow-hidden border border-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-900 via-cyan-spirit to-mystic-gold transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-600 font-mono">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
};