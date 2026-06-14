/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, CornerDownLeft, Sparkles, Loader2, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from '@ai-sdk/react';

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium">
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
      ) : (
        <><Copy className="w-3.5 h-3.5" /> Copy code</>
      )}
    </button>
  );
};
import { useAuth } from "@/components/AuthProvider";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UniversalChatPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string>('');
  useEffect(() => {
    if (user) {
      user.getIdToken().then(setToken);
    } else {
      setToken('');
    }
  }, [user]);

  const { messages, setMessages, sendMessage, status } = useChat({
    fetch: async (url, options) => {
      const reqOptions = {
        ...options,
        headers: {
          ...options?.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      };
      return fetch(url, reqOptions as RequestInit);
    },
    onError: (err) => {
      setErrorMsg(err.message || "API Error: Please try again.");
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';


  const onSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input?.trim() || isLoading) return;
    setErrorMsg(null);
    sendMessage({ text: input });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // Load chat history
  useEffect(() => {
    if (user && !initialLoaded) {
      const docRef = doc(db, 'users', user.uid, 'chatHistory', 'default');
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setMessages(docSnap.data().messages || []);
        }
        setInitialLoaded(true);
      });
    } else if (!user) {
      setInitialLoaded(true);
    }
  }, [user, initialLoaded, setMessages]);

  // Save chat history
  useEffect(() => {
    if (user && initialLoaded && messages.length > 0 && !isLoading) {
      const docRef = doc(db, 'users', user.uid, 'chatHistory', 'default');
      // Firebase doesn't allow undefined values, so we strip them out by stringifying and parsing
      const sanitizedMessages = JSON.parse(JSON.stringify(messages));
      setDoc(docRef, { messages: sanitizedMessages, updatedAt: new Date() }, { merge: true });
    }
  }, [messages, user, initialLoaded, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!input?.trim() || isLoading) return;
      setErrorMsg(null);
      sendMessage({ text: input });
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isMounted) return <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center text-white/50"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="h-16 border-b border-white/5 shrink-0 flex items-center justify-between px-6 bg-[#000000] sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            Universal Chat
          </h1>
          <p className="text-sm text-gray-500 mt-1">Interact with leading AI models.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-gray-300">Powered by Nexus AI</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="my-auto flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">How can I help you today?</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed mb-8">
              Ask anything, request summaries, or have an open-ended conversation.
            </p>
          </div>
        ) : (
          /* Messages List */
          <div className="flex flex-col gap-6">
            {messages.map((msg: any, index: number) => {
              const textContent = msg.content || (msg.parts ? msg.parts.map((p: any) => p.type === 'text' ? (p.text || '') : '').join('') : '');
              return (
              <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role !== 'user' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30 ${isLoading && index === messages.length - 1 ? 'animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]' : ''}`}>
                    {isLoading && index === messages.length - 1 ? (
                      <div className="w-3 h-3 rounded-full bg-violet-400 animate-ping" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                    )}
                  </div>
                )}
                <div className={`max-w-[80%] min-w-0 break-words rounded-xl p-4 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#111] border border-white/10 text-gray-300 prose prose-invert max-w-none'}`}>
                  {msg.role === 'user' ? textContent : (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          if (!inline && match) {
                            return (
                              <div className="not-prose my-4 rounded-xl border border-white/10 bg-[#1e1e1e] font-sans relative">
                                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5 rounded-t-xl">
                                  <span className="text-xs text-gray-400 font-mono lowercase">{match[1]}</span>
                                  <CopyButton content={String(children).replace(/\n$/, '')} />
                                </div>
                                <div className="p-4 overflow-x-auto text-sm font-mono pb-6">
                                  {isLoading && index === messages.length - 1 ? (
                                    <pre className="text-gray-300 m-0 p-0 bg-transparent">
                                      <code>{String(children).replace(/\n$/, '')}</code>
                                    </pre>
                                  ) : (
                                    <SyntaxHighlighter
                                      {...props}
                                      PreTag="div"
                                      language={match[1]}
                                      style={vscDarkPlus}
                                      customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code {...props} className="bg-white/10 px-1.5 py-0.5 rounded-md text-violet-300 font-mono text-sm before:content-none after:content-none">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {textContent + (isLoading && index === messages.length - 1 ? ' ▍' : '')}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            )})}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  <div className="w-3 h-3 rounded-full bg-violet-400 animate-ping" />
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 shrink-0 bg-[#000000] border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          {errorMsg && (
            <div className="absolute -top-12 left-0 right-0 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-xl opacity-20 pointer-events-none" />
          <form onSubmit={onSubmit} className="relative bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden focus-within:border-white/20 transition-colors">
            <textarea 
              ref={textareaRef}
              rows={2}
              value={input || ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Nexus AI..."
              className="w-full bg-transparent border-none outline-none resize-none p-4 text-sm text-gray-200 placeholder-gray-600"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Press Enter to send</span>
              </div>
              <button 
                type="submit"
                className={`p-2 rounded-md transition-colors ${input?.trim() && !isLoading ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                disabled={!input?.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CornerDownLeft className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
