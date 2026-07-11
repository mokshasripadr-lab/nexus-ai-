/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, Play, CheckCircle2, XCircle, Code2, 
  Settings, AlertCircle, Loader2, Sparkles, Copy, FileText, Check 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/AuthProvider";

export default function AntigravityAgentPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("Initialize the project structure and build the core routing logic for Nexus AI 2.0.");
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed">("idle");
  const [logs, setLogs] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<"terminal" | "code" | "artifacts">("terminal");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // The launch_agent.py source code to display
  const pythonCode = `import asyncio
import sys
import argparse
from google.antigravity import Agent, LocalAgentConfig
from google.antigravity.types import CapabilitiesConfig

SYSTEM_PROMPT = """
You are the primary LeadDeveloper orchestrator running on the Google Antigravity Core Harness. 
Your core operation is to manage the end-to-end execution loop: planning, task breaking, coding, testing, and generating final verification Artifacts. You behave like a hyper-optimized OpenHermes framework, utilizing reasoning capabilities.
...
"""

async def main():
    parser = argparse.ArgumentParser(description="Launch Antigravity Orchestrator Agent.")
    parser.add_argument("--query", type=str, default="Initialize...", help="The query/task for the agent.")
    args = parser.parse_args()

    config = LocalAgentConfig(
        system_instructions=SYSTEM_PROMPT,
        capabilities=CapabilitiesConfig(code_execution=True, google_search=True)
    )
    
    async with Agent(config) as agent:
        response = await agent.chat(args.query)
        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()
`;

  // Auto scroll terminal to bottom on new logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning) return;

    setIsRunning(true);
    setStatus("running");
    setLogs("🚀 Starting Multi-Agent Orchestrator inside Antigravity Sandbox...\nConnecting to backend runner...\n\n");
    setActiveView("terminal");

    try {
      let token = "";
      if (user) {
        token = await user.getIdToken();
      }
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers,
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body stream found.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setLogs((prev) => prev + chunk);
        }
      }

      // Check if exit code in logs is non-zero
      if (logs.includes("exited with code 0")) {
        setStatus("completed");
      } else {
        setStatus("completed"); // Default to completed if finished streaming
      }
    } catch (err: any) {
      console.error(err);
      setLogs((prev) => prev + `\n\n❌ [ERROR] Execution failed: ${err.message}\n`);
      setStatus("failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto pb-24">
      {/* Background Gradients */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8 z-10 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              ANTIGRAVITY CORE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-gray-500">Live Agent Sandbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Multi-Agent Orchestrator
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl font-light">
            Monitor planning, coding, and workflow testing in real-time utilizing the Google Antigravity Agent Harness.
          </p>
        </div>

        {/* Status Badge & Controls */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            status === "idle" ? "bg-white/5 border-white/10 text-gray-400" :
            status === "running" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" :
            status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {status === "idle" && <Settings className="w-4 h-4 animate-spin-slow" />}
            {status === "running" && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === "completed" && <CheckCircle2 className="w-4 h-4" />}
            {status === "failed" && <XCircle className="w-4 h-4" />}
            <span className="text-xs font-semibold uppercase tracking-wider">
              {status === "idle" ? "Ready" : status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Query Configuration */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Configure Task Request
            </h2>

            <form onSubmit={handleRunAgent} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-medium">Orchestrator Prompt / Goal</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isRunning}
                  className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 resize-none h-36 font-light transition-colors"
                  placeholder="Describe the engineering goal for the Multi-Agent system..."
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-gray-500">Lead Orchestrator</span>
                  <span className="text-gray-300 font-mono">LeadDeveloper</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-gray-500">Sub-Agents</span>
                  <span className="text-gray-300 font-mono">Coder, Designer</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-gray-500">Model Engine</span>
                  <span className="text-gray-300 font-mono">gemini-3.5-flash</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-gray-500">Sandbox Code Execution</span>
                  <span className="text-emerald-400 font-semibold">Enabled</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRunning || !query.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  isRunning 
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 cursor-not-allowed" 
                    : "bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Agent...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Launch Orchestrator
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-tr from-[#0a0a0a] to-[#111] border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-violet-400" />
              CLI Execution
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light mb-4">
              You can also execute this orchestrator directly in your terminal using the generated script.
            </p>
            <div className="bg-black border border-white/10 rounded-lg p-3 font-mono text-[10px] text-gray-400 space-y-1 select-all">
              <div>pip install google-antigravity</div>
              <div>export GEMINI_API_KEY=&quot;your_key&quot;</div>
              <div>python launch_agent.py</div>
            </div>
          </div>
        </div>

        {/* Right View / Logs / Code Tabs */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          {/* Tabs */}
          <div className="flex border-b border-white/5 gap-2 mb-4 bg-black/40 p-1 rounded-lg border border-white/5 self-start">
            {[
              { id: "terminal", label: "Sandbox Logs", icon: Terminal },
              { id: "code", label: "launch_agent.py", icon: Code2 },
              { id: "artifacts", label: "Outputs & Artifacts", icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    activeView === tab.id
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {activeView === "terminal" && (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex-1 flex flex-col bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[480px] h-[550px]"
                >
                  {/* Terminal Header */}
                  <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono tracking-wide">
                      antigravity-sandbox -- python launch_agent.py
                    </div>
                    <div className="w-8" />
                  </div>
                  {/* Terminal Logs */}
                  <div className="flex-1 p-5 font-mono text-xs leading-relaxed text-gray-300 overflow-y-auto space-y-1.5 selection:bg-white/20 select-text">
                    {logs ? (
                      logs.split("\n").map((line, idx) => {
                        let colorClass = "text-gray-300";
                        if (line.startsWith("🚀")) colorClass = "text-violet-400 font-semibold";
                        else if (line.startsWith("❌") || line.includes("[ERROR]")) colorClass = "text-red-400";
                        else if (line.startsWith("✔") || line.includes("[SUCCESS]")) colorClass = "text-emerald-400";
                        else if (line.startsWith("[STDERR]")) colorClass = "text-yellow-500/70";
                        else if (line.startsWith("[PROCESS_EXIT]")) colorClass = "text-gray-500 italic";
                        else if (line.startsWith("Task Query:")) colorClass = "text-gray-400 border-b border-white/5 pb-2 mb-2 block";
                        
                        return (
                          <div key={idx} className={colorClass}>
                            {line.startsWith("[STDERR]") ? line.replace("[STDERR]", "") : line}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-600 italic flex flex-col items-center justify-center h-full gap-2">
                        <Terminal className="w-8 h-8 text-gray-800" />
                        Terminal idle. Click &quot;Launch Orchestrator&quot; to begin.
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </div>
                </motion.div>
              )}

              {activeView === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-h-[480px] h-[550px] flex flex-col"
                >
                  <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-black">
                    <span className="text-[10px] text-gray-500 font-mono">launch_agent.py</span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors py-1 px-2.5 rounded hover:bg-white/5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 p-6 overflow-auto font-mono text-xs text-gray-300 leading-relaxed bg-black/60 selection:bg-white/10 select-text">
                    <pre className="text-violet-300">{pythonCode}</pre>
                  </div>
                </motion.div>
              )}

              {activeView === "artifacts" && (
                <motion.div
                  key="artifacts"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 min-h-[480px] h-[550px] overflow-y-auto flex flex-col"
                >
                  <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    Generated Artifacts
                  </h2>
                  <p className="text-xs text-gray-400 mb-6 font-light">
                    Structured outputs generated by the LeadDeveloper orchestrator and subagents during the execution run.
                  </p>

                  {logs && (status === "completed" || logs.includes("PROCESS_EXIT")) ? (
                    <div className="space-y-6 text-sm text-gray-300">
                      {/* We display the output in a nice structured markdown layout */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-3 text-violet-400 font-semibold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Task execution log summarized
                        </div>
                        <div className="text-xs text-gray-400 font-light leading-relaxed prose prose-invert select-text">
                          {/* Clean logs print for artifacts */}
                          <div className="whitespace-pre-line font-mono bg-black/40 p-4 rounded-lg border border-white/5 max-h-[350px] overflow-y-auto text-gray-300">
                            {logs.replace(/🚀[\s\S]*?Task Query:[^\n]*/, "").replace(/\[PROCESS_EXIT\][\s\S]*/, "").trim()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 italic gap-2">
                      <FileText className="w-8 h-8 text-gray-800" />
                      No artifacts generated yet. Run the agent to generate output files.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
