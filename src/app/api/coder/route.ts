/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

import { systemPrompt } from './system-prompt';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-1.5-pro') as any,
      maxRetries: 0,
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Coder API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate code using Gemini" }), { status: 500 });
  }
}
