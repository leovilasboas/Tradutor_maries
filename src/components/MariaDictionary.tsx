'use client';

import { useState } from 'react';

export default function MariaDictionary() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const mariaDictionary = [
    { term: 'vc', meaning: 'você' },
    { term: 'pq', meaning: 'porque' },
    { term: 'q', meaning: 'que' },
    { term: 'n', meaning: 'não' },
    { term: 'tb', meaning: 'também' },
    { term: 'tbm', meaning: 'também' },
    { term: 'hj', meaning: 'hoje' },
    { term: 'kd', meaning: 'cadê' },
    { term: 'cmg', meaning: 'comigo' },
    { term: 'ctg', meaning: 'contigo' },
    { term: 'blz', meaning: 'beleza' },
    { term: 'vlw', meaning: 'valeu' },
    { term: 'flw', meaning: 'falou' },
    { term: 'mto', meaning: 'muito' },
    { term: 'mt', meaning: 'muito' },
    { term: 'pra', meaning: 'para' },
    { term: 'qnd', meaning: 'quando' },
    { term: 'qdo', meaning: 'quando' },
    { term: 'msm', meaning: 'mesmo' },
    { term: 'oq', meaning: 'o que' },
    { term: 'pfvr', meaning: 'por favor' },
    { term: 'fds', meaning: 'fim de semana' },
    { term: 'rs', meaning: 'risos' },
    { term: 'kkkk', meaning: 'risos' },
    { term: 'amg', meaning: 'amigo(a)' },
    { term: 'mds', meaning: 'meu Deus' },
    { term: 'sdds', meaning: 'saudades' },
    { term: 'qsr', meaning: 'qualquer' },
    { term: 'ngm', meaning: 'ninguém' },
    { term: 'td', meaning: 'tudo' },
    { term: 'ctz', meaning: 'certeza' },
    { term: 'vdd', meaning: 'verdade' },
    { term: 'pdms', meaning: 'podemos' },
    { term: 'aki', meaning: 'aqui' },
    { term: 'axei', meaning: 'achei' },
    { term: 'xorand', meaning: 'chorando' },
    { term: 'issu', meaning: 'isso' },
    { term: 'ttabalha', meaning: 'trabalha' },
    { term: 'isos', meaning: 'isso' },
  ];
  
  const filteredTerms = searchTerm 
    ? mariaDictionary.filter(item => 
        item.term.includes(searchTerm.toLowerCase()) || 
        item.meaning.includes(searchTerm.toLowerCase())
      )
    : mariaDictionary;

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm bg-teal-600 hover:bg-teal-500 text-white py-1 px-3 rounded-md transition-colors"
      >
        <span className="mr-1">📚</span>
        {isOpen ? 'Fechar Dicionário de Mariês' : 'Abrir Dicionário de Mariês'}
      </button>
      
      {isOpen && (
        <div className="mt-2 bg-teal-800 rounded-md p-4 animate-fadeIn shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-teal-300">Dicionário de Mariês</h3>
          
          <div className="mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar termo..."
              className="w-full p-2 bg-teal-700/50 border border-teal-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-white placeholder-teal-400"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredTerms.map((item, index) => (
                <div key={index} className="bg-teal-700/30 rounded p-2 flex flex-col">
                  <span className="text-teal-300 font-bold">{item.term}</span>
                  <span className="text-white text-sm">{item.meaning}</span>
                </div>
              ))}
            </div>
            
            {filteredTerms.length === 0 && (
              <p className="text-center text-teal-400 py-4">Nenhum termo encontrado</p>
            )}
          </div>
          
          <p className="mt-3 text-xs text-teal-400 italic">
            Este dicionário contém termos comuns usados pela Maria. Use-o para entender melhor as mensagens dela!
          </p>
        </div>
      )}
    </div>
  );
}
