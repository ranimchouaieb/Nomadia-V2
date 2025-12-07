import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import { LanguageCode, LanguageConfig } from './types';

// Constants for Languages
const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    welcome: "Bienvenue. Je suis Nomadia. Explorez l'élégance et l'histoire de la Tunisie.",
    placeholder: "Posez votre question...",
    dir: 'ltr'
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    welcome: "Welcome. I am Nomadia. Explore the elegance and history of Tunisia.",
    placeholder: "Ask a question...",
    dir: 'ltr'
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    flag: '🇹🇳',
    welcome: "مرحباً. أنا نوماديا. استكشف فخامة وتاريخ تونس.",
    placeholder: "اطرح سؤالاً...",
    dir: 'rtl'
  }
};

const SITE_CONTENT = {
  fr: {
    nav: { home: "Accueil", video: "Immersion", news: "L'Actualité", about: "L'Esprit" },
    hero: {
      title: "TUNISIE",
      subtitle: "L'Héritage Éternel",
      cta: "Commencer le Voyage",
      scroll: "Découvrir"
    },
    videoSection: {
      title: "Immersion Visuelle",
      desc: "Une symphonie de paysages, du désert d'or aux eaux saphir."
    },
    newsSection: {
      title: "À la Une",
      items: [
        { title: "Jazz à Carthage", date: "JUILLET 2024", desc: "L'élégance musicale sous les étoiles.", image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=500&q=80" },
        { title: "L'Or de Tozeur", date: "OCTOBRE 2024", desc: "La récolte précieuse des Deglet Nour.", image: "https://images.unsplash.com/photo-1628154952084-297eb063b53a?w=500&q=80" },
        { title: "Nocturne au Bardo", date: "MAI 2024", desc: "L'histoire prend vie à la nuit tombée.", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&q=80" }
      ]
    },
    aboutSection: {
      title: "L'Esprit Nomadia",
      text: "Nomadia fusionne l'art et la technologie. Une intelligence artificielle conçue pour révéler les secrets enfouis de la Tunisie avec une précision luxueuse. Nous transformons chaque interaction en une découverte exclusive."
    },
    footer: {
      rights: "© 2024 NOMADIA. L'EXCELLENCE CULTURELLE."
    }
  },
  en: {
    nav: { home: "Home", video: "Immersion", news: "News", about: "The Spirit" },
    hero: {
      title: "TUNISIA",
      subtitle: "The Eternal Legacy",
      cta: "Start the Journey",
      scroll: "Discover"
    },
    videoSection: {
      title: "Visual Immersion",
      desc: "A symphony of landscapes, from golden deserts to sapphire waters."
    },
    newsSection: {
      title: "Highlights",
      items: [
        { title: "Jazz at Carthage", date: "JULY 2024", desc: "Musical elegance under the stars.", image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=500&q=80" },
        { title: "Gold of Tozeur", date: "OCTOBER 2024", desc: "The precious harvest of Deglet Nour.", image: "https://images.unsplash.com/photo-1628154952084-297eb063b53a?w=500&q=80" },
        { title: "Nocturne at Bardo", date: "MAY 2024", desc: "History comes alive at nightfall.", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&q=80" }
      ]
    },
    aboutSection: {
      title: "The Nomadia Spirit",
      text: "Nomadia fuses art and technology. An artificial intelligence designed to reveal Tunisia's buried secrets with luxurious precision. We transform every interaction into an exclusive discovery."
    },
    footer: {
      rights: "© 2024 NOMADIA. CULTURAL EXCELLENCE."
    }
  },
  ar: {
    nav: { home: "الرئيسية", video: "انغماس", news: "أخبار", about: "الروح" },
    hero: {
      title: "تونس",
      subtitle: "الإرث الخالد",
      cta: "ابدأ الرحلة",
      scroll: "اكتشف"
    },
    videoSection: {
      title: "انغماس بصري",
      desc: "سيمفونية من المناظر الطبيعية، من الصحراء الذهبية إلى المياه الياقوتية."
    },
    newsSection: {
      title: "أبرز الأحداث",
      items: [
        { title: "جاز في قرطاج", date: "يوليو 2024", desc: "الأناقة الموسيقية تحت النجوم.", image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=500&q=80" },
        { title: "ذهب توزر", date: "أكتوبر 2024", desc: "الحصاد الثمين لدقلة نور.", image: "https://images.unsplash.com/photo-1628154952084-297eb063b53a?w=500&q=80" },
        { title: "ليلة في باردو", date: "ماي 2024", desc: "التاريخ ينبض بالحياة عند حلول الظلام.", image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=500&q=80" }
      ]
    },
    aboutSection: {
      title: "روح نوماديا",
      text: "نوماديا تدمج الفن والتكنولوجيا. ذكاء اصطناعي مصمم للكشف عن أسرار تونس الدفينة بدقة فاخرة. نحول كل تفاعل إلى اكتشاف حصري."
    },
    footer: {
      rights: "© 2024 نوماديا. التميز الثقافي."
    }
  }
};

const App: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('fr');
  const [scrolled, setScrolled] = useState(false);

  const t = SITE_CONTENT[currentLang];
  const isArabic = currentLang === 'ar';
  const dir = LANGUAGES[currentLang].dir;

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`relative w-full overflow-x-hidden bg-dark-bg text-gray-100 font-sans ${isArabic ? 'font-arabic' : ''}`} dir={dir}>
      
      {/* --- NAVBAR (Panoramic & Glass) --- */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-700 ease-in-out border-b ${scrolled ? 'bg-dark-bg/80 backdrop-blur-md border-neon-blue/10 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-transparent border-transparent py-8'}`}>
        <div className="container mx-auto px-8 md:px-16 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
             {/* Neon Bar */}
             <div className="w-1 h-8 bg-neon-blue rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)] transition-all group-hover:h-10 group-hover:scale-110"></div>
             <div className={`text-2xl md:text-3xl font-luxury font-bold tracking-[0.2em] text-white group-hover:text-neon-blue transition-colors duration-500 drop-shadow-lg`}>
               NOMADIA
             </div>
          </div>
          <div className={`hidden md:flex space-x-12 ${isArabic ? 'flex-row-reverse space-x-reverse' : ''}`}>
             {[
               { id: 'home', label: t.nav.home },
               { id: 'video', label: t.nav.video },
               { id: 'news', label: t.nav.news },
               { id: 'about', label: t.nav.about }
             ].map(link => (
               <a 
                 key={link.id} 
                 href={`#${link.id}`} 
                 className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all duration-300 relative group overflow-hidden"
               >
                 <span className="relative z-10">{link.label}</span>
                 <span className="absolute bottom-0 left-0 w-full h-[1px] bg-neon-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                 <span className="absolute inset-0 bg-neon-blue/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
               </a>
             ))}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative h-screen w-full flex items-center justify-center overflow-hidden perspective-1000">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-dark-bg/50 z-10 mix-blend-multiply"></div>
          {/* Panoramic Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-blue-900/30 z-10"></div>
          
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover scale-105"
            style={{ filter: 'contrast(1.2) saturate(1.1) brightness(0.9)' }}
          >
             <source src="public/tunis.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 text-center px-4 w-full flex flex-col items-center mt-24 md:mt-0">
          {/* Tag Experience v2.0 - Corrigé pour visibilité */}
          <div className="mb-8 md:mb-12 inline-flex items-center gap-4 animate-reveal bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-neon-blue/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]" style={{animationDelay: '0.2s'}}>
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue animate-pulse"></span>
            <span className="text-neon-blue uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold neon-text">Experience v2.0</span>
          </div>
          
          {/* TITRE ANIMÉ - Blue Glow */}
          <h1 className="font-luxury text-7xl md:text-9xl font-bold mb-8 text-white leading-tight tracking-wider drop-shadow-2xl flex flex-wrap justify-center gap-1 md:gap-4 mix-blend-overlay opacity-90">
            {t.hero.title.split('').map((char, index) => (
              <span 
                key={`${currentLang}-${index}`} 
                className="opacity-0 animate-reveal inline-block hover:text-neon-blue transition-colors duration-500 cursor-default"
                style={{ 
                  animationDelay: `${0.3 + (index * 0.1)}s`,
                  textShadow: '0 10px 30px rgba(0,0,0,0.5)' 
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          
          <p className="font-light font-sans text-lg md:text-2xl text-gray-200 mb-16 max-w-3xl mx-auto tracking-widest opacity-0" style={{animation: 'reveal 1.5s ease-out forwards 1.2s'}}>
            {t.hero.subtitle}
          </p>
          
          <div className="opacity-0" style={{animation: 'reveal 1.5s ease-out forwards 1.6s'}}>
            <a href="#about" className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden rounded-none border border-white/20 hover:border-neon-blue/60 bg-black/30 backdrop-blur-sm transition-all duration-500">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-blue/0 via-neon-blue/10 to-neon-blue/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span className="font-sans font-light tracking-[0.3em] uppercase text-sm text-white group-hover:text-neon-blue transition-colors">
                {t.hero.cta}
              </span>
            </a>
          </div>

          {/* Scroll Indicator - POPPING ANIMATION */}
          <div className="mt-24 flex flex-col items-center opacity-0 animate-reveal" style={{animationDelay: '2.2s'}}>
            <span className="text-[10px] uppercase tracking-[0.3em] mb-4 text-neon-blue font-bold animate-pop-glow cursor-pointer hover:scale-110 transition-transform">
              {t.hero.scroll}
            </span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-neon-blue to-transparent opacity-50"></div>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (Panoramic & Luxury) --- */}
      <section id="about" className="py-40 bg-dark-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-20">
            {/* Image Container - Panoramic Aspect */}
            <div className="md:w-3/5 relative group perspective-1000">
              <div className="absolute -inset-4 bg-neon-blue/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative rounded-sm overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-700 hover:scale-[1.01]">
                <img 
                  src="public/tunisia.png" 
                  alt="Esprit Nomadia" 
                  className="w-full h-[500px] object-cover filter brightness-90 group-hover:brightness-105 contrast-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <p className="font-luxury text-4xl text-white mb-2">Sidi Bou Saïd</p>
                   <p className="text-neon-blue text-xs uppercase tracking-widest">Le Paradis Bleu</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/5">
              <div className="w-12 h-1 bg-neon-blue mb-8"></div>
              <h2 className="font-luxury text-5xl font-bold text-white mb-8 leading-tight">
                {t.aboutSection.title}
              </h2>
              <p className="text-lg text-gray-400 leading-8 mb-12 font-light tracking-wide text-justify">
                {t.aboutSection.text}
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                 {[
                   { val: "3000+", label: "Years" },
                   { val: "AI", label: "Powered" }
                 ].map((stat, i) => (
                   <div key={i} className="border-t border-white/20 pt-6 hover:border-neon-blue transition-colors group">
                     <div className="text-4xl font-light text-white mb-2 group-hover:text-neon-blue transition-colors group-hover:translate-x-2 duration-300">{stat.val}</div>
                     <div className="text-xs text-gray-500 uppercase tracking-[0.2em]">{stat.label}</div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VIDEO IMMERSION (Full Width) --- */}
      <section id="video" className="py-40 bg-dark-surface relative border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <span className="text-neon-blue text-xs font-bold tracking-[0.4em] uppercase mb-6 block opacity-80">{t.videoSection.title}</span>
          <h2 className="font-luxury text-4xl md:text-6xl mb-20 max-w-4xl mx-auto leading-tight text-white">{t.videoSection.desc}</h2>
          
          <div className="relative w-full aspect-[21/9] rounded-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group cursor-pointer border-y border-white/10">
             <img src="https://images.unsplash.com/photo-1549303565-d62150998c28?w=1600&q=90" alt="Sahara" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" />
             
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                <button className="w-24 h-24 rounded-full border border-white/40 flex items-center justify-center group-hover:scale-110 group-hover:border-neon-blue group-hover:bg-black/50 transition-all duration-500 backdrop-blur-md">
                   <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1 group-hover:border-l-neon-blue transition-colors"></div>
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* --- NEWS SECTION --- */}
      <section id="news" className="py-40 bg-dark-bg relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-neon-blue text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Journal</span>
              <h2 className="font-luxury text-5xl text-white">Nomadia Chronicles</h2>
            </div>
            <a href="#" className="text-gray-400 hover:text-white uppercase tracking-widest text-xs border-b border-gray-700 hover:border-neon-blue pb-1 transition-all">Voir toutes les actualités</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {t.newsSection.items.map((news, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="h-80 overflow-hidden mb-6 relative border-b-2 border-transparent group-hover:border-neon-blue transition-all duration-500">
                  <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 filter grayscale group-hover:grayscale-0" />
                </div>
                <div className="flex flex-col px-2">
                  <div className="flex items-center gap-3 mb-3">
                     <span className="w-2 h-2 bg-neon-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                     <span className="text-[10px] font-bold text-gray-500 group-hover:text-neon-blue uppercase tracking-widest transition-colors">{news.date}</span>
                  </div>
                  <h3 className="font-luxury text-2xl text-white mb-3 group-hover:translate-x-2 transition-transform duration-300">{news.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    {news.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-dark-surface text-white py-20 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="mb-10 relative group cursor-default">
             <span className="font-luxury text-4xl tracking-[0.2em] font-bold text-white relative z-10 group-hover:text-neon-blue transition-colors duration-500">NOMADIA</span>
             <div className="absolute -inset-8 bg-neon-blue/10 blur-2xl opacity-50 z-0 group-hover:opacity-80 transition-opacity"></div>
          </div>
          <div className="flex space-x-12 mb-10">
            {['Instagram', 'Twitter', 'LinkedIn'].map(social => (
              <a key={social} href="#" className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors relative hover:-translate-y-1 transform duration-300">
                {social}
              </a>
            ))}
          </div>
          <p className="text-gray-600 text-[9px] uppercase tracking-widest opacity-50">
            {t.footer.rights}
          </p>
        </div>
      </footer>

      {/* --- CHAT WIDGET --- */}
      <ChatWidget 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang} 
        languages={LANGUAGES}
      />
    </div>
  );
};

export default App;