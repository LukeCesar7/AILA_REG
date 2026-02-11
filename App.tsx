import React, { useState, useEffect } from 'react';
import { Header } from './organisms/Header';
import { Hero } from './organisms/Hero';
import { Features } from './organisms/Features';
import { CTA } from './organisms/CTA';
import { Footer } from './organisms/Footer';
import { ChatInterface } from './organisms/ChatInterface';
import { indexAILAKnowledge } from './services/indexKnowledge';


const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  // ✅ INDEXAÇÃO RAG (RODA 1 VEZ)
  useEffect(() => {
    indexAILAKnowledge();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowChat(false);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClearHistory = () => {
    setClearTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isChatActive={showChat}
        onCloseChat={() => setShowChat(false)}
        onClearChat={handleClearHistory}
      />

      {!showChat ? (
        <main className="flex-grow">
          <Hero onStartChat={() => setShowChat(true)} />
          <Features />
          <CTA />
        </main>
      ) : (
        <ChatInterface clearTrigger={clearTrigger} />
      )}

      {!showChat && <Footer />}
    </div>
  );
};


export default App;