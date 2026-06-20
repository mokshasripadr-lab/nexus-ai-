/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 300;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

export async function POST(req: Request) {
  try {

    const { messages, modelName } = await req.json();
    console.log("RECEIVED MESSAGES:", JSON.stringify(messages, null, 2));

    const systemPrompt = `You are Nexus AI, an extremely accurate, fast, and helpful AI assistant. 
Your core directives:
1. Extreme Accuracy: Always provide factually correct and precise information.
2. Speed and Conciseness: Be concise and direct in your answers, avoiding unnecessary fluff.
3. Full Code Execution: When the user asks for code, provide complete, full-stack, production-ready code without skipping or truncating.
4. Format: Use clean, readable Markdown without enforcing rigid, unnecessary structures. Adjust your tone and depth to exactly match what the user is asking.
5. No History Repetition: DO NOT repeat, summarize, or restate previous messages or answers from the conversation history unless explicitly asked. Only respond to the user's latest prompt.`;

    let result;
    try {
      console.log("Attempting to use OpenRouter (meta-llama/llama-3.3-70b-instruct:free)...");
      result = await streamText({
        model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
        system: systemPrompt,
        maxRetries: 1,
        temperature: 0.1,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content || m.text || (m.parts && m.parts[0]?.text) || ""
        })),
      });
    } catch (openRouterError) {
      console.log("OpenRouter failed, falling back to Native Gemini API...", openRouterError);
      result = await streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        maxRetries: 3,
        temperature: 0.1,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content || m.text || (m.parts && m.parts[0]?.text) || ""
        })),
      });
    }

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Critical Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to connect to the Gemini API. Please check your API Key." }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
