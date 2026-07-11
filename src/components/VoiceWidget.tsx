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
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="appearance-none bg-white/5 border border-white/10 rounded-md px-2 py-1.5 pr-6 text-xs text-gray-300 focus:outline-none focus:border-violet-500 transition-colors"
          disabled={loadingVoices}
        >
          {loadingVoices ? (
            <option>Loading...</option>
          ) : voices.length === 0 ? (
            <option>No voices</option>
          ) : (
            voices.map((v) => (
              <option key={v.voice_id} value={v.voice_id}>
                {v.name}
              </option>
            ))
          )}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          {loadingVoices ? <Loader2 className="w-3 h-3 animate-spin text-gray-500" /> : <ChevronUp className="w-3 h-3 text-gray-500 rotate-180" />}
        </div>
      </div>
      
      <button
        type="button"
        onClick={toggleListening}
        disabled={isAiSpeaking || !recognitionRef.current}
        className={`p-2 rounded-md transition-colors flex items-center justify-center h-8 w-8 ${
          isListening
            ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
            : isAiSpeaking
            ? "bg-violet-500/20 text-violet-400 cursor-not-allowed"
            : "bg-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
        title={isListening ? "Stop listening" : "Start speaking"}
      >
        {isAiSpeaking ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
