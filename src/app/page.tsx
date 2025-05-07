'use client';

import { useState } from 'react';
import Image from 'next/image';
import TranslatorForm from '@/components/TranslatorForm';
import TranslationResult from '@/components/TranslationResult';
import MariaStats from '@/components/MariaStats';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return;
    
    setOriginalText(text);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Erro na tradução. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-2 px-4" style={{ backgroundColor: theme === 'dark' ? 'rgb(20, 20, 20)' : 'white' }}>
      {/* Layout com imagem na lateral */}
      <div className="w-full max-w-full mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between px-4 lg:px-8">
        {/* Coluna da imagem - lado esquerdo em telas maiores */}
        <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] mb-8 lg:mb-0 lg:sticky lg:top-20 lg:ml-0 xl:ml-4 2xl:ml-12">
          <div className="relative rounded-full border-4 shadow-2xl" 
               style={{ 
                 borderColor: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
                 backgroundColor: theme === 'dark' ? 'rgb(35, 35, 35)' : 'rgb(243, 244, 246)'
               }}>
            <Image 
              src="/images/cida.jpeg" 
              alt="Maria - Rainha do Mariês" 
              width={450} 
              height={450} 
              className="rounded-full"
              priority
            />
          </div>
          <div className="absolute top-0 right-0 px-3 py-2 text-sm font-bold shadow-md transform rotate-12 border rounded-full"
               style={{ 
                 backgroundColor: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
                 color: 'white',
                 borderColor: theme === 'dark' ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)'
               }}>
            Rainha do Mariês
          </div>
          <div className="text-center mt-6 text-sm"
               style={{ color: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(254, 215, 170)' }}>
            <p>Desenvolvido com 💖 para os amigos da Maria.</p>
          </div>
        </div>
        
        {/* Coluna do conteúdo - centralizada */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0 lg:ml-12 xl:ml-16 2xl:ml-24 lg:mr-8 xl:mr-16 2xl:mr-32">
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4" 
                style={{ color: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)' }}>
              Tradutor de Mariês
            </h1>
            <p className="text-xl" style={{ color: theme === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(254, 215, 170)' }}>
              Vamos te ajudar a entender o que a Maria está falando.
            </p>
          </div>
          
          {/* Área de tradução */}
          <div className="rounded-lg p-6 shadow-lg border mb-8" 
               style={{ 
                 backgroundColor: theme === 'dark' ? 'rgb(35, 35, 35)' : 'rgba(249, 115, 22, 0.08)',
                 borderColor: theme === 'dark' ? 'rgb(55, 55, 55)' : 'rgb(234, 88, 12)'
               }}>
            <TranslatorForm onTranslate={handleTranslate} isLoading={isLoading} />
            
            {originalText && (
              <div className="mt-6">
                <TranslationResult originalText={originalText} translatedText={translatedText} />
                <MariaStats originalText={originalText} />
              </div>
            )}
          </div>
          
          {/* Footer */}
          <footer className="text-center text-sm mt-8" 
                  style={{ color: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(254, 215, 170)' }}>
            <p>© {new Date().getFullYear()} Tradutor de Mariês</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
