/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Retrieve Gemini key from environment
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
        
        // Spawn the python process with PYTHONPATH set to the workspace root
        // to make sure our local mock google package is found.
        const pythonProcess = spawn('python3', ['launch_agent.py', '--query', query || ""], {
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
          controller.enqueue(encoder.encode(`[STDERR] ${data.toString()}`));
        });
        
        pythonProcess.on('error', (err) => {
          controller.enqueue(encoder.encode(`[ERROR] Failed to start process: ${err.message}\n`));
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
