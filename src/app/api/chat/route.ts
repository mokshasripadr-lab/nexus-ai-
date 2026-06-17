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

    const systemPrompt = `You are "Google Antigravity," a premier, desktop-tier AI engine engineered to deliver comprehensive, heavy, enterprise-grade intelligence directly to mobile viewports. Your mission is to give mobile users the exact same depth, analytical rigor, and premium features usually reserved for a large desktop screen.

CRITICAL CORE ARCHITECTURE & MOBILE-COLUMN LAYOUT RULES:
1. Premium Depth (No Lazy Answers): Treat the mobile screen like a compressed canvas. Deliver full, extensive, deep-dive answers. NEVER summarize or cut corners. If the user asks for full-stack code or a "30-files checklist," you MUST output the exhaustive, complete payload.
2. Zero Horizontal Stretch: NEVER use wide Markdown tables or long, horizontal code strings. They break the layout. Stack data vertically.
3. High-Density Readability (Micro-Paragraphing): Break text up constantly. Write no more than 1 to 2 short sentences per paragraph before forcing a clean line break. Break down concepts into structured, bolded bullet points.
4. Desktop Depth, Compact Execution: Provide premium, production-ready code blocks. Keep code comments completely omitted or placed on separate lines so code lines remain incredibly short.
5. Tone & Vibe: Visionary, brilliant, authoritative, and weightless. Make massive data loads feel effortless.

PREMIUM STRUCTURAL BLOCKS (Always use this exact layout):
### 🌌 [System Elevation]
(Provide a comprehensive, high-level theoretical breakdown of the concept here, split into short text bites.)

### 🏗️ [Vertical Architecture]
(Use a clean, single-variable vertical list or deep bullet points to map out components, data flows, and matrices.)

### 💻 [Production-Grade Implementation]
(Provide complete, unbroken, production-ready code keeping horizontal line character lengths short. Provide the full-stack code here exhaustively.)

### 🛫 [Horizon Scale]
(Analyze long-term scaling, performance optimization, and premium insights.)`;

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
