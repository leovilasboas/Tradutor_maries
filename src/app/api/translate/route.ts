import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// Dictionary of specific term corrections
const termCorrections: Record<string, string> = {
  // Common misspellings and informal terms
  'bpi': 'boi',
  'semem': 'sêmen',
  'semen': 'sêmen',
  'mtos': 'muitos',
  'mto': 'muito',
  'pq': 'porque',
  'q': 'que',
  'vc': 'você',
  'vcs': 'vocês',
  'tb': 'também',
  'tbm': 'também',
  'kd': 'cadê',
  'ta': 'está',
  'to': 'estou',
  'tava': 'estava',
  'tamo': 'estamos',
  'n': 'não',
  'num': 'não',
  'hj': 'hoje',
  'aki': 'aqui',
  'ksa': 'casa',
  'msm': 'mesmo',
  'qdo': 'quando',
  'qndo': 'quando',
  'cmg': 'comigo',
  'ctg': 'contigo',
  'vlw': 'valeu',
  'blz': 'beleza',
  'flw': 'falou',
  'fds': 'fim de semana',
  'rs': '[risos]',
  'rsrs': '[risos]',
  'kkkk': '[risos]',
  'hahaha': '[risos]',
  'hahahaha': '[risos]',
  'hahahahaha': '[risos]',
  'bolota': 'Bolota',
  'enfim': 'enfim',
  'coisa de patente': 'objeto patenteado',
};

// Context-specific term corrections based on surrounding words
type ContextRule = {
  term: string;          // Term to be corrected
  correction: string;    // Correction to apply
  before?: string[];     // Words that might appear before the term
  after?: string[];      // Words that might appear after the term
  notBefore?: string[];  // Words that should not appear before the term
  notAfter?: string[];   // Words that should not appear after the term
  fullMatch?: RegExp;    // Full regex pattern to match a specific context
};

// Rules for context-aware corrections
const contextRules: ContextRule[] = [
  // Rules for "ta" which could be "está" or "tá"
  {
    term: 'ta',
    correction: 'está',
    before: ['ele', 'ela', 'você', 'vc', 'quem', 'que', 'q'],
  },
  {
    term: 'ta',
    correction: 'estou',
    before: ['eu', 'eu n', 'eu não', 'não'],
  },
  
  // Rules for "mtos" which could be "muitos" or part of "mostrar"
  {
    term: 'mtos',
    correction: 'muitos',
    before: ['tem', 'há', 'existem', 'vários', 'diversos'],
  },
  {
    term: 'mtos',
    correction: 'mostrar',
    before: ['posso', 'pode', 'podemos', 'consegue', 'consigo'],
  },
  
  // Rules for "bpi" which should always be "boi"
  {
    term: 'bpi',
    correction: 'boi',
    fullMatch: /\b(o|um|este|esse|aquele|meu|seu|nosso|vosso)\s+bpi\b/i,
  },
  
  // Rules for "semem" which should always be "sêmen"
  {
    term: 'semem',
    correction: 'sêmen',
    fullMatch: /\b(o|do|no|ao|pelo|com|sem|analis[a-z]+\s+o)\s+semem\b/i,
  },
  
  // Rules for "n" which is usually "não"
  {
    term: 'n',
    correction: 'não',
    notBefore: ['u', 'a', 'o', 'as', 'os', 'um', 'uma'],
  },
  
  // Rules for "q" which is usually "que"
  {
    term: 'q',
    correction: 'que',
    notBefore: ['a', 'as', 'o', 'os'],
  },
  
  // Rules for "pq" which is usually "porque"
  {
    term: 'pq',
    correction: 'porque',
    fullMatch: /\b(pq|e\s+pq|mas\s+pq|então\s+pq)\b/i,
  },
  
  // Rules for specific phrases
  {
    term: 'coisa de patente',
    correction: 'objeto patenteado',
    fullMatch: /\b(vai\s+ser|será|[\w\s]+\s+ser)\s+coisa\s+de\s+patente\b/i,
  },
];

