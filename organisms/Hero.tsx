
import React from 'react';

interface HeroProps {
  onStartChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartChat }) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="max-w-4xl w-full text-center z-10 animate-reveal">
        {/* Pré-Apresentação*/}
        <div className="mb-12 inline-block px-6 py-2 glass-vibrancy rounded-full text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 border-white/80 shadow-lg">
          UNIFG - Direito na Prática
        </div>

        <h1 className="text-7xl md:text-9xl font-etna font-800 text-white mb-8 tracking-[-0.05em] leading-[0.85] drop-shadow-2xl"
        >O aprendizado,<br/>
          <span className="text-white/40 italic font-serif tracking-[0.02em]"
          >a evolução.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-2xl mx-auto font-bold leading-relaxed tracking-tight drop-shadow-md"
        >Apoio inteligente para a rotina do Núcleo de Prática Jurídica. Menos dúvida, mais prática!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          {/* Mensagem botão*/}
          <button 
            onClick={onStartChat}
            className="mac-btn bg-white text-slate-950 px-16 py-6 rounded-ios-lg font-900 text-xl shadow-2xl hover:scale-105 border border-white"
          >Abrir Chat
          </button>
          {/* Mensagem motivacional - ideia para dinãmico: por dia*/}
          <button className="text-white/70 font-black text-lg hover:text-white transition-colors underline decoration-white/30 underline-offset-8"
          >“Conhecer para defender.”
          </button>
        </div>
        {/* Esquerda*/}
        <div className="mt-32 grid grid-cols-3 gap-16 max-w-3xl mx-auto border-t border-white/10 pt-12">
          <div className="text-center">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Engine</h4>
            <p className="text-[15px] font-black text-white"
            >Gemini 3 Pro</p>
          </div>
          {/* Meio*/}
          <div className="text-center border-x border-white/10 px-4">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Segurança</h4>
            <p className="text-[15px] font-black text-white"
            >Seção Individual</p>
          </div>
          {/* Direita*/}
          <div className="text-center">
            <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Contexto</h4>
            <p className="text-[15px] font-black text-white"
            >Base Jurídica dinâmica</p>
          </div>
        </div>
      </div>
      {/* Fundo escuro - Atentar ao contraste com legibilidade - IA*/}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sequoia-teal/60 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sequoia-blue/60 blur-[160px] rounded-full"></div>
      </div>
    </section>
  );
};
