"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#050505] text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#000000] shrink-0 overflow-y-auto">
        <div className="h-14 flex items-center px-4 mb-2 mt-2">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight w-full hover:bg-white/5 p-2 rounded-md transition-colors">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center text-black font-bold text-[10px]">
              N
            </div>
            <span className="text-sm">Nexus AI Chatbot</span>
          </Link>
        </div>
        
        <div className="flex-1 py-2 px-3 space-y-6">
          {/* ENGINES SECTION */}
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-2 px-3">Engines</div>
            <nav className="space-y-0.5">
              <Link
                href="/dashboard/chat"
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors relative ${
                  pathname === "/dashboard/chat" 
                    ? "text-white" 
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                {pathname === "/dashboard/chat" && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/10 rounded-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <MessageSquare className="w-4 h-4 relative z-10" strokeWidth={2} />
                <span className="relative z-10">Universal Chat</span>
              </Link>
              

            </nav>
          </div>
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-2 px-3 mt-6">Recent Chats</div>
            <nav className="space-y-0.5">
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="truncate">Main Chat Session</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/5">
          {user ? (
            <button onClick={() => signOut(auth)} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 rounded-md transition-colors text-left group" title="Click to sign out">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-105 transition-transform overflow-hidden">
                {user.photoURL ? <Image src={user.photoURL} alt="Profile" width={24} height={24} /> : user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[13px] font-bold text-violet-300 truncate group-hover:text-white transition-colors">{user.displayName || "User"}</div>
                <div className="text-[11px] text-gray-400 font-semibold truncate">{user.email}</div>
              </div>
            </button>
          ) : (
            <div className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-500">
              Not signed in
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050505]">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-[#000000]">
          <div className="flex items-center text-sm font-medium text-gray-400">
            <span>{user ? user.displayName?.split(' ')[0].toLowerCase() + '-team' : 'guest-team'}</span>
            <span className="mx-2">/</span>
            <motion.span 
              key={pathname}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-200"
            >
              Chat
            </motion.span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#111] border border-white/10 hover:border-white/20 transition-colors rounded-md px-3 py-1.5 text-xs text-gray-400 group">
              <Search className="w-3.5 h-3.5 group-hover:text-gray-300" />
              <span>Search...</span>
              <div className="flex items-center gap-0.5 ml-4">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
