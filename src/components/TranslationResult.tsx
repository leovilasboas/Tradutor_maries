import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface TranslationResultProps {
  originalText: string;
  translatedText: string;
}

export default function TranslationResult({ originalText, translatedText }: TranslationResultProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        className="flex-1 p-4 rounded-md overflow-auto border"
        style={{
          backgroundColor: 'rgba(45, 45, 45, 0.5)',
          borderColor: 'rgb(75, 75, 75)',
          color: 'white'
        }}
      >
        {translatedText}
      </div>
      
      <div className="flex justify-end items-center mt-3">
        <button
          onClick={handleCopy}
          className="text-sm flex items-center py-1 px-3 rounded-md transition-colors border"
          style={{
            backgroundColor: copied 
              ? 'rgb(22, 163, 74)' 
              : 'rgb(75, 75, 75)',
            borderColor: copied 
              ? 'rgb(21, 128, 61)' 
              : 'rgb(100, 100, 100)',
            color: 'white'
          }}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
