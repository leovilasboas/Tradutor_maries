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
    
    // Usar a chave da API do ambiente ou a chave fixa
    const token = process.env.OPENROUTER_API_KEY || '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';
    
    console.log('Using API token:', token ? 'Token found (not showing for security)' : 'No token found');
    
    console.log('Using OpenRouter API for translation with DeepSeek Chat v3 model');
    
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
        messages: [
          {
            role: "system",
            content: "Você é um especialista em português brasileiro. Sua tarefa é corrigir textos que contém erros gramaticais e ortográficos, mas mantendo o tom e estilo do texto original. Não torne o texto muito formal - apenas corrija o que for necessário para que seja compreensível, mantendo a naturalidade e o jeito de falar da pessoa. Retorne APENAS o texto corrigido, sem explicações, comentários ou informações adicionais."
          },
          {
            role: "user",
            content: `Corrija e reescreva o seguinte texto em português formal perfeito, mantendo o significado original. Retorne APENAS o texto corrigido, sem explicações ou comentários:\n\n"${text}"`
          }
        ]
      });
      
      // Extrair o texto traduzido da resposta
      const translatedText = completion.choices[0]?.message?.content?.trim() || '';
      
      // Processar o texto traduzido para garantir a formatação correta
      const processedText = postProcessTranslation(translatedText);

      // Retornar o texto traduzido
      return NextResponse.json({ translatedText: processedText });
      
    } catch (error: any) {
      console.error('OpenRouter API error:', error);
      
      return NextResponse.json(
        { error: `Erro ao traduzir o texto: ${error.message || 'Erro desconhecido'}` },
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
