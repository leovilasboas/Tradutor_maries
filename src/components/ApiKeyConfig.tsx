'use client';

import { useState, useEffect } from 'react';

export default function ApiKeyConfig() {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Carregar a API key do localStorage, se existir
    const savedKey = localStorage.getItem('huggingface_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('huggingface_api_key', apiKey);
      setIsSaved(true);
      
      // Opcional: enviar a chave para o backend
      fetch('/api/set-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      }).catch(error => {
        console.error('Erro ao salvar a chave de API:', error);
      });
    }
  };

  return (
    <div>
      <p className="text-sm mb-2">
        Para usar a tradução com IA, insira sua chave de API do Hugging Face.
        <a 
          href="https://huggingface.co/settings/tokens" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-1 text-teal-300 hover:underline"
        >
          Obter uma chave gratuita
        </a>
      </p>
      <div className="flex">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setIsSaved(false);
          }}
          placeholder="••••••••••••••••••••••••••••••••"
          className="flex-1 bg-teal-900 border border-teal-600 rounded-l-md p-2 text-white placeholder-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          onClick={handleSaveKey}
          className={`px-4 py-2 rounded-r-md transition-colors ${
            isSaved 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-teal-500 hover:bg-teal-600'
          }`}
        >
          {isSaved ? 'Salvo' : 'Salvar Chave'}
        </button>
      </div>
    </div>
  );
}
