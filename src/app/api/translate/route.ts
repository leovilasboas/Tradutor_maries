import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Função para processar o texto traduzido
function postProcessTranslation(text: string): string {
  // Remover espaços extras e normalizar pontuação
  let processed = text.trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,.!?;:])(?!\s|$)/g, '$1 ');
  
  // Garantir que a primeira letra seja maiúscula
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }
  
  // Garantir que o texto termine com pontuação
  if (!/[.!?]$/.test(processed)) {
    processed += '.';
  }
  
  return processed;
}

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
    
    // Usar a chave fixa da API
    const token = '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';
    
    // Configurar o cliente OpenAI para usar o OpenRouter
    const openai = new OpenAI({
      apiKey: token,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        "HTTP-Referer": "https://tradutor-maries.vercel.app", // Site URL para rankings no openrouter.ai
        "X-Title": "Tradutor de Mariês", // Título do site para rankings no openrouter.ai
      },
    });

    try {
      console.log('Using OpenRouter API for translation with DeepSeek Chat v3 model');
      
      // Criar uma solicitação de chat para o modelo
      const response = await openai.chat.completions.create({
        model: 'deepseek/deepseek-chat-v3-0324:free', // Modelo DeepSeek Chat v3 disponível gratuitamente no OpenRouter
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em português brasileiro formal. Sua tarefa é corrigir textos que contém erros gramaticais, ortográficos e gírias, reescrevendo-os em português formal perfeito. Retorne APENAS o texto corrigido, sem explicações, comentários ou informações adicionais.'
          },
          {
            role: 'user',
            content: `Corrija e reescreva o seguinte texto em português formal perfeito, mantendo o significado original. Retorne APENAS o texto corrigido, sem explicações ou comentários:\n\n"${text}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 512,
      });
      
      // Verificar se há resposta válida
      if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
        throw new Error('Resposta vazia do modelo');
      }

      // Extrair o texto traduzido da resposta
      let translatedText = response.choices[0].message.content.trim();
      
      // Processar o texto traduzido
      translatedText = postProcessTranslation(translatedText);

      return NextResponse.json({ translatedText });
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Erro ao traduzir o texto. Verifique se o token da API é válido.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
