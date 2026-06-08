import express from 'express';
import { createServer as createViteServer } from 'vite';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Wait to initialize AI until actually needed to avoid crashes if ENV is missing
  let deepseekClient: OpenAI | null = null;
  let geminiClient: GoogleGenAI | null = null;

  function getClient() {
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (deepseekKey) {
      if (!deepseekClient) {
        deepseekClient = new OpenAI({ apiKey: deepseekKey, baseURL: 'https://api.deepseek.com' });
      }
      return { client: deepseekClient, type: 'deepseek' };
    }
    if (!geminiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error('DEEPSEEK_API_KEY or GEMINI_API_KEY environment variable is required');
      }
      geminiClient = new GoogleGenAI({ apiKey: key });
    }
    return { client: geminiClient, type: 'gemini' };
  }

  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, history = [] } = req.body;
      const { client, type } = getClient();
      
      const systemInstruction = 
`You are an AI tour guide for Hainan Wenchang Tourism (海南文昌文旅).
Always provide detailed, engaging, and accurate information about Wenchang, Hainan.
Include recommendations for food (like Wenchang Chicken), sights (like Dongjiao Coconut Grove, Wenchang Spacecraft Launch Site), culture, and itineraries.
Respond in markdown format. Keep the tone friendly and helpful. Please ALWAYS reply and converse using simplified Chinese (简体中文).
请规范答案格式，确保序号和标题排版整齐一致。在回答中适当加入符合当地风情和内容的emoji表情（如 🌴, 🥥, 🚀, 🍗 等），增加回答的趣味性和阅读体验。`;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (type === 'deepseek') {
        const messages = [
          { role: 'system', content: systemInstruction },
          ...history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: prompt || "Introduce Wenchang" }
        ];

        const responseStream = await (client as OpenAI).chat.completions.create({
          model: 'deepseek-chat',
          messages: messages as any,
          stream: true,
        });

        for await (const chunk of responseStream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
             res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
      } else {
        const contents = history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        if (contents.length === 0) {
           contents.push({ role: 'user', parts: [{ text: prompt || "Introduce Wenchang" }] });
        } else {
           contents.push({ role: 'user', parts: [{ text: prompt || "Introduce Wenchang" }] });
        }

        const responseStream = await (client as GoogleGenAI).models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction,
          }
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
             res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
      }
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Chat API Error:", error);
      const isQuotaError = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      if (!res.headersSent) {
        res.status(isQuotaError ? 429 : 500).json({ error: error.message || 'Failed to generate response' });
      }
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
