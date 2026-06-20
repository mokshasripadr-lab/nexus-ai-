/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react/no-unescaped-entities, @typescript-eslint/ban-ts-comment */
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
import { Send, Terminal, Code2, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

export default function AICoderPage() {
  const [code, setCode] = useState<string>("export default function HelloWorld() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n    </div>\n  );\n}");
  const [language, setLanguage] = useState("javascript");
  const [isSaved, setIsSaved] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    { text: '$ npm run dev', color: 'text-green-400' },
    { text: '> nexus-ai@0.1.0 dev', color: 'text-gray-400' },
    { text: '> next dev', color: 'text-gray-400' },
    { text: 'ready - started server on 0.0.0.0:3000, url: http://localhost:3000', color: 'text-green-400' },
    { text: 'event - compiled client and server successfully in 1250 ms (147 modules)', color: 'text-blue-400' }
  ]);
  
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    // @ts-ignore
    transport: new DefaultChatTransport({ api: "/api/coder" }),
  });
  const isLoading = status === 'submitted' || status === 'streaming';
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRunCode = () => {
    setTerminalLogs(prev => [
      ...prev,
      { text: '$ node main.js', color: 'text-green-400' },
      { text: '> Running code execution...', color: 'text-gray-400' },
      { text: 'Executed successfully with 0 errors.', color: 'text-blue-400' }
    ]);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input?.trim()) return;
    
    // Append the current code context to the user's message silently
    // by using a structured prompt format.
    const contextPrompt = `${input}\n\n=== CURRENT CODE CONTEXT ===\n\`\`\`${language}\n${code}\n\`\`\`\n=== END CONTEXT ===`;
    
    try {
      sendMessage({ text: contextPrompt });
      // Clear the input
      setInput('');
    } catch (error) {
      console.error("Append error:", error);
      alert("Failed to submit message: " + String(error));
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#0d0d0d] text-white overflow-hidden">
      {/* LEFT PANEL: Monaco Editor (70%) */}
      <div className="flex-[7] flex flex-col border-r border-white/10 relative">
        <div className="h-10 border-b border-white/10 flex items-center px-4 bg-[#111111] justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            <span className="font-mono">main.js</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRunCode} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">Run Code</button>
            <button onClick={handleSave} className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
              {isSaved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "JetBrains Mono, Menlo, monospace",
              padding: { top: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "all",
              formatOnPaste: true,
            }}
            loading={
              <div className="flex h-full items-center justify-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
          />
        </div>
        
        {/* Terminal Simulation at Bottom */}
        <div className="h-48 border-t border-white/10 bg-[#0a0a0a] flex flex-col shrink-0">
          <div className="h-8 border-b border-white/5 flex items-center px-4 text-[10px] uppercase font-bold tracking-wider text-gray-500 gap-4">
            <div className="text-white border-b-2 border-violet-500 h-full flex items-center">Terminal</div>
            <div className="hover:text-gray-300 cursor-pointer">Problems (0)</div>
            <div className="hover:text-gray-300 cursor-pointer">Output</div>
          </div>
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto flex flex-col gap-1">
            {terminalLogs.map((log, index) => (
              <div key={index} className={log.color}>{log.text}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AI Chat Sidebar (30%) */}
      <div className="flex-[3] flex flex-col bg-[#111111]">
        <div className="h-14 border-b border-white/10 flex items-center px-5 shrink-0 bg-[#161616]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Nexus AI Coder
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4 px-4">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <Sparkles className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm">I'm your AI pairing partner.</p>
              <p className="text-xs text-gray-600">Ask me to write a component, find bugs, or refactor the code on the left.</p>
            </div>
          ) : (
            messages.map((rawM) => {
              const m = rawM as any;
              // Hide the context prompt block from UI to keep it clean
              let content = m.content || "";
              if (m.role === 'user' && content.includes('=== CURRENT CODE CONTEXT ===')) {
                content = content.split('\n\n=== CURRENT CODE CONTEXT ===')[0];
              }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id}
                  className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                      {m.role === 'user' ? 'You' : 'Nexus'}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="relative mt-2 mb-2">
                              <div className="absolute top-0 right-0 bg-black/50 text-[10px] px-2 py-1 rounded-bl text-gray-400 uppercase font-mono border-b border-l border-white/10">
                                {match[1]}
                              </div>
                              <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-white/10 text-xs font-mono">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-black/30 px-1.5 py-0.5 rounded text-violet-200 font-mono text-[13px]" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              );
            })
          )}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm px-1">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-[#161616] border-t border-white/10 shrink-0">
          <form onSubmit={handleFormSubmit} className="relative group">
            <textarea
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none text-white placeholder-gray-600"
              placeholder="Ask me to modify the code..."
              rows={2}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input?.trim()) handleFormSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-2 bottom-3 p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-gray-500 font-medium">
            Shift + Enter to add a new line
          </div>
        </div>
      </div>
    </div>
  );
}