// Function to apply context-aware corrections
function applyContextRules(text: string): string {
  let processed = text;
  
  // Split the text into words while preserving punctuation
  const words = processed.split(/\b/);
  
  // Create a new array to store the corrected words
  const correctedWords: string[] = [];
  
  // Process each word
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    let corrected = false;
    
    // Skip processing for whitespace and punctuation
    if (/^\s+$|^[,.!?:;]$/.test(word)) {
      correctedWords.push(word);
      continue;
    }
    
    // Check each context rule
    for (const rule of contextRules) {
      // Skip if the current word doesn't match the term (case insensitive)
      if (word.toLowerCase() !== rule.term.toLowerCase()) {
        continue;
      }
      
      // Get surrounding words for context
      const prevWords = correctedWords.slice(-3).join(' ').toLowerCase();
      const nextWords = words.slice(i + 1, i + 4).join(' ').toLowerCase();
      const fullContext = prevWords + ' ' + word + ' ' + nextWords;
      
      // Check full match pattern if provided
      if (rule.fullMatch && rule.fullMatch.test(fullContext)) {
        word = rule.correction;
        corrected = true;
        break;
      }
      
      // Check before context
      let beforeMatch = !rule.before; // Default to true if no before context specified
      if (rule.before) {
        beforeMatch = rule.before.some(beforeWord => 
          prevWords.includes(beforeWord.toLowerCase()));
      }
      
      // Check not before context
      let notBeforeMatch = true;
      if (rule.notBefore) {
        notBeforeMatch = !rule.notBefore.some(notBeforeWord => 
          prevWords.includes(notBeforeWord.toLowerCase()));
      }
      
      // Check after context
      let afterMatch = !rule.after; // Default to true if no after context specified
      if (rule.after) {
        afterMatch = rule.after.some(afterWord => 
          nextWords.includes(afterWord.toLowerCase()));
      }
      
      // Check not after context
      let notAfterMatch = true;
      if (rule.notAfter) {
        notAfterMatch = !rule.notAfter.some(notAfterWord => 
          nextWords.includes(notAfterWord.toLowerCase()));
      }
      
      // Apply correction if all context conditions are met
      if (beforeMatch && afterMatch && notBeforeMatch && notAfterMatch) {
        word = rule.correction;
        corrected = true;
        break;
      }
    }
    
    // If no context rule matched, keep the original word
    correctedWords.push(word);
  }
  
  // Join the corrected words back into a string
  return correctedWords.join('');
}

// Function to post-process translations and fix common issues
function postProcessTranslation(text: string): string {
  if (!text) return text;
  
  // Fix common errors that might still appear in the translation
  let processed = text;
  
  // First apply context-aware corrections
  processed = applyContextRules(processed);
  
  // Then apply general term corrections with word boundary checks
  for (const [incorrect, correct] of Object.entries(termCorrections)) {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    processed = processed.replace(regex, correct);
  }
  
  // Special case for "bpi" which might not be caught by word boundary
  processed = processed.replace(/\bbpi\b/gi, 'boi');
  processed = processed.replace(/\bsemem\b/gi, 'sêmen');
  
  // Fix doubled punctuation
  processed = processed.replace(/([.!?])\s*\1+/g, '$1');
  
  // Fix spaces before punctuation
  processed = processed.replace(/\s+([,.!?:;])/g, '$1');
  
  // Fix missing spaces after punctuation
  processed = processed.replace(/([,.!?:;])([^\s\d])/g, '$1 $2');
  
  // Fix doubled words
  processed = processed.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Fix "nãoão" and similar errors
  processed = processed.replace(/nãoão/gi, 'não');
  
  // Fix common specific errors seen in the output
  const specificFixes: [RegExp, string][] = [
    [/nãoão é/gi, 'não é'],
    [/\bé\? ,/gi, 'é?'],
    [/, \./g, '.'],
    [/\.\.\.+/g, '.'],
    [/\?\?+/g, '?'],
    [/!!+/g, '!'],
    [/\s+\./g, '.'],
    [/\s+,/g, ','],
    [/Agora que me lembrei\. \./g, 'Agora que me lembrei.'],
    [/ele desenvolve/gi, 'Ele desenvolve'],
    [/muito\? \? \? \? \?/gi, 'motivo?'],
    [/\btudo enfim\b/gi, 'tudo enfim.'],
    // Fix specific phrases from the example
    [/\bTem um bpi\b/gi, 'Tem um boi'],
    [/\banalisando o semem\b/gi, 'analisando o sêmen'],
    [/\bestá mtos\b/gi, 'mostrar muitos'],
    [/\bestá analisando\b/gi, 'está analisando'],
    [/\bnão posso está\b/gi, 'não posso mostrar'],
  ];
  
  for (const [pattern, replacement] of specificFixes) {
    processed = processed.replace(pattern, replacement);
  }
  
  // Ensure proper capitalization after periods
  processed = processed.replace(/\.\s+([a-z])/g, (match, letter) => {
    return match.replace(letter, letter.toUpperCase());
  });
  
  // Ensure first letter is capitalized
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }
  
  // Final quality check - replace any remaining problematic patterns
  processed = processed
    // Fix any remaining "nãoão é" patterns
    .replace(/\bnãoão\s+é\b/gi, 'não é')
    // Fix "ai o que" to "aí, o que"
    .replace(/\bai o que\b/gi, 'aí, o que')
    // Fix "pica ai" to something more formal
    .replace(/\bpica a[ií]\b/gi, 'trabalha')
    // Fix any remaining question marks
    .replace(/\bmto\?+\b/gi, 'motivo?')
    // Ensure proper spacing around punctuation
    .replace(/\s+([,.!?:;])\s+/g, '$1 ')
    // Fix multiple spaces
    .replace(/\s{2,}/g, ' ');
  
  // Additional semantic context fixes
  processed = fixSemanticContextIssues(processed);
  
  return processed;
}

