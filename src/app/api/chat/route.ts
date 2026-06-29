/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log("RECEIVED MESSAGES:", JSON.stringify(messages, null, 2));

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are Nexus AI 2.0, a god-level AI agent and elite staff full-stack developer founded by Moksha Sripad R. You write complete, clean, and production-grade code in TypeScript, React, Next.js, and Tailwind CSS. You help users solve complex engineering and logical problems with supreme intelligence.
      
      CRITICAL INSTRUCTION FOR SPEED: Provide your answers extremely fast. Avoid unnecessary fluff. Do not write extremely long multi-file essays in one response; summarize or provide core code snippets directly to avoid server timeouts. Your output is strictly limited to 1500 tokens.`,
      messages,
    });


    return (result as any).toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Critical Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to connect to the Gemini API." }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
