"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, MessageSquare, Code, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && user === null) {
      router.push("/");
    }
  }, [user, isMounted, router]);

  if (!isMounted || user === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-[#050505] p-8 max-w-5xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 mt-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.displayName?.split(" ")[0] || "Developer"}</h1>
        <p className="text-gray-400">What would you like to build today?</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/chat" className="group">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-6 relative z-10">
              <MessageSquare className="w-6 h-6 text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3 relative z-10">Universal Chat</h2>
            <p className="text-gray-400 text-sm leading-relaxed flex-1 relative z-10">
              Interact with Gemini 2.5 Flash for fast, accurate answers and full-stack code generation.
            </p>
            <div className="mt-6 flex items-center gap-2 text-violet-400 text-sm font-medium relative z-10 group-hover:gap-3 transition-all">
              Jump in <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/coder" className="group">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 relative z-10">
              <Code className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-3 relative z-10">AI Coder</h2>
            <p className="text-gray-400 text-sm leading-relaxed flex-1 relative z-10">
              Generate entire React components and complex UI structures with Gemini 2.5 Pro.
            </p>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium relative z-10 group-hover:gap-3 transition-all">
              Start coding <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Quick Jump</h3>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask a question to start a new chat..." 
            className="w-full bg-[#111] border border-white/10 rounded-lg py-3 px-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            onClick={() => router.push('/dashboard/chat')}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
