'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface MariaStatsProps {
  originalText: string;
}

export default function MariaStats({ originalText }: MariaStatsProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<null | {
    wordCount: number;
    problemWordCount: number;
    problemPercentage: number;
    longWords: number;
    longWordsPercentage: number;
    difficultyScore: number;
    mariaLevel: string;
    levelDescription: string;
  }>(null);

  const analyzeText = async () => {
    if (!originalText || originalText.trim() === '') return;
    
    setLoading(true);
    try {
      // Usar a chave da API do ambiente ou a chave fixa
      const token = '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';
      
      console.log('Analisando texto:', originalText);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: originalText }),
      });
      
      if (!response.ok) {
        throw new Error('Falha na análise');
      }
      
      const data = await response.json();
      if (data.error) {
        console.error('Erro na análise:', data.error);
      } else {
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!originalText) {
    return (
      <div className="rounded-md p-3 mt-3 border"
           style={{
             backgroundColor: 'rgba(45, 45, 45, 0.8)',
             borderColor: 'rgb(75, 75, 75)'
           }}>
        <div className="flex items-center justify-center h-24">
          <p className="text-sm"
             style={{ color: 'rgb(156, 163, 175)' }}>
            Aguardando texto para análise...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-md p-3 mt-3 border"
           style={{
             backgroundColor: 'rgba(45, 45, 45, 0.8)',
             borderColor: 'rgb(75, 75, 75)'
           }}>
        <div className="flex flex-col items-center justify-center h-24">
          {loading ? (
            <p className="text-sm mb-2" style={{ color: 'rgb(156, 163, 175)' }}>
              Analisando o texto com IA...
            </p>
          ) : (
            <>
              <p className="text-sm mb-2" style={{ color: 'rgb(156, 163, 175)' }}>
                Clique no botão abaixo para analisar o texto
              </p>
              <button 
                onClick={analyzeText}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                Analisar Texto
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // Determinar o nível de "Mariês" e estilo visual
  let levelColor = theme === 'dark' ? "text-yellow-300" : "text-yellow-600";
  let levelEmoji = "😊";
  
  if (analysis.difficultyScore > 25 && analysis.difficultyScore <= 50) {
    levelColor = theme === 'dark' ? "text-yellow-500" : "text-yellow-500";
    levelEmoji = "😅";
  } else if (analysis.difficultyScore > 50 && analysis.difficultyScore <= 75) {
    levelColor = theme === 'dark' ? "text-orange-300" : "text-orange-500";
    levelEmoji = "🤯";
  } else if (analysis.difficultyScore > 75) {
    levelColor = theme === 'dark' ? "text-red-300" : "text-red-500";
    levelEmoji = "🔥";
  }

  return (
    <div className="rounded-md p-3 mt-3 animate-fadeIn border" 
         style={{
           backgroundColor: 'rgba(45, 45, 45, 0.8)',
           borderColor: 'rgb(75, 75, 75)'
         }}>
      <h3 className="text-sm font-semibold mb-2 flex items-center"
          style={{ color: 'rgb(249, 115, 22)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Análise do Mariês
      </h3>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded p-2 border" 
             style={{ borderColor: 'rgb(75, 75, 75)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgb(156, 163, 175)' }}>Palavras</p>
          <p className="text-lg font-bold" style={{ color: 'white' }}>{analysis.wordCount}</p>
        </div>
        <div className="rounded p-2 border" 
             style={{ borderColor: 'rgb(75, 75, 75)' }}>
          <p className="text-xs mb-1" style={{ color: 'rgb(156, 163, 175)' }}>Palavras Problemáticas</p>
          <p className="text-lg font-bold" style={{ color: 'white' }}>{analysis.problemWordCount} ({analysis.problemPercentage}%)</p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="h-2.5 rounded-full" 
               style={{ 
                 width: `${analysis.difficultyScore}%`,
                 backgroundColor: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)'
               }}></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: 'rgb(156, 163, 175)' }}>Fácil</span>
          <span className="text-xs" style={{ color: 'rgb(156, 163, 175)' }}>Difícil</span>
        </div>
      </div>
      
      <div className="rounded p-3 border mb-2" 
           style={{ borderColor: 'rgb(75, 75, 75)' }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs mb-1" style={{ color: 'rgb(156, 163, 175)' }}>Nível de Mariês</p>
            <p className={`text-lg font-bold ${levelColor}`}>{analysis.mariaLevel}</p>
          </div>
          <div className="text-2xl">{levelEmoji}</div>
        </div>
      </div>
      
      <p className="text-xs" style={{ color: 'rgb(156, 163, 175)' }}>{analysis.levelDescription}</p>
      
      <div className="mt-3 flex justify-end">
        <button 
          onClick={analyzeText}
          className="px-3 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: theme === 'dark' ? 'rgb(55, 55, 55)' : 'rgb(234, 88, 12)',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          disabled={loading}
        >
          {loading ? 'Analisando...' : 'Analisar Novamente'}
        </button>
      </div>
    </div>
  );
}
