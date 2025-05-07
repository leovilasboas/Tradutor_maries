# Tradutor de Mariês

Este é um aplicativo web que traduz português informal e digitado incorretamente ("Mariês") para português formal e correto. O aplicativo utiliza o modelo Mistral-7B da Hugging Face para realizar as traduções.

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Hugging Face API (Mistral-7B)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure a API key do Hugging Face:
   - Crie uma conta no [Hugging Face](https://huggingface.co/)
   - Obtenha uma API key em https://huggingface.co/settings/tokens
   - Adicione sua API key no arquivo `.env.local`:
     ```
     HUGGINGFACE_API_KEY=sua_api_key_aqui
     ```

## Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```
npm run dev
```

Acesse o aplicativo em [http://localhost:3000](http://localhost:3000).

## Funcionalidades

- Tradução de texto informal ("Mariês") para português formal
- Interface amigável e responsiva
- Exemplos de textos para demonstração
- Cópia do texto traduzido com um clique

## Licença

MIT