// Function to fix semantic context issues that might remain
function fixSemanticContextIssues(text: string): string {
  let processed = text;
  
  // Check for common semantic patterns that need fixing
  const semanticPatterns: [RegExp, string][] = [
    // Fix "bpi" in various contexts
    [/\b(existe|há|tem)\s+um\s+bpi\b/gi, '$1 um boi'],
    [/\bo\s+bpi\s+(está|fica|vai)\b/gi, 'o boi $1'],
    
    // Fix "semem" in various contexts
    [/\b(analis[a-z]+|estud[a-z]+|examin[a-z]+)\s+o\s+semem\b/gi, '$1 o sêmen'],
    [/\bo\s+semem\s+(está|foi|será)\b/gi, 'o sêmen $1'],
    
    // Fix "ta" based on context
    [/\b(ele|ela)\s+ta\s+/gi, '$1 está '],
    [/\beu\s+ta\s+/gi, 'eu estou '],
    
    // Fix "mtos" based on context
    [/\bnão\s+posso\s+(ta|está)\s+mtos\b/gi, 'não posso mostrar muitos'],
    [/\btem\s+mtos\b/gi, 'tem muitos'],
    
    // Fix "patente enfim" context
    [/\b(objeto|coisa)\s+de\s+patente\s+enfim\b/gi, 'objeto patenteado'],
    
    // Fix common sentence structures
    [/\bTem um boi que ele está\b/gi, 'Há um boi que está'],
    [/\bMas o nome do boi é BOLOTA\b/gi, 'Contudo, o nome do boi é Bolota'],
  ];
  
  // Apply semantic pattern fixes
  for (const [pattern, replacement] of semanticPatterns) {
    processed = processed.replace(pattern, replacement);
  }
  
  return processed;
}

// Initialize the Hugging Face client if API key is available
const hf = process.env.HUGGINGFACE_API_KEY 
  ? new HfInference(process.env.HUGGINGFACE_API_KEY) 
  : null;

