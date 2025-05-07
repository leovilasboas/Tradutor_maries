'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!originalText) return;
    
    const analyzeText = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: originalText }),
        });
        
        if (!response.ok) {
          throw new Error('Falha na análise');
        }
        
        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Erro na análise:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeText();
  }, [originalText]);
  
  if (!originalText || !analysis) {
    return (
      <div className="rounded-md p-3 mt-3 animate-pulse border"
           style={{
             backgroundColor: 'rgba(45, 45, 45, 0.8)',
             borderColor: 'rgb(75, 75, 75)'
           }}>
        <div className="flex items-center justify-center h-24">
          <p className="text-sm"
             style={{ color: 'rgb(156, 163, 175)' }}>
            {loading ? 'Analisando o texto com IA...' : 'Aguardando texto para análise...'}
          </p>
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
             style={{
               backgroundColor: 'rgba(55, 55, 55, 0.7)',
               borderColor: 'rgb(85, 85, 85)'
             }}>
          <p className="text-xs" 
             style={{ color: 'rgb(200, 200, 200)' }}>
            Total de Palavras
          </p>
          <p className="text-lg font-semibold"
             style={{ color: 'white' }}>
            {analysis.wordCount}
          </p>
        </div>
        
        <div className="rounded p-2 border"
             style={{
               backgroundColor: 'rgba(55, 55, 55, 0.7)',
               borderColor: 'rgb(85, 85, 85)'
             }}>
          <p className="text-xs"
             style={{ color: 'rgb(200, 200, 200)' }}>
            Palavras Problemáticas
          </p>
          <p className="text-lg font-semibold"
             style={{ color: 'white' }}>
            {analysis.problemWordCount} 
            <span className="text-xs"
                  style={{ color: 'rgb(200, 200, 200)' }}>
              ({analysis.problemPercentage}%)
            </span>
          </p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="flex items-center"
                style={{ color: 'rgb(200, 200, 200)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Nível de Dificuldade
          </span>
          <span className="font-semibold"
                style={{ color: 'rgb(249, 115, 22)' }}>
            {analysis.difficultyScore}%
          </span>
        </div>
        <div className="w-full rounded-full h-2.5 overflow-hidden border"
             style={{
               backgroundColor: 'rgba(35, 35, 35, 0.5)',
               borderColor: 'rgb(65, 65, 65)'
             }}>
          <div 
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ 
              width: `${analysis.difficultyScore}%`,
              backgroundColor: 
                analysis.difficultyScore <= 25 ? 'rgb(253, 224, 71)' :
                analysis.difficultyScore <= 50 ? 'rgb(234, 179, 8)' :
                analysis.difficultyScore <= 75 ? 'rgb(249, 115, 22)' : 
                                        'rgb(248, 113, 113)'
            }}
          ></div>
        </div>
      </div>
      
      <div className="rounded-md p-2 mb-2 border"
           style={{
             backgroundColor: 'rgba(55, 55, 55, 0.5)',
             borderColor: 'rgb(85, 85, 85)'
           }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold flex items-center">
            <span className="mr-2 text-xl">{levelEmoji}</span>
            <span className={`${levelColor}`}>{analysis.mariaLevel}</span>
          </p>
          <span className="text-xs px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'rgba(35, 35, 35, 0.7)',
                  borderColor: 'rgb(65, 65, 65)',
                  color: 'rgb(249, 115, 22)'
                }}>
            {analysis.difficultyScore}/100
          </span>
        </div>
        <p className="text-xs"
           style={{ color: 'rgb(200, 200, 200)' }}>
          {analysis.levelDescription}
        </p>
      </div>
      
      <div className="text-xs italic"
           style={{ color: 'rgba(200, 200, 200, 0.7)' }}>
        Baseado em {analysis.problemWordCount} palavras problemáticas e {analysis.longWords} palavras complexas.
      </div>
    </div>
  );
}
