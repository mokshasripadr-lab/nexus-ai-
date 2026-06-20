/* eslint-disable @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

import { systemPrompt } from './system-prompt';

export const runtime = 'edge';
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-3.5-flash'),
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