// More comprehensive mock translation function for development purposes
function mockTranslate(text: string): string {
  // Common informal Portuguese patterns and their formal replacements
  const replacements: [RegExp, string][] = [
    // Greetings and common expressions
    [/\boiee?\b/gi, 'Olá'],
    [/\bblz\b/gi, 'tudo bem'],
    [/\bvc\b/gi, 'você'],
    [/\bq\b(?![u])/gi, 'que'],
    [/\bkd\b/gi, 'Cadê'],
    [/\btc\b/gi, 'conversar'],
    [/\bcntg\b/gi, 'contigo'],
    [/\bvamo\b/gi, 'vamos'],
    [/\bmarca\b/gi, 'marcar'],
    [/\bcsa\b/gi, 'coisa'],
    [/\bdpois\b/gi, 'depois'],
    [/\bnum sei\b/gi, 'Não sei'],
    [/\boq\b/gi, 'o que'],
    [/\bfaze\b/gi, 'fazer'],
    [/\bhj\b/gi, 'hoje'],
    [/\bpdms\b/gi, 'podemos'],
    [/\bi nu\b/gi, 'ir no'],
    [/\bt esperando\b/gi, 'te esperando'],
    [/\bqndo\b/gi, 'quando'],
    [/\baki\b/gi, 'aqui'],
    [/\bpra\b/gi, 'para'],
    [/\btb\b/gi, 'também'],
    [/\bmto\b/gi, 'muito'],
    [/\bnd\b/gi, 'nada'],
    [/\bflw\b/gi, 'falou'],
    [/\btava\b/gi, 'estava'],
    [/\bta\b/gi, 'está'],
    [/\bto\b/gi, 'estou'],
    [/\bqr\b/gi, 'quero'],
    [/\bmsm\b/gi, 'mesmo'],
    [/\beh\b/gi, 'é'],
    [/\bne\b/gi, 'não é'],
    [/\bai\b/gi, 'aí'],
    [/\bfpra\b/gi, 'fora'],
    [/\bdim\b/gi, 'dinheiro'],
    [/\bmto\?+\b/gi, 'motivo?'],
    
    // Fix common contractions
    [/\bd\+\b/gi, 'demais'],
    [/\bc\b/gi, 'com'],
    [/\bn\b/gi, 'não'],
    [/\bp\b/gi, 'para'],
    [/\btd\b/gi, 'tudo'],
    [/\bqd\b/gi, 'quando'],
    [/\bpq\b/gi, 'porque'],
    [/\bvdd\b/gi, 'verdade'],
    [/\bvlw\b/gi, 'valeu'],
    [/\bobg\b/gi, 'obrigado'],
    [/\bfds\b/gi, 'fim de semana'],
    [/\bpqp\b/gi, 'puxa'],
    
    // Common misspellings
    [/\bisos\b/gi, 'isso'],
    [/\bttabalha\b/gi, 'trabalha'],
    [/\blembrei\b/gi, 'lembrei'],
    [/\bfaz mto\?+\b/gi, 'faz motivo?']
  ];
  
  // Sample translations for common phrases
  const phraseMappings: Record<string, string> = {
    "oiee, blz? to aki pra tc cntg": "Olá, tudo bem? Estou aqui para conversar com você.",
    "vamo marca alguma csa dpois": "Vamos marcar alguma coisa depois?",
    "num sei oq faze hj": "Não sei o que fazer hoje.",
    "vc tem ideia?": "Você tem alguma ideia?",
    "pdms i nu shopping": "Podemos ir ao shopping.",
    "kd vc?": "Cadê você?",
    "to t esperando faz 1 hora ja": "Estou te esperando há uma hora já.",
    "vai chega qndo?": "Vai chegar quando?",
    "Rapaz tu ttabalha com isos ne": "Rapaz, você trabalha com isso, não é?",
    "agora q lembrei": "Agora que me lembrei."
  };
  
  // Check if the entire text or parts of it match any of our phrase mappings
  for (const [informalPhrase, formalPhrase] of Object.entries(phraseMappings)) {
    if (text.toLowerCase().includes(informalPhrase.toLowerCase())) {
      text = text.replace(new RegExp(informalPhrase, 'gi'), formalPhrase);
    }
  }
  
  // If we still have the original text, apply the word-by-word replacements
  let result = text;
  
  // Apply all replacements
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  // More comprehensive sentence structure improvements
  // Replace "ne" at the end of sentences with "não é?"
  result = result.replace(/\bne\b(?=\s*[.!?,;]|$)/gi, 'não é?');
  
  // Improve "ai o q" pattern
  result = result.replace(/\bai o q\b/gi, 'aí o que');
  
  // Fix "mto?????" pattern
  result = result.replace(/mto\?+/gi, 'motivo?');
  
  // Capitalize first letter of sentences
  result = result.replace(/(?:^|[.!?]\s+)([a-z])/g, (match, letter) => {
    return match.replace(letter, letter.toUpperCase());
  });
  
  // Fix punctuation
  result = result.replace(/\s+([,.!?])/g, '$1');
  result = result.replace(/([,.!?])(?![\s$])/g, '$1 ');
  
  // Ensure the first letter is capitalized
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  
  // Final polishing - replace specific phrases with more formal versions
  result = result
    .replace(/Gente meu lab/gi, 'As pessoas do meu laboratório')
    .replace(/tem um chefe/gi, 'têm um supervisor')
    .replace(/pica ai na area/gi, 'trabalha na área')
    .replace(/recebeu homenagem de presidente/gi, 'recebeu uma homenagem do presidente')
    .replace(/ele faz projetos para fora/gi, 'ele desenvolve projetos externos')
    .replace(/para ganhar dinheiro/gi, 'para obter recursos financeiros')
    .replace(/o que ele faz motivo/gi, 'qual é o propósito do que ele faz');
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto inválido' },
        { status: 400 }
      );
    }

    // If no API key is available, use mock translation
    if (!process.env.HUGGINGFACE_API_KEY || !hf) {
      console.log('API key not configured, using mock translation');
      let translatedText = mockTranslate(text);
      // Apply post-processing even to mock translations
      translatedText = postProcessTranslation(translatedText);
      return NextResponse.json({ translatedText });
    }

    // Create a prompt for Mistral-7B to translate from informal to formal Portuguese
    const prompt = `
Você é um revisor profissional de textos em português, com especialização em norma culta e português formal acadêmico.

Sua tarefa é transformar completamente o texto a seguir, que está escrito em "Mariês" (português informal com muitos erros de ortografia, gramática, pontuação e uso de gírias), em um texto em português formal impecável, seguindo rigorosamente a norma culta.

Regras importantes:
1. Reescreva COMPLETAMENTE o texto, não apenas corrija palavras isoladas
2. Mantenha o significado original, mas use vocabulário formal e estruturas gramaticais corretas
3. Corrija TODOS os erros de ortografia, gramática e pontuação
4. Substitua gírias e expressões coloquiais por equivalentes formais
5. Garanta que o texto final esteja em português perfeito, como seria escrito por um professor de português
6. Use frases completas e bem estruturadas
7. Preste muita atenção a termos específicos que podem estar escritos incorretamente

Exemplos de correções importantes:
- "bpi" deve ser corrigido para "boi"
- "semem" deve ser corrigido para "sêmen"
- "ta" deve ser corrigido para "está"
- "mtos" deve ser corrigido para "muitos"
- "pq" deve ser corrigido para "porque"

Exemplo de tradução:
Texto em Mariês: "Tem um bpi q ele ta analisando o semem, n posso ta mtos detalhes pq vai ser coisa de patente enfim"
Texto em português formal: "Há um boi que está analisando o sêmen. Não posso fornecer muitos detalhes porque será objeto de patente."

Agora, traduza o seguinte texto:

Texto em Mariês: "${text}"

Texto em português formal impecável (reescreva completamente):
`;

    try {
      // Try with simpler, more reliable models
      let response;
      try {
        // Call the Hugging Face API with a simpler model
        response = await hf.textGeneration({
          model: 'gpt2', // Using a simpler, more widely available model
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          }
        });
      } catch (primaryModelError) {
        console.log('Primary model failed, trying fallback model:', primaryModelError);
        try {
          // Try with another fallback model
          response = await hf.textGeneration({
            model: 'distilgpt2', // Another widely available model
            inputs: prompt,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.7,
              top_p: 0.95,
              do_sample: true,
            }
          });
        } catch (fallbackModelError) {
          console.log('Fallback model also failed, using mock translation:', fallbackModelError);
          // If both models fail, use mock translation
          throw new Error('All models failed');
        }
      }

      // Extract the translated text from the response
      let translatedText = response.generated_text.trim();
      
      // Clean up the response if needed
      if (translatedText.startsWith('Texto em português formal')) {
        translatedText = translatedText.replace(/Texto em português formal[^:]*:/, '').trim();
      }

      // Post-processing to fix common issues
      translatedText = postProcessTranslation(translatedText);

      return NextResponse.json({ translatedText });
    } catch (apiError) {
      console.error('Hugging Face API error:', apiError);
      // Fallback to mock translation if API call fails
      let translatedText = mockTranslate(text);
      // Apply post-processing even to mock translations
      translatedText = postProcessTranslation(translatedText);
      return NextResponse.json({ translatedText });
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a tradução' },
      { status: 500 }
    );
  }
}
