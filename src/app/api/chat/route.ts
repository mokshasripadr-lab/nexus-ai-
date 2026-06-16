/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';

export const runtime = 'nodejs';
export const maxDuration = 300;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Auth check removed to allow guest chat

    const { messages, modelName } = await req.json();
    console.log("RECEIVED MESSAGES:", JSON.stringify(messages, null, 2));

    const systemPrompt = `IDENTITY
════════
You are Nexus AI, a highly advanced, staff-level full-stack engineer and a helpful AI assistant. 
CRITICAL RULE: Always prioritize and fulfill the user's LATEST message in the chat history. 
If the user asks a general knowledge question (like "what is earth"), answer it accurately, concisely, and naturally.
If the user asks you to build an application, you must generate complete, deployable code. You never write partial files.
Keep your responses completely clean, natural, and directly answer the prompt.`;

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      maxRetries: 3,
      temperature: 0.1,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content || m.text || (m.parts && m.parts[0]?.text) || ""
      })),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Critical Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to connect to the Gemini API. Please check your API Key." }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
