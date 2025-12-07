import React from 'react';
import { LanguageCode, LanguageConfig } from '../types';

interface Props {
  currentLang: LanguageCode;
  onSelect: (lang: LanguageCode) => void;
  languages: Record<LanguageCode, LanguageConfig>;
}

const LanguageSelector: React.FC<Props> = ({ currentLang, onSelect, languages }) => {
  return (
    <div className="flex space-x-2 bg-white/20 p-1 rounded-full backdrop-blur-md">
      {(Object.keys(languages) as LanguageCode[]).map((code) => (
        <button
          key={code}
          onClick={() => onSelect(code)}
          className={`
            px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200
            ${currentLang === code 
              ? 'bg-white text-blue-900 shadow-md transform scale-105' 
              : 'text-white hover:bg-white/10'}
          `}
        >
          {languages[code].flag} {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;