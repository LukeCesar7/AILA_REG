import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToAILA } from '../services/gemini';
import { MessageBubble } from '../molecules/MessageBubble';
import { getChatHistory, saveChatHistory, clearAllData } from '../services/storage';
import { OFFICIAL_SOURCES } from '../services/seedData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  legalArea?: string;
}

interface UserDocument {
  name: string;
  content: string;
  size: string;
}

const LEGAL_AREAS = [
  { id: 'Direito Geral', icon: 'account_balance', desc: 'Pesquisa Multidisciplinar' },
  { id: 'Civil', icon: 'family_restroom', desc: 'CPC e Direito Privado' },
  { id: 'Penal', icon: 'gavel', desc: 'CPP e Direito Criminal' },
  { id: 'Trabalhista', icon: 'work', desc: 'CLT e Ritos Laborais' },
  { id: 'Tributário', icon: 'payments', desc: 'CTN e Defesa Fiscal' },
  { id: 'Previdenciário', icon: 'elderly', desc: 'Lei 8.213 e Benefícios' },
  { id: 'Administrativo', icon: 'account_tree', desc: 'Lei 9.784 e Estado' },
  { id: 'Consumidor', icon: 'shopping_cart', desc: 'CDC e Vulnerabilidade' }
];

export const ChatInterface: React.FC<{ clearTrigger?: number }> = ({ clearTrigger }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedArea, setSelectedArea] = useState('Direito Geral');
  const [isAreaMenuOpen, setIsAreaMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewingFile, setViewingFile] = useState<{name: string, content: string} | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await getChatHistory();
        if (history && history.length > 0) {
          setMessages(history.map(h => ({ role: h.role, content: h.content, legalArea: h.legalArea })));
        } else {
          setMessages([{ 
            role: 'assistant', 
            content: '# AILA\n\nPronta para análise. Utilize o botão de anexo na barra inferior para fundamentar com seus documentos ou faça sua pergunta.',
            legalArea: 'Direito Geral'
          }]);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    loadData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAreaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isInitializing && messages.length > 0) saveChatHistory(messages);
  }, [messages, isInitializing]);

  useEffect(() => {
    if (clearTrigger && clearTrigger > 0) {
      if (window.confirm('Confirme para limpar o histórico de conversa.')) {
        clearAllData().then(() => window.location.reload());
      }
    }
  }, [clearTrigger]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
      setUserDocuments(prev => [...prev, { name: file.name, content: text, size: (file.size / 1024).toFixed(1) + ' KB' }]);
    }
  };

  const openOfficialSource = async (source: typeof OFFICIAL_SOURCES[0]) => {
    try {
      const response = await fetch(source.path);
      const text = await response.text();
      setViewingFile({ name: source.name, content: text });
    } catch (e) {
      alert('Documento em processo de indexação.');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    const currentArea = selectedArea;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsLoading(true);
    try {
      const context = userDocuments.map(d => `[DOC: ${d.name}]\n${d.content}`).join('\n');
      const apiHistory = messages.slice(-10).map(m => ({ 
        role: m.role === 'user' ? 'user' : 'model', 
        parts: [{ text: m.content }] 
      }));
      const res = await sendMessageToAILA(q, apiHistory, context, currentArea);
      if (res) setMessages(prev => [...prev, { role: 'assistant', content: res, legalArea: currentArea }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '### Erro Crítico\nFalha na comunicação com o motor de inferência.', legalArea: currentArea }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) return null;

  const currentAreaInfo = LEGAL_AREAS.find(a => a.id === selectedArea) || LEGAL_AREAS[0];

  return (
    <div className="flex h-screen pt-14 overflow-hidden relative bg-transparent">
      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-20 z-50 w-10 h-10 flex items-center justify-center rounded-xl glass-vibrancy shadow-island border border-white/60 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] text-slate-900 hover:bg-white hover:scale-110 active:scale-95 ${isSidebarOpen ? 'left-[350px]' : 'left-10'}`}
      >
        <span className="material-symbols-outlined !text-[22px] select-none text-slate-500 hover:text-sequoia-blue transition-colors">
          {isSidebarOpen ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}
        </span>
      </button>

      {/* Sidebar - Acervo Normativo (Somente Visualização) */}
      <aside
        className={`flex flex-col glass-vibrancy transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-40 m-4 rounded-ios shadow-vibrancy border-white/70 overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0 m-0 opacity-0 pointer-events-none'}`}
      >
        <div className="p-6 flex flex-col h-full min-w-[320px]">
          <div className="mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Coleção de Arquivos</h3>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-8 pr-2">
            {userDocuments.length > 0 && (
              <section className="animate-reveal">
                <h4 className="text-[9px] font-black text-sequoia-blue mb-4 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-[1px] bg-sequoia-blue"></span>
                  Autos Locais
                </h4>
                <div className="space-y-1">
                  {userDocuments.map((doc, idx) => (
                    <button key={idx} onClick={() => setViewingFile(doc)} className="w-full flex items-center gap-3 p-3 hover:bg-white/60 rounded-ios transition-all text-left border border-transparent hover:border-black/5 group">
                      <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-sequoia-blue">article</span>
                      <div className="min-w-0">
                        <span className="block text-[11px] font-bold text-slate-900 truncate">{doc.name}</span>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">{doc.size}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-[9px] font-black text-slate-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-[1px] bg-slate-300"></span>
                Fontes Oficiais
              </h4>
              <div className="space-y-1">
                {OFFICIAL_SOURCES.map((source, idx) => (
                  <button key={idx} onClick={() => openOfficialSource(source)} className="w-full flex items-center gap-3 p-3 hover:bg-white/60 rounded-ios transition-all text-left group border border-transparent hover:border-black/5">
                    <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-sequoia-blue transition-colors">menu_book</span>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-slate-900 truncate">{source.name}</span>
                      <span className="block text-[8px] text-slate-400 font-black uppercase mt-0.5">{source.size}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="mt-6 pt-6 border-t border-black/5 text-left">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Database atualizada</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col relative min-w-0">
        <div ref={scrollRef} className="flex-grow overflow-y-auto px-6 py-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-64 w-full">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} legalArea={m.legalArea} />
            ))}
            {isLoading && (
              <div className="flex justify-start mt-8 animate-reveal">
                <div className="glass-vibrancy px-8 py-5 rounded-ios-lg flex items-center gap-5 shadow-vibrancy border-white/80">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sequoia-blue animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-sequoia-blue animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-sequoia-blue animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Processando solicitação...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Bar com Botão de Anexo Integrado */}
        <div className="absolute bottom-8 left-0 right-0 px-6 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto relative">
            {isAreaMenuOpen && (
              <div ref={dropdownRef} className="absolute bottom-full mb-4 left-0 w-72 bg-black/95 backdrop-blur-3xl rounded-ios-lg shadow-island border border-white/10 p-2 z-[60] animate-reveal">
                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] p-3 border-b border-white/5 mb-1">Especialidade</div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar no-scrollbar">
                  {LEGAL_AREAS.map((area) => (
                    <button key={area.id} onClick={() => { setSelectedArea(area.id); setIsAreaMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-ios transition-all text-left mb-1 ${selectedArea === area.id ? 'bg-white text-slate-950 shadow-lg' : 'text-white/80 hover:bg-white/10'}`}>
                      <span className={`material-symbols-outlined text-[22px] ${selectedArea === area.id ? 'text-sequoia-blue' : 'text-white/20'}`}>{area.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-900 leading-none">{area.id}</p>
                        <p className={`text-[9px] mt-1 font-bold uppercase truncate ${selectedArea === area.id ? 'text-slate-500' : 'text-white/30'}`}>{area.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-ios-lg p-1.5 shadow-island border border-white/40 flex items-end gap-2 px-3">
              {/* Botão de Especialidade */}
              <button 
                onClick={() => setIsAreaMenuOpen(!isAreaMenuOpen)} 
                className="h-12 w-12 flex items-center justify-center rounded-ios bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all shrink-0 mb-1"
                title="Trocar Especialidade Jurídica"
              >
                <span className="material-symbols-outlined text-[22px]">{currentAreaInfo.icon}</span>
              </button>

              {/* Botão de Anexo (Movido para aqui) */}
              <button 
                onClick={() => document.getElementById('file-upload')?.click()} 
                className="h-12 w-12 flex items-center justify-center rounded-ios bg-slate-50 text-slate-500 hover:text-sequoia-blue hover:bg-slate-100 transition-all shrink-0 mb-1 border border-slate-100"
                title="Anexar Documentos (.txt)"
              >
                <span className="material-symbols-outlined text-[22px]">attach_file</span>
              </button>

              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={`Apresente os fatos em ${selectedArea}...`}
                className="flex-grow bg-transparent border-none focus:ring-0 text-[15px] text-slate-950 py-3.5 px-3 resize-none min-h-[50px] max-h-48 leading-snug font-medium placeholder:text-slate-400" 
                rows={1} 
              />

              <button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading} 
                className="w-12 h-12 rounded-ios flex items-center justify-center bg-sequoia-blue text-white shadow-lg mb-1 shrink-0 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined font-bold text-[24px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-reveal">
           <div className="w-full max-w-5xl h-full bg-white rounded-ios-lg shadow-2xl flex flex-col overflow-hidden">
              <header className="h-14 bg-slate-50 border-b flex items-center justify-between px-6 shrink-0">
                 <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-900">verified</span>
                    <h2 className="text-[13px] font-900 text-slate-950">{viewingFile.name}</h2>
                 </div>
                 <button onClick={() => setViewingFile(null)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </header>
              <div className="flex-grow overflow-y-auto p-12 bg-white selection:bg-sequoia-blue/10">
                 <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-slate-900 font-medium">{viewingFile.content}</pre>
              </div>
           </div>
        </div>
      )}

      <input id="file-upload" type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} multiple />
    </div>
  );
};