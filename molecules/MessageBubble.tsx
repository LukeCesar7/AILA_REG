import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  legalArea?: string;
}

const AREA_LABELS: Record<string, { label: string, color: string }> = {
  'Direito Geral': { label: 'Parecer Geral', color: 'bg-sequoia-teal' },
  'Civil': { label: 'Análise Civilista', color: 'bg-blue-600' },
  'Penal': { label: 'Parecer Criminal', color: 'bg-red-700' },
  'Trabalhista': { label: 'Consultoria Laboral', color: 'bg-orange-600' },
  'Tributário': { label: 'Parecer Fiscal', color: 'bg-amber-600' },
  'Previdenciário': { label: 'Análise de Seguridade', color: 'bg-indigo-600' },
  'Administrativo': { label: 'Rito Administrativo', color: 'bg-slate-700' },
  'Consumidor': { label: 'Defesa do Consumidor', color: 'bg-emerald-600' }
};

export const MessageBubble: React.FC<MessageProps> = ({ role, content, legalArea = 'Direito Geral' }) => {
  const isAssistant = role === 'assistant';
  const areaInfo = AREA_LABELS[legalArea] || AREA_LABELS['Direito Geral'];

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} w-full mb-12 animate-reveal`}>
      <div className={`relative ${isAssistant ? 'w-full max-w-6xl' : 'max-w-[80%]'}`}>

        {isAssistant ? (
          <div className="document-paper rounded-ios-lg overflow-hidden border border-black/5 shadow-2xl">
            <div className="bg-slate-50/80 h-12 flex items-center px-8 border-b border-black/[0.04] justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${areaInfo.color} shadow-sm`}></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                  {areaInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">AILA 2025.2</span>
                 <div className="h-3 w-[1px] bg-slate-200"></div>
                 <span className="text-[9px] font-bold text-slate-400">
                   {new Date().toLocaleDateString('pt-BR')}
                 </span>
              </div>
            </div>
            <div className="p-10 text-slate-950">
               <div className="prose prose-slate max-w-none prose-sm leading-relaxed font-medium text-slate-900 selection:bg-sequoia-blue/10">
                  <ReactMarkdown>{content}</ReactMarkdown>
               </div>
            </div>

            <footer className="bg-slate-50/30 px-8 py-3 border-t border-black/[0.02] flex justify-between items-center">
              <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">**</span>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-300 hover:text-sequoia-blue hover:bg-white rounded-md transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <button className="p-1.5 text-slate-300 hover:text-sequoia-blue hover:bg-white rounded-md transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">print</span>
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div className="bg-sequoia-blue text-white py-5 px-6 rounded-ios-lg rounded-tr-none shadow-xl border border-white/20">
            <p className="text-[15px] leading-relaxed font-bold tracking-tight">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};