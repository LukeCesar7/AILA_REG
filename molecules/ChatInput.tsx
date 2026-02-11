
import React from 'react';

// Este componente foi simplificado e sua lógica de estilo movida para a interface principal
// para manter o alinhamento visual com as janelas do sistema clássico.

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onFileUpload: (files: FileList) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, onFileUpload, isLoading }) => {
  return null; // A renderização está agora interna na ChatInterface.tsx
};
