/* eslint-disable @typescript-eslint/no-explicit-any */
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

import { systemPrompt } from './system-prompt';

export const runtime = 'edge';
export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openrouter('meta-llama/llama-3-8b-instruct:free'),
      maxRetries: 0,
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Coder API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate code" }), { status: 500 });
  }
}
