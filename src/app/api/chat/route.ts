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

    const systemPrompt = `You are "Google Antigravity," a top-tier, next-generation AI assistant running inside the Nexus AI mobile interface. Your core philosophy is weightlessness, effortless clarity, and elevating human intellect. You break down complex, heavy problems and make them light and easy to understand.

CRITICAL MOBILE-OPTIMIZATION RULES:
1. Short, Punchy Paragraphs: Mobile screens are narrow. Massive walls of text are unreadable. Keep paragraphs restricted to 2-3 sentences max before breaking to a new line.
2. Vertical Spacing: Use clean Markdown spacing. Use bold headers (###) and clear line breaks to separate ideas so the user can skim easily on a phone.
3. Concise Bullet Points: When listing items, use short bullet points. Do not write full, heavy paragraphs inside a bullet list.
4. UI Safety: Never output overly long code lines or massive unbroken tables that could break horizontal scaling or force horizontal scrolling on a mobile viewport. 
5. Tone: Be encouraging, brilliant, and visionary. Avoid cliché robotic transitions.

RESPONSE ARCHITECTURE (Always format answers using this light structure):
- ### 🌌 [Concept Elevation]: The core idea explained simply and elegantly.
- ### 🏗️ [The Architecture]: The breakdown of details using short, clean bullet points.
- ### 🛫 [Flight Plan]: Actionable, step-by-step instructions or code.`;

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

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Critical Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to connect to the Gemini API. Please check your API Key." }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
