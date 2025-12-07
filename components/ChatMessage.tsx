import React from 'react';
import { ChatMessage as ChatMessageType, Role } from '../types';

interface Props {
  message: ChatMessageType;
  isArabic: boolean;
}

const ChatMessage: React.FC<Props> = ({ message, isArabic }) => {
  const isUser = message.role === Role.USER;

  // Render content parsing:
  // 1. Images ![alt](url)
  // 2. Map [MAP: lat,lng]
  // 3. Bold **text**
  const renderContent = (text: string) => {
    // Split by MAP tag first
    const mapRegex = /\[MAP:\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\]/g;
    
    // We will handle images inside the split parts
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mapRegex.exec(text)) !== null) {
      const contentBefore = text.slice(lastIndex, match.index);
      if (contentBefore) parts.push({ type: 'content', text: contentBefore });
      
      parts.push({ 
        type: 'map', 
        lat: match[1], 
        lng: match[3] 
      });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'content', text: text.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'map') {
        return (
          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-neon-blue/30 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <div className="bg-gray-900 px-3 py-1 text-[10px] text-neon-blue uppercase tracking-widest font-semibold flex items-center">
              <span className="w-2 h-2 rounded-full bg-neon-blue mr-2 animate-pulse"></span>
              Localisation Satellite
            </div>
            <iframe
              width="100%"
              height="200"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${part.lat},${part.lng}&hl=fr&z=14&output=embed`}
              className="w-full grayscale hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        );
      } else {
        return parseImagesAndBold(part.text as string, idx);
      }
    });
  };

  const parseImagesAndBold = (text: string, keyPrefix: number) => {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'image', alt: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return (
      <span key={keyPrefix}>
        {parts.map((p, i) => {
          if (p.type === 'image') {
            return (
              <div key={i} className="my-3 rounded-lg overflow-hidden border border-white/10 shadow-lg group">
                <img 
                  src={p.url} 
                  alt={p.alt} 
                  className="w-full h-auto object-cover max-h-48 transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            );
          }
          // Parse Bold
          const textParts = (p.content || '').split(/(\*\*.*?\*\*)/g);
          return (
            <span key={i}>
              {textParts.map((t, k) => {
                if (t.startsWith('**') && t.endsWith('**')) {
                  return <strong key={k} className="font-bold text-neon-blue">{t.slice(2, -2)}</strong>;
                }
                return t;
              })}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative max-w-[85%] px-5 py-4 text-sm leading-relaxed shadow-xl backdrop-blur-md
          ${isArabic ? 'font-arabic text-right' : 'font-sans text-left'}
          ${isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl rounded-br-none border border-blue-400/30' 
            : 'bg-dark-surface/90 text-gray-200 rounded-2xl rounded-bl-none border border-neon-blue/20 neon-border'}
        `}
      >
        <div className="whitespace-pre-wrap">{renderContent(message.text)}</div>
        <span className={`text-[10px] block mt-2 opacity-50 uppercase tracking-wider ${isArabic ? 'text-left' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;