/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process';
import { verifyAuth, isAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser || !isAdmin(authUser.email)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { query } = await req.json();
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Retrieve Gemini key from environment
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
        
        // Sanitize the query to avoid flag manipulation (only alphanumeric, spaces, punctuation)
        const sanitizedQuery = (query || "").replace(/[^a-zA-Z0-9\s.,?!'"_-]/g, "");

        // Spawn the python process with PYTHONPATH set to the workspace root
        // to make sure our local mock google package is found.
        const pythonProcess = spawn('python3', ['launch_agent.py', '--query', sanitizedQuery], {
          env: {
            ...process.env,
            GEMINI_API_KEY: apiKey,
            PYTHONPATH: process.cwd()
          }
        });
        
        pythonProcess.stdout.on('data', (data) => {
          controller.enqueue(encoder.encode(data.toString()));
        });
        
        pythonProcess.stderr.on('data', (data) => {
          // Do not send raw stderr to client in production to prevent information disclosure.
          // Instead, log internally.
          console.error('[Agent Stderr]:', data.toString());
        });
        
        pythonProcess.on('error', (err) => {
          console.error('[Agent Process Error]:', err);
          controller.enqueue(encoder.encode(`[ERROR] Failed to start agent execution.\n`));
          controller.close();
        });
        
        pythonProcess.on('close', (code) => {
          controller.enqueue(encoder.encode(`\n[PROCESS_EXIT] Process exited with code ${code}\n`));
          controller.close();
        });
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

