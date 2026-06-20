/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const documentationMarkdown = `
# Nexus AI Chatbot - Full Project Documentation

**v2.0 — June 2025: Migrated to Gemini 2.5 Flash + Pro. Removed OpenRouter dependency.**

This document outlines the entire journey of building the Nexus AI Chatbot from scratch to its current production-ready state.

## 1. Project Inception & UI Design
We started by creating a Next.js 15 application using the App Router. The goal was to build a highly responsive, modern, dark-themed AI chat interface inspired by Google Gemini.

### Key UI Features Implemented:
- **Glassmorphism & Dark Mode**: Used TailwindCSS to build a sleek, dark aesthetic with frosted glass sidebars (\`bg-white/5\`, \`backdrop-blur-xl\`).
- **Sidebar Navigation**: Built a collapsible sidebar with "Universal Chat" and "Main Chat Session" options.
- **Message Bubbles**: Styled user messages with stark white backgrounds and AI responses with dark panels and syntax-highlighted code blocks (\`react-syntax-highlighter\` using \`vscDarkPlus\`).
- **Input Area**: Added a dynamic, auto-resizing text area that handles "Enter" to send and "Shift+Enter" for new lines.

## 2. Authentication & Database (Firebase Integration)
To make the application production-ready, we integrated Firebase for backend services.
- **Firebase Auth**: Added Google and GitHub sign-in providers to allow secure user authentication. Built a custom \`useAuth\` hook and an \`AuthContext\` wrapper.
- **Firestore Database**: Configured Cloud Firestore to save the user's chat history persistently. 
- **Auto-Sync**: Wrote \`useEffect\` hooks to automatically load the chat history on login, and seamlessly push changes to Firestore every time a new message is sent.

## 3. The AI Integration Journey
The core of the app was built using the **Vercel AI SDK**, but the implementation went through multiple architectural evolutions.

### Phase 1: OpenRouter (The Initial Setup)
We initially set up the AI backend to route through **OpenRouter**, allowing access to open-source models like \`Gemma-2-9B\` and \`Llama-3.3-70B\`.
- **The Setup**: We implemented an API route (\`/api/chat\`) using \`@ai-sdk/openai\` configured with a custom OpenRouter base URL.
- **The Problem**: OpenRouter's free-tier models (\`:free\`) became severely rate-limited and often crashed with \`429 Too Many Requests\` or \`404 Not Found\` when models were taken offline.

### Phase 2: Upgrading the AI SDK
To fix streaming bugs, we upgraded the Vercel AI SDK to its latest version (\`ai@6.x\`).
- **The Problem**: The bleeding-edge version of the AI SDK had completely deprecated the old \`toDataStreamResponse()\` method in favor of \`toUIMessageStreamResponse()\`.
- **The Fix**: We hunted down the silent crashes in the Node.js server logs and updated the streaming protocols across the entire backend to match the new version's exact requirements.

### Phase 3: The Ultimate Fix (Google Generative AI)
After fighting rate limits and insufficient billing credit errors (\`402 Payment Required\`), we completely ripped out OpenRouter.
- **The Setup**: We installed the official \`@ai-sdk/google\` package.
- **The Fix**: We wired the application directly to Google's Native Gemini API. 
- **The Result**: The app now natively runs on **Gemini 2.5 Flash** for chat and **Gemini 2.5 Pro** for coding tasks. It is lightning-fast, highly accurate, and practically unlimited on the free tier. We also stripped the Model Selector from the UI to lock it into this high-performance configuration.

## 4. Why Choose Nexus AI?

While other platforms offer fragmented tools or lock you into rigid, high-cost ecosystems, Nexus AI provides a unified, developer-centric environment built for speed, transparency, and innovation.

### The Nexus Advantage:
- **Native Gemini Integration**: Unlike third-party proxy wrappers that suffer from rate-limits and latency, Nexus AI connects directly to Google's Native SDK. This ensures maximum throughput, zero queueing, and enterprise-grade reliability using **Gemini 2.5 Flash** and **Gemini 2.5 Pro**.
- **Uncompromised Privacy**: Your data and prompts flow directly between your environment and the foundation model. No middleman telemetry, no shadow logging.
- **Architectural Elegance**: We’ve stripped away bloated dependencies. The platform is engineered on a highly optimized Next.js 15 App Router foundation, ensuring lightning-fast load times and seamless real-time interactions.
- **Cost-Efficiency at Scale**: By leveraging direct API connections and intelligent caching through Firebase, Nexus AI eliminates the middleman markups typical of "AI-as-a-Service" platforms, allowing you to scale your ideas without artificial constraints.

When you choose Nexus AI, you aren't just adopting a tool—you are gaining a dedicated, high-performance workspace designed to accelerate your engineering velocity.
`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-16 selection:bg-violet-500/30">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="prose prose-invert prose-violet max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-8" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-12 mb-6 text-white border-b border-white/10 pb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-8 mb-4 text-violet-300" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-6" {...props} />,
              ul: ({node, ...props}) => <ul className="space-y-3 my-6 list-none" {...props} />,
              li: ({node, ...props}) => (
                <li className="flex items-start text-gray-300" {...props}>
                  <span className="mr-3 text-violet-500 mt-1.5 text-xs">●</span>
                  <span {...props} />
                </li>
              ),
              strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
              a: ({node, ...props}) => <a className="text-violet-400 hover:text-violet-300 underline underline-offset-4 decoration-white/20 transition-colors" {...props} />,
              code: ({node, inline, ...props}: any) => 
                inline 
                  ? <code className="bg-[#111] text-violet-300 px-1.5 py-0.5 rounded font-mono text-sm border border-white/5" {...props} />
                  : <code className="block bg-[#111] text-gray-300 p-6 rounded-xl font-mono text-sm border border-white/10 overflow-x-auto my-6 shadow-2xl" {...props} />
            }}
          >
            {documentationMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
