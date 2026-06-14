/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Database, Terminal, Code, Workflow, FileText, Check, X, Shield, Sparkles, Layers, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import FeedbackModal from "@/components/FeedbackModal";

interface Review {
  type: string;
  content: string;
  userId: string;
  userName: string;
  userPhoto: string;
  createdAt: string;
}

export default function Home() {
  const { user } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const q = query(collection(db, "feedback"), where("type", "==", "review"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allReviews = snapshot.docs.map(doc => doc.data() as Review);
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews.slice(0, 6));
    }, (error) => {
      console.error("Error fetching reviews:", error);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      alert(`Login failed: ${error.message}\n\nMake sure Google Sign-In is enabled in your Firebase Console!`);
    } finally {
      setIsLoggingIn(false);
    }
  };
  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden font-sans text-gray-200">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute top-[60%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center z-50 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-black font-bold text-xs">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">NEXUS AI CHATBOT</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#comparison" className="hover:text-white transition-colors">Compare</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          <Link href="#reviews" className="hover:text-white transition-colors">Reviews</Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={() => setIsFeedbackOpen(true)} className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
                Leave Feedback
              </button>
              <button onClick={() => signOut(auth)} className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
                Sign Out
              </button>
              <Link href="/dashboard" className="px-3 py-1.5 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors flex items-center gap-1 shadow-sm">
                Dashboard
              </Link>
            </>
          ) : (
            <button disabled={isLoggingIn} onClick={handleLogin} className="px-3 py-1.5 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-200 transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50">
              {isLoggingIn ? "Connecting..." : "Sign In with Google"}
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 flex flex-col items-center justify-center text-center max-w-5xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 text-xs font-medium mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-violet-400" />
            <span>Nexus AI 2.0 is now available</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Build applications <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">
              at the speed of thought.
            </span>
          </h1>
          
          <div className="mb-6 px-6 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 inline-flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <span className="text-violet-200 font-semibold text-lg tracking-wide">
              Founder of Nexus AI: <span className="text-white font-bold">Moksha Sripad .R</span>
            </span>
          </div>
          
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Nexus AI is the unified platform for engineering teams to build, ship, and scale intelligent applications. Access state-of-the-art models within a native development environment.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-6 py-3 rounded-lg bg-white text-black text-sm font-semibold hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              Start Building
            </Link>
            <Link href="/docs" className="px-6 py-3 rounded-lg border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Read Documentation
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Dashboard App Preview Mockup */}
      <section className="px-6 pb-32 max-w-6xl mx-auto w-full z-10 perspective-1000">
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="w-full rounded-xl p-1 bg-gradient-to-b from-white/10 to-transparent shadow-2xl overflow-hidden transform-gpu"
        >
          <div className="w-full bg-[#0a0a0a] rounded-lg border border-white/10 flex flex-col h-[600px] overflow-hidden shadow-2xl">
            {/* Mockup Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#000000]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md text-xs text-gray-400 font-mono">
                nexus-ai.local
              </div>
            </div>
            {/* Mockup Content */}
            <div className="flex flex-1 overflow-hidden bg-[#0a0a0a]">
              {/* Sidebar */}
              <div className="w-56 border-r border-white/5 p-4 flex flex-col gap-6 hidden md:flex">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Engines</div>
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded-md text-sm text-gray-200"><Terminal className="w-4 h-4" /> AI Coder</div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500"><Code className="w-4 h-4" /> Code Review</div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500"><Database className="w-4 h-4" /> Database</div>
                </div>
              </div>
              {/* Main */}
              <div className="flex-1 p-8 flex flex-col bg-[#050505]">
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Terminal className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-[#111] border border-white/5 rounded-lg p-4 text-sm text-gray-300">
                      Create a Next.js 15 dashboard with a sidebar and a data table.
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <div className="w-5 h-5 bg-white rounded-sm" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-[#111] border border-white/5 rounded-lg p-4 text-sm text-gray-300 font-mono">
                      <span className="text-violet-400">import</span> {"{ useState }"} <span className="text-violet-400">from</span> <span className="text-green-400">&apos;react&apos;</span>;<br/><br/>
                      <span className="text-violet-400">export default function</span> Dashboard() {"{"}<br/>
                      &nbsp;&nbsp;<span className="text-violet-400">return</span> (<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;{"<div className=\"flex h-screen bg-black text-white\">"}<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"<Sidebar />"}<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"<DataTable />"}<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;{"</div>"}<br/>
                      &nbsp;&nbsp;);<br/>
                      {"}"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Comprehensive Features Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full z-10" id="features">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">One Platform. Infinite Capabilities.</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Every tool you need to build, analyze, and scale intelligent workflows.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Code, title: "AI Full-Stack Coder", desc: "Generate production-ready React, Next.js, and Tailwind code from a single text prompt. Instantly editable and natively integrated." },
            { icon: Database, title: "Data Processing Engine", desc: "Upload CSVs or JSON files. Nexus AI instantly analyzes, formats, and generates comprehensive reports using advanced data vectorization." },
            { icon: Workflow, title: "Automated Workflows", desc: "Chain multiple AI models together. Pass output from a visual model directly into a code generator without writing a single script." },
            { icon: Sparkles, title: "Universal Chat", desc: "Interact with GPT-4, Claude 3, and Gemini within a single interface. Maintain persistent context across all your projects." },
            { icon: Shield, title: "End-to-End Encrypted Chat History", desc: "Your conversations are locked down with enterprise-grade encryption. Only you can access your chat history. Zero-data retention by default." },
            { icon: Layers, title: "Native API Integration", desc: "Expose your custom Nexus AI workflows as robust REST APIs to plug into your existing non-AI applications seamlessly." },
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border-glass rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 group cursor-default relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <feature.icon className="w-8 h-8 text-gray-500 mb-6 group-hover:text-violet-400 transition-colors relative z-10" />
              <h3 className="text-xl font-semibold text-white mb-3 relative z-10">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The Comparison Table */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full z-10" id="comparison">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
            <Check className="w-3 h-3" /> Why Choose Nexus AI
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Simply better than the rest.</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">See how Nexus AI stacks up against fragmented, legacy AI workflows.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-white/10 rounded-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <table className="w-full text-left relative z-10">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="py-5 px-6 font-medium text-gray-400 w-1/3">Features</th>
                <th className="py-5 px-6 font-bold text-white text-lg w-1/3 border-l border-white/10 bg-violet-900/10">Nexus AI</th>
                <th className="py-5 px-6 font-medium text-gray-500 w-1/3 border-l border-white/10">Generic AI Bots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { feature: "Production-Ready Code Generation", us: true, them: false },
                { feature: "Native Full-Stack Previews", us: true, them: false },
                { feature: "Access to Multiple Leading LLMs", us: true, them: true },
                { feature: "Unified Dashboard Experience", us: true, them: false },
                { feature: "Automated Workflows & Chaining", us: true, them: false },
                { feature: "Enterprise Security & Privacy", us: true, them: false },
                { feature: "Zero Setup Required", us: true, them: false },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-300 font-medium">{row.feature}</td>
                  <td className="py-4 px-6 border-l border-white/10 bg-violet-900/5">
                    {row.us ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                        <Check className="w-4 h-4" /> Yes
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <X className="w-4 h-4" /> No
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 border-l border-white/10">
                    {row.them ? (
                      <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <Check className="w-4 h-4" /> Limited
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <X className="w-4 h-4" /> No
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>

      {/* Real User Reviews Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full z-10" id="reviews">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium mb-6">
            <MessageSquare className="w-3 h-3" /> Community Feedback
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Loved by Developers.</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">See what real users are saying about Nexus AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.length > 0 ? reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border border-white/10 bg-[#111] rounded-2xl p-8 hover:bg-white/5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 overflow-hidden shrink-0">
                  {review.userPhoto ? <Image src={review.userPhoto} alt={review.userName} width={40} height={40} className="object-cover" unoptimized /> : null}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{review.userName}</div>
                  <div className="text-xs text-gray-500">Verified User</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">&quot;{review.content}&quot;</p>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-12 border border-white/5 rounded-2xl bg-[#0a0a0a]">
              <p className="text-gray-500">No reviews yet. Be the first to leave one!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-gradient-to-tr from-[#111] to-[#1a1a1a] border border-white/10 rounded-3xl p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-4xl font-bold text-white mb-6 relative z-10">Stop writing boilerplate. <br/>Start creating.</h2>
          <p className="text-gray-400 mb-10 text-lg relative z-10">Join thousands of developers and teams building the future with Nexus AI.</p>
          <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10 inline-block">
            Get Started for Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-[10px]">N</div>
            <span className="text-sm font-semibold text-gray-400">NEXUS AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="https://twitter.com/nexusai" target="_blank" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="https://github.com/nexus-ai" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="https://discord.gg/nexusai" target="_blank" className="hover:text-white transition-colors">Discord</Link>
          </div>
        </div>
      </footer>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
