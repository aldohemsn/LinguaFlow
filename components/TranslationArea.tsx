import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Copy, Check, RotateCcw, X, Volume2, Loader2 } from 'lucide-react';
import { TranslationMode } from '../types';

interface TranslationAreaProps {
  mode: TranslationMode;
  isLoading: boolean;
  translatedText: string;
  error: string | null;
  onTranslate: (text: string) => void;
  onClear: () => void;
}

const TranslationArea: React.FC<TranslationAreaProps> = ({
  mode,
  isLoading,
  translatedText,
  error,
  onTranslate,
  onClear
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  // Debounce ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (text.trim()) {
      timeoutRef.current = setTimeout(() => {
        onTranslate(text);
      }, 800); // 800ms debounce
    } else {
        onClear();
    }
  };

  const handleClear = () => {
    setInputText('');
    onClear();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSpeak = () => {
    if (!translatedText) return;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Theme configuration based on mode
  const isPro = mode === TranslationMode.PROOFREADER;
  const activeColorClass = isPro ? 'text-violet-600' : 'text-indigo-600';
  const activeBorderClass = isPro ? 'focus-within:ring-violet-500' : 'focus-within:ring-indigo-500';
  const activeBgClass = isPro ? 'bg-violet-50' : 'bg-indigo-50';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px] min-h-[400px]">
      {/* Source Input */}
      <div className={`relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 ${activeBorderClass} focus-within:ring-2 focus-within:border-transparent`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chinese (Detected)</span>
          {inputText && (
            <button 
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <textarea
          className="flex-1 w-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-800 text-lg leading-relaxed placeholder:text-slate-300"
          placeholder="Enter Chinese text here..."
          value={inputText}
          onChange={handleInputChange}
          spellCheck={false}
        />
        <div className="px-4 py-3 text-right">
             <span className="text-xs text-slate-400 font-medium">{inputText.length} chars</span>
        </div>
      </div>

      {/* Target Output */}
      <div className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${isPro ? 'bg-gradient-to-br from-white to-violet-50/30 border-violet-100' : 'bg-gradient-to-br from-white to-indigo-50/30 border-indigo-100'} shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/50">
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeColorClass}`}>
            English {isPro && <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded text-[10px]">PRO</span>}
          </span>
          <div className="flex items-center space-x-1">
             {translatedText && (
                 <>
                    <button
                        onClick={handleSpeak}
                        className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        title="Listen"
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-white rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy translation"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </>
             )}
          </div>
        </div>
        
        <div className="flex-1 relative p-4 overflow-y-auto">
            {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm z-10">
                    <Loader2 className={`w-8 h-8 animate-spin mb-2 ${activeColorClass}`} />
                    <span className="text-sm font-medium animate-pulse">
                        {isPro ? 'Translating & Polishing...' : 'Translating...'}
                    </span>
                </div>
            ) : null}

            {error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-red-500">
                    <div className="bg-red-50 p-3 rounded-full mb-3">
                         <RotateCcw className="w-6 h-6" />
                    </div>
                    <p className="font-medium">Translation failed</p>
                    <p className="text-sm text-red-400 mt-1">{error}</p>
                </div>
            ) : translatedText ? (
                <p className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap animate-in fade-in duration-500">
                    {translatedText}
                </p>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-300 select-none">
                    <span className="text-sm">Translation will appear here</span>
                </div>
            )}
        </div>
        
        {/* Footer decoration for PRO mode */}
        {isPro && translatedText && !isLoading && (
            <div className="px-4 py-2 bg-violet-50/50 border-t border-violet-100 rounded-b-2xl">
                 <p className="text-[10px] text-violet-400 flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Enhanced with Gemini Pro
                 </p>
            </div>
        )}
      </div>
    </div>
  );
};

// Helper component for Pro decoration
const Sparkles = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.75 12L12 3.75L14.25 12L22.5 14.25L14.25 16.5L12 24.75L9.75 16.5L1.5 14.25L9.75 12Z" />
    </svg>
);

export default TranslationArea;