import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LanguageCode, Role, LanguageConfig } from '../types';
import { streamChatResponse } from '../services/geminiService';
import MessageBubble from './ChatMessage';
import LanguageSelector from './LanguageSelector';

// --- ICONS ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const MicIcon = ({ isListening }: { isListening: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={isListening ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isListening ? 'animate-pulse text-red-500' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

interface Props {
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  languages: Record<LanguageCode, LanguageConfig>;
}

const ChatWidget: React.FC<Props> = ({ currentLang, setCurrentLang, languages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeConfig = languages[currentLang];

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: Role.MODEL,
          text: activeConfig.welcome,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, currentLang, activeConfig.welcome, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // --- SPEECH RECOGNITION ---
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = currentLang === 'ar' ? 'ar-TN' : (currentLang === 'en' ? 'en-US' : 'fr-FR');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      inputRef.current?.focus();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Accès au microphone refusé. Veuillez vérifier les permissions de votre navigateur.");
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let fullResponse = "";
    const responseId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, {
      id: responseId,
      role: Role.MODEL,
      text: "",
      timestamp: new Date()
    }]);

    await streamChatResponse(
      messages,
      userMsg.text,
      currentLang,
      (chunk) => {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === responseId ? { ...msg, text: fullResponse } : msg
        ));
      }
    );

    setIsLoading(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button with Neon Glow */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-black text-neon-blue border border-neon-blue p-4 rounded-full shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Open Chat"
        >
          <div className="absolute inset-0 rounded-full bg-neon-blue opacity-10 group-hover:animate-ping"></div>
          <ChatIcon />
        </button>
      )}

      {/* Chat Interface - RESIZED AND FIXED */}
      <div 
        className={`
          fixed z-50 transition-all duration-500 ease-out flex flex-col justify-end
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}
          bottom-0 right-0 w-full h-[85vh] 
          md:w-[380px] md:bottom-6 md:right-6 md:h-[550px]
        `}
      >
        <div className="flex flex-col h-full w-full glass-panel md:rounded-3xl shadow-2xl overflow-hidden font-sans border border-neon-blue/30 neon-glow">
          
          {/* Header */}
          <div className="bg-black/90 p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-xl shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-blue-900 flex items-center justify-center font-bold text-sm text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                N
              </div>
              <div>
                <h3 className="font-luxury font-bold text-base text-white leading-tight tracking-wider">NOMADIA</h3>
                <p className="text-neon-blue text-[9px] flex items-center uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-neon-blue rounded-full mr-1.5 animate-pulse"></span>
                  Connected
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300"
            >
              <XIcon />
            </button>
          </div>

          {/* Sub-header Controls */}
          <div className="bg-black/80 px-4 py-2 flex justify-between items-center border-b border-white/5 shrink-0">
            <span className="text-[9px] text-gray-400 font-medium tracking-widest uppercase">AI Guide v2.5</span>
            <LanguageSelector 
              currentLang={currentLang} 
              onSelect={setCurrentLang} 
              languages={languages} 
            />
          </div>

          {/* Messages Area - Ensure scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent scrollbar-hide min-h-0">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isArabic={currentLang === 'ar'}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.text === "" && (
               <div className="flex justify-start w-full mb-4">
                 <div className="bg-dark-surface border border-neon-blue/20 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-neon-blue rounded-full typing-dot"></div>
                   <div className="w-1.5 h-1.5 bg-neon-blue rounded-full typing-dot"></div>
                   <div className="w-1.5 h-1.5 bg-neon-blue rounded-full typing-dot"></div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom of flex container */}
          <div className="p-3 bg-black/90 border-t border-white/10 backdrop-blur-xl shrink-0">
            <div className={`relative flex items-center gap-2 ${activeConfig.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-full transition-all duration-300 border ${isListening ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-neon-blue hover:border-neon-blue'}`}
                title="Dictation"
              >
                <MicIcon isListening={isListening} />
              </button>

              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeConfig.placeholder}
                  className={`
                    w-full bg-gray-900/50 border border-gray-700 text-white text-sm rounded-full py-2.5 px-4 
                    focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] transition-all
                    placeholder-gray-600
                    ${activeConfig.dir === 'rtl' ? 'text-right pr-4 pl-12' : 'pl-4 pr-12'}
                  `}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`
                    absolute top-1/2 transform -translate-y-1/2 p-1.5 rounded-full text-white transition-all
                    ${!input.trim() ? 'opacity-30 cursor-not-allowed' : 'text-neon-blue hover:scale-110'}
                    ${activeConfig.dir === 'rtl' ? 'left-2' : 'right-2'}
                  `}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChatWidget;