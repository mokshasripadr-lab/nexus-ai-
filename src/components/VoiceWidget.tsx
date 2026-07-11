/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Voice {
  voice_id: string;
  name: string;
}

interface VoiceWidgetProps {
  onSendMessage: (message: string) => void;
  isAiSpeaking: boolean;
  onVoiceChange: (voiceId: string) => void;
  selectedVoice: string;
}

export default function VoiceWidget({ onSendMessage, isAiSpeaking, onVoiceChange, selectedVoice }: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [loadingVoices, setLoadingVoices] = useState(false);

  useEffect(() => {
    if (voices.length === 0) {
      setLoadingVoices(true);
      fetch("/api/elevenlabs/voices")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.voices) {
            setVoices(data.voices);
            if (!selectedVoice && data.voices.length > 0) {
              const defaultVoice = data.voices.find((v: any) => v.name === 'Rachel') || data.voices[0];
              onVoiceChange(defaultVoice.voice_id);
            }
          }
        })
        .catch(console.error)
        .finally(() => setLoadingVoices(false));
    }
  }, [voices.length, onVoiceChange, selectedVoice]);

  useEffect(() => {
    // Initialize SpeechRecognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // If we have a transcript, send it
          setTranscript((prev) => {
            if (prev.trim()) {
              onSendMessage(prev);
            }
            return "";
          });
        };
      }
    }
  }, [onSendMessage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-8 w-10 h-10 bg-violet-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center text-white hover:bg-violet-500 transition-colors z-50 group"
          >
            <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Voice Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                  <Volume2 className="w-4 h-4 text-violet-400" />
                </div>
                <span className="font-medium text-sm text-gray-200">Voice Mode</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center justify-center gap-6">
              {/* Orb Animation */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {isAiSpeaking ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-violet-500 rounded-full blur-xl opacity-50"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.8)] z-10"
                    />
                  </>
                ) : isListening ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-30"
                    />
                    <div className="w-16 h-16 bg-cyan-400 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 bg-[#222] border border-white/10 rounded-full z-10 flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-medium">Ready</span>
                  </div>
                )}
              </div>

              {/* Status text */}
              <div className="text-center min-h-[40px] flex items-center justify-center">
                {isAiSpeaking ? (
                  <p className="text-sm text-violet-400 font-medium animate-pulse">Nexus AI is speaking...</p>
                ) : isListening ? (
                  <p className="text-sm text-cyan-400 font-medium">{transcript || "Listening..."}</p>
                ) : (
                  <p className="text-sm text-gray-400">Tap microphone to speak</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex w-full items-center justify-center gap-4">
                <button
                  onClick={toggleListening}
                  disabled={isAiSpeaking || !recognitionRef.current}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white hover:bg-gray-200 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="p-4 bg-[#111] border-t border-white/5">
              <label className="text-xs font-medium text-gray-500 mb-2 block">AI Voice</label>
              <div className="relative">
                <select
                  value={selectedVoice}
                  onChange={(e) => onVoiceChange(e.target.value)}
                  className="w-full appearance-none bg-[#000] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-violet-500 transition-colors"
                  disabled={loadingVoices}
                >
                  {loadingVoices ? (
                    <option>Loading voices...</option>
                  ) : voices.length === 0 ? (
                    <option>No voices found</option>
                  ) : (
                    voices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {loadingVoices ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500 rotate-180" />}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
