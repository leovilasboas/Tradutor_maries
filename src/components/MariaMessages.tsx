'use client';

import { useState } from 'react';
import Image from 'next/image';

interface MariaMessagesProps {
  onSelectMessage: (message: string) => void;
}

export default function MariaMessages({ onSelectMessage }: MariaMessagesProps) {
  const [showMessages, setShowMessages] = useState(false);
  
  const mariaMessages = [
    {
      text: "oiee amg, blz? to aki pq vc n respondeu meu zap kkkk to mto preocupads",
      emoji: "😊"
    },
    {
      text: "mds, n acredito q vc fez issu cmg, to xorand mto",
      emoji: "😭"
    },
    {
      text: "kd vc? to t esperando faz 1 hora ja, vai chega qndo?",
      emoji: "⏰"
    },
    {
      text: "amg, olha oq eu axei na net, mto top né? vo compra",
      emoji: "🛍️"
    },
    {
      text: "n sei oq faze hj, vc tem ideia? pdms i nu shopping",
      emoji: "🤔"
    },
    {
      text: "Rapaz tu ttabalha com isos ne, agora q lembrei. me ajuda pfvr",
      emoji: "🙏"
    }
  ];

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="flex items-center text-sm text-teal-300 hover:text-teal-200 transition-colors mb-2"
      >
        <span className="mr-1">{showMessages ? '✕' : '+'}</span>
        {showMessages ? 'Esconder mensagens da Maria' : 'Ver mensagens típicas da Maria'}
      </button>
      
      {showMessages && (
        <div className="bg-teal-900/50 rounded-md p-3 animate-fadeIn">
          <p className="text-sm text-teal-300 mb-2">Clique em uma mensagem para traduzi-la:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mariaMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => onSelectMessage(message.text)}
                className="text-left bg-teal-800 hover:bg-teal-700 rounded-md p-2 text-sm flex items-start transition-colors"
              >
                <span className="text-xl mr-2 mt-0.5">{message.emoji}</span>
                <span className="flex-1">{message.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
