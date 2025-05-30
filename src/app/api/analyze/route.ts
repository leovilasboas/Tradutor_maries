import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Extrair o texto da requisição
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto inválido' },
        { status: 400 }
      );
    }
    
    // Usar a chave da API do ambiente ou a chave fixa
    const token = process.env.OPENROUTER_API_KEY || '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';
    
    console.log('Using API token:', token ? 'Token found (not showing for security)' : 'No token found');
    console.log('Using OpenRouter API for analysis with DeepSeek Chat v3 model');
    
    try {
      // Configurar o cliente OpenAI para usar o OpenRouter
      const client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: token,
        defaultHeaders: {
          "HTTP-Referer": "https://tradutor-maries.vercel.app", // Site URL para rankings no openrouter.ai
          "X-Title": "Tradutor de Mariês", // Título do site para rankings no openrouter.ai
        }
      });
      
      // Criar uma solicitação de chat para o modelo
      const completion = await client.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        temperature: 0.3,
        max_tokens: 512,
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise linguística do português brasileiro. Sua tarefa é analisar textos que podem conter erros gramaticais, ortográficos e gírias. Você deve retornar apenas um objeto JSON válido, sem texto adicional."
          },
          {
            role: "user",
            content: `Analise o seguinte texto: "${text}"

Retorne um objeto JSON com exatamente estes campos (todos os campos são obrigatórios):
{
  "wordCount": número total de palavras no texto,
  "problemWordCount": número de palavras com problemas (abreviações, erros, gírias),
  "problemPercentage": porcentagem de palavras com problemas (0-100),
  "longWords": número de palavras longas (mais de 6 letras),
  "longWordsPercentage": porcentagem de palavras longas (0-100),
  "difficultyScore": pontuação de dificuldade geral (0-100),
  "mariaLevel": um destes valores exatos: "Iniciante", "Intermediário", "Avançado" ou "Maria Suprema",
  "levelDescription": breve descrição do nível de dificuldade
}

Retorne APENAS o JSON, sem explicações, comentários ou texto adicional.`
          }
        ]
      });
      
      // Extrair o JSON da resposta
      let jsonText = completion.choices[0]?.message?.content?.trim() || '';
      
      // Tentar encontrar o JSON na resposta, caso haja texto adicional
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      console.log('JSON response:', jsonText);
      
      try {
        // Tentar analisar o JSON
        const analysisData = JSON.parse(jsonText);
        
        // Garantir que todos os campos obrigatórios estão presentes
        const requiredFields = [
          'wordCount', 'problemWordCount', 'problemPercentage',
          'longWords', 'longWordsPercentage', 'difficultyScore',
          'mariaLevel', 'levelDescription'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in analysisData));
        
        if (missingFields.length > 0) {
          console.error('Campos obrigatórios ausentes:', missingFields);
          throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        }
        
        return NextResponse.json(analysisData);
      } catch (jsonError: any) {
        console.error('Erro ao analisar JSON:', jsonError);
        throw new Error(`Erro ao analisar a resposta JSON: ${jsonError.message}`);
      }
    } catch (error) {
      console.error('OpenRouter API error:', error);
      
      // Fallback: Análise simples em caso de erro na API
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      const longWords = words.filter(word => word.length > 6).length;
      const longWordsPercentage = Math.round((longWords / wordCount) * 100) || 0;
      
      // Estimativa simples de palavras problemáticas
      const problemWordCount = Math.round(wordCount * 0.4); // Estimativa de 40% de palavras problemáticas
      const problemPercentage = 40;
      
      // Cálculo simples de pontuação de dificuldade
      const difficultyScore = Math.min(100, Math.round((problemPercentage + longWordsPercentage) / 2));
      
      // Determinar o nível de Maria com base na pontuação
      let mariaLevel = "Iniciante";
      let levelDescription = "Texto com poucas abreviações e erros. Fácil de entender.";
      
      if (difficultyScore > 75) {
        mariaLevel = "Maria Suprema";
        levelDescription = "Texto extremamente difícil. Só a Maria entende!";
      } else if (difficultyScore > 50) {
        mariaLevel = "Avançado";
        levelDescription = "Muitas abreviações e erros. Desafio para traduzir.";
      } else if (difficultyScore > 25) {
        mariaLevel = "Intermediário";
        levelDescription = "Algumas abreviações e erros. Moderadamente difícil.";
      }
      
      return NextResponse.json({
        wordCount,
        problemWordCount,
        problemPercentage,
        longWords,
        longWordsPercentage,
        difficultyScore,
        mariaLevel,
        levelDescription,
        error: 'Erro na API. Usando análise simplificada.'
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
