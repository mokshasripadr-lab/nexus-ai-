"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<"review" | "suggestion">("review");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, "feedback"), {
        type,
        content,
        userId: user.uid,
        userName: user.displayName || "Anonymous User",
        userPhoto: user.photoURL || "",
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContent("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-1">Submit Feedback</h2>
          <p className="text-sm text-gray-400 mb-6">Help us improve Nexus AI by sharing your thoughts.</p>
          
          {success ? (
            <div className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-lg text-center font-medium">
              Thank you for your feedback!
            </div>
          ) : !user ? (
             <div className="text-amber-400 bg-amber-400/10 border border-amber-400/20 p-4 rounded-lg text-center font-medium">
              You must be logged in to submit feedback.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-black rounded-lg border border-white/10">
                <button type="button" onClick={() => setType("review")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === "review" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Review</button>
                <button type="button" onClick={() => setType("suggestion")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === "suggestion" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>Suggestion</button>
              </div>
              
              <div>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={type === "review" ? "What do you love about Nexus AI?" : "What feature should we build next?"}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-500 transition-colors resize-none"
                  rows={4}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !content.trim()}
                className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
