import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface TranslatorFormProps {
  onTranslate: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
}

export default function TranslatorForm({ onTranslate, isLoading, initialText = '' }: TranslatorFormProps) {
  const [text, setText] = useState(initialText);
  const { theme } = useTheme();
  
  // Atualizar o texto quando initialText mudar
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTranslate(text);
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>

        <textarea
          id="text-input"
          className="w-full p-4 rounded-md focus:outline-none focus:ring-2 min-h-[180px]"
          style={{
            backgroundColor: 'rgba(45, 45, 45, 0.5)',
            borderColor: 'rgb(75, 75, 75)',
            color: 'white',
            borderWidth: '1px',
            borderStyle: 'solid',
            caretColor: 'rgb(249, 115, 22)',
            boxShadow: 'none',
            outlineColor: 'rgb(249, 115, 22)',
          }}
          placeholder="Digite aqui o texto em Mariês..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />

        <div className="mt-4 flex space-x-3">
          <button
            type="submit"
            className="py-2 px-6 rounded-md transition-colors flex-1 flex items-center justify-center border"
            style={{
              backgroundColor: theme === 'dark' ? 'rgb(249, 115, 22)' : 'rgb(234, 88, 12)',
              borderColor: theme === 'dark' ? 'rgb(251, 146, 60)' : 'rgb(249, 115, 22)',
              color: 'white',
              opacity: isLoading || !text.trim() ? 0.7 : 1,
            }}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Traduzindo...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>Traduzir</span>
              </>
            )}
          </button>
          <button
            type="button"
            className="py-2 px-4 rounded-md transition-colors border"
            style={{
              backgroundColor: theme === 'dark' ? 'rgb(55, 65, 81)' : 'rgba(249, 115, 22, 0.2)',
              borderColor: theme === 'dark' ? 'rgb(75, 85, 99)' : 'rgb(234, 88, 12)',
              color: theme === 'dark' ? 'white' : 'rgb(234, 88, 12)',
              opacity: isLoading || !text.trim() ? 0.7 : 1,
            }}
            onClick={handleClear}
            disabled={isLoading || !text.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}
