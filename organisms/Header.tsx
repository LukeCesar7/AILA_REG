import React from 'react';
import { Logo } from '../atoms/Logo';

interface HeaderProps {
  isChatActive?: boolean;
  onCloseChat?: () => void;
  onClearChat?: () => void;
}
{/*Lembrar Dúvida UNIFG hero ou header*/}
export const Header: React.FC<HeaderProps> = ({ isChatActive, onCloseChat, onClearChat }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-14 flex items-center px-10 justify-between
    select-none bg-white/10 backdrop-blur-md border-b border-black/5">
      <div className="flex items-center gap-6">
        <div className="flex items-center cursor-default group gap-3">
          <Logo size="size-8 text-black"
          />Astardes
          <div className="h-7 w-[1px] bg-white/20"></div>
          <span className="font-serif italic text-3xl text-white tracking-tight"
          >Aila</span>
          <span className="font-sans font-900 text-[10px] uppercase tracking-[0.3em] text-white/45 pt-1"
          >Direito Brasileiro</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isChatActive ? (
          <div className="glass-vibrancy rounded-full px-2 py-1 flex gap-1 shadow-vibrancy border-white/60">
            <button
              onClick={onClearChat}
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-red-600
              px-4 py-1.5 rounded-full transition-all"
            >Limpar Histórico
            </button>
            <button
              onClick={onCloseChat}
              className="text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-black
              px-5 py-1.5 rounded-full transition-all shadow-lg"
            >Encerrar Sessão
            </button>
          </div>
        ) : (
          <div className="text-[15px] font-bold text-white/60 uppercase tracking-[0.2em] flex items-center
          gap-3 font-['Etna']"
          >NPJ
          </div>
        )}
      </div>
    </nav>
  );
};