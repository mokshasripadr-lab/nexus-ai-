/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { verifyAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Convert UIMessage format (parts array) to CoreMessage format (content string)
 * that streamText expects.
 */
function toCoreMessages(messages: any[]): { role: string; content: string }[] {
  return messages
    .filter((m: any) => m && m.role)
    .map((m: any) => {
      let content = '';
      if (typeof m.content === 'string' && m.content.length > 0) {
        content = m.content;
      } else if (Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text || '')
          .join('');
      }
      return { role: m.role, content };
    })
    .filter((m) => m.content.length > 0);
}

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages } = await req.json();

    const coreMessages = toCoreMessages(messages || []);

    if (coreMessages.length === 0) {
      // Return a friendly error instead of crashing
      return new Response(JSON.stringify({ error: 'No valid messages provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: `You are Nexus AI 2.0, a god-level AI agent and elite staff full-stack developer founded by Moksha Sripad R. You write complete, clean, and production-grade code in TypeScript, React, Next.js, and Tailwind CSS. You help users solve complex engineering and logical problems with supreme intelligence.
      
      CRITICAL INSTRUCTION FOR SPEED: Provide your answers extremely fast. Avoid unnecessary fluff. Do not write extremely long multi-file essays in one response; summarize or provide core code snippets directly to avoid server timeouts. Your output is strictly limited to 1500 tokens.`,
      messages: coreMessages as any,
    });

    return (result as any).toUIMessageStreamResponse({
      onError: (error: any) => {
        const errorId = Math.random().toString(36).substring(7);
        console.error(`[Engine Error ${errorId}]:`, error);
        return `Backend Crash: An unexpected error occurred. Ref: ${errorId}`;
      }
    });
  } catch (error: any) {
    const errorId = Math.random().toString(36).substring(7);
    console.error(`[Critical Engine Error ${errorId}]:`, error);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: {"type":"start"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"start-step"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"error"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"text-delta","id":"error","delta":"API Error: An unexpected error occurred. Reference ID: ${errorId}"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"error"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"finish-step"}\n\n`));
        controller.enqueue(encoder.encode(`data: {"type":"finish","finishReason":"error"}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  }
}


