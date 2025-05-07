import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face client if API key is available
const hf = process.env.HUGGINGFACE_API_KEY 
  ? new HfInference(process.env.HUGGINGFACE_API_KEY) 
  : null;

// Mock analysis function for development or when API key is not available
function mockAnalyze(text: string) {
  // Count words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Simple patterns to detect informal language
  const abbreviationPatterns = [
    /\b(vc|vcs|pq|q|n|tb|hj|kd|cmg|ctg|blz|vlw|flw|mto|mt|pra|qnd|qdo|msm|tbm|oq|pfvr|fds|rs)\b/i,
    /\b\w*[k]\w*\b/i,
    /\b[bcdfghjklmnpqrstvwxz]{3,}\b/i,
  ];
  
  // Count problematic words
  const problemWords = words.filter(word => 
    abbreviationPatterns.some(pattern => pattern.test(word))
  );
  const problemWordCount = problemWords.length;
  
  // Calculate percentages
  const problemPercentage = Math.min(100, Math.round((problemWordCount / wordCount) * 100)) || 0;
  
  // Analyze complexity
  const longWords = words.filter(word => word.length > 6).length;
  const longWordsPercentage = Math.min(100, Math.round((longWords / wordCount) * 100)) || 0;
  
  // Calculate difficulty score
  const difficultyScore = Math.min(100, Math.round(problemPercentage * 0.7 + longWordsPercentage * 0.3)) || 0;
  
  // Determine Mariês level
  let mariaLevel = "Iniciante";
  let levelDescription = "Poucas abreviações e erros. Fácil de entender.";
  
  if (difficultyScore > 25 && difficultyScore <= 50) {
    mariaLevel = "Intermediário";
    levelDescription = "Algumas abreviações e erros. Moderadamente difícil.";
  } else if (difficultyScore > 50 && difficultyScore <= 75) {
    mariaLevel = "Avançado";
    levelDescription = "Muitas abreviações e erros. Desafio para traduzir.";
  } else if (difficultyScore > 75) {
    mariaLevel = "Maria Suprema";
    levelDescription = "Texto extremamente difícil. Só a Maria entende!";
  }
  
  return {
    wordCount,
    problemWordCount,
    problemPercentage,
    longWords,
    longWordsPercentage,
    difficultyScore,
    mariaLevel,
    levelDescription
  };
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

    // If no API key is available, use mock analysis
    if (!process.env.HUGGINGFACE_API_KEY || !hf) {
      console.log('API key not configured, using mock analysis');
      const analysis = mockAnalyze(text);
      return NextResponse.json(analysis);
    }

    // Create a prompt for AI to analyze the Mariês text
    const prompt = `
Você é um especialista em análise linguística do português brasileiro, com foco em linguagem informal e gírias.

Sua tarefa é analisar o texto a seguir, que está escrito em "Mariês" (português informal com muitos erros de ortografia, gramática, pontuação e uso de gírias), e fornecer uma análise detalhada.

Texto para análise: "${text}"

Por favor, forneça uma análise estruturada no seguinte formato JSON:
{
  "wordCount": número total de palavras no texto,
  "problemWordCount": número de palavras com problemas (abreviações, erros, gírias),
  "problemPercentage": porcentagem de palavras com problemas (0-100),
  "longWords": número de palavras longas (mais de 6 letras),
  "longWordsPercentage": porcentagem de palavras longas (0-100),
  "difficultyScore": pontuação de dificuldade geral (0-100),
  "mariaLevel": nível de "Mariês" ("Iniciante", "Intermediário", "Avançado" ou "Maria Suprema"),
  "levelDescription": breve descrição do nível de dificuldade
}

Regras para determinar o nível de "Mariês":
- "Iniciante" (0-25 pontos): Poucas abreviações e erros. Fácil de entender.
- "Intermediário" (26-50 pontos): Algumas abreviações e erros. Moderadamente difícil.
- "Avançado" (51-75 pontos): Muitas abreviações e erros. Desafio para traduzir.
- "Maria Suprema" (76-100 pontos): Texto extremamente difícil. Só a Maria entende!

Forneça apenas o JSON como resposta, sem texto adicional.
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
            temperature: 0.3,
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
              temperature: 0.3,
              top_p: 0.95,
              do_sample: true,
            }
          });
        } catch (fallbackModelError) {
          console.log('Fallback model also failed, using mock analysis:', fallbackModelError);
          // If both models fail, use mock analysis
          throw new Error('All models failed');
        }
      }

      // Extract the JSON from the response
      let analysisText = response.generated_text.trim();
      
      // Try to extract just the JSON part
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisText = jsonMatch[0];
      }
      
      try {
        // Parse the JSON
        const analysis = JSON.parse(analysisText);
        return NextResponse.json(analysis);
      } catch (jsonError) {
        console.error('Error parsing JSON from AI response:', jsonError);
        // Fallback to mock analysis if JSON parsing fails
        const analysis = mockAnalyze(text);
        return NextResponse.json(analysis);
      }
    } catch (apiError) {
      console.error('Hugging Face API error:', apiError);
      // Fallback to mock analysis if API call fails
      const analysis = mockAnalyze(text);
      return NextResponse.json(analysis);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a análise' },
      { status: 500 }
    );
  }
}
