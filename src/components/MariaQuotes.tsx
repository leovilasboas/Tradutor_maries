'use client';

import { useState, useEffect } from 'react';

export default function MariaQuotes() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const quotes = [
    "to mto feliz d t ver aki amg ❤️",
    "n acredito q vc fez issu cmg 😭",
    "qnd vc vai me responde???? to esperand",
    "mds q coisa linda, amei d+ 😍",
    "to com mta sdds d vc, vamo marca algo?",
    "kkkkkk morri com isso q vc mandou 🤣",
    "n esquece d me avisa qnd chega em ksa",
    "vc smp foi mto especial pra mim ❤️",
    "to com fome, vamo come algo?",
    "to c sono, vo dormi, flw 😴"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 500);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);
  
  return (
    <div className="bg-teal-900/30 rounded-md p-3 relative overflow-hidden">
      <div className="absolute top-1 right-2">
        <span className="text-xs text-teal-400">Mensagens da Maria</span>
      </div>
      
      <div className="h-10 flex items-center justify-center pt-3">
        <p 
          className={`text-center transition-opacity duration-500 italic text-teal-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          "{quotes[currentQuote]}"
        </p>
      </div>
      
      <div className="flex justify-center mt-2">
        {quotes.map((_, index) => (
          <span 
            key={index} 
            className={`w-1.5 h-1.5 rounded-full mx-0.5 ${currentQuote === index ? 'bg-teal-400' : 'bg-teal-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
