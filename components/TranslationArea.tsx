import React, { useState } from 'react';
import { Copy, Check, X, Volume2, Sparkles, ArrowRight, Loader2, Download } from 'lucide-react';
import { TranslationMode } from '../types';

interface TranslationAreaProps {
  isLoading: boolean;
  sourceText: string;
  targetText: string;
  error: string | null;
  onSourceChange: (text: string) => void;
  onTargetChange: (text: string) => void;
  onTranslate: () => void;
  onPolish: () => void;
  onClear: () => void;
}

const TranslationArea: React.FC<TranslationAreaProps> = ({
  isLoading,
  sourceText,
  targetText,
  error,
  onSourceChange,
  onTargetChange,
  onTranslate,
  onPolish,
  onClear
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!targetText) return;
    try {
      await navigator.clipboard.writeText(targetText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSpeak = () => {
    if (!targetText) return;
    const utterance = new SpeechSynthesisUtterance(targetText);
    // Try to guess language or default to English. 
    // Ideally, we'd pass the detected language prop.
    utterance.lang = 'en-US'; 
    window.speechSynthesis.speak(utterance);
  };

  const handleDownload = () => {
    if (!targetText) return;
    const blob = new Blob([targetText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translation.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[650px] min-h-[500px]">
      
      {/* --- Source Column --- */}
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Text</span>
          {sourceText && (
            <button 
              onClick={onClear}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear all text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <textarea
          className="flex-1 w-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-800 text-lg leading-relaxed placeholder:text-slate-300"
          placeholder="Enter text to translate..."
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          spellCheck={false}
        />

        {/* Footer & Action */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
           <span className="text-xs text-slate-400 font-medium">{sourceText.length} chars</span>
           
           <button
             onClick={onTranslate}
             disabled={isLoading || !sourceText.trim()}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
               isLoading || !sourceText.trim()
                 ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                 : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:transform active:scale-95'
             }`}
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
             Translate
           </button>
        </div>
      </div>


      {/* --- Target Column --- */}
      <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            Target Text <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Editable</span>
          </span>
          <div className="flex items-center space-x-1">
             {targetText && (
                 <>
                    <button
                        onClick={handleSpeak}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        title="Listen"
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy text"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        title="Download as TXT"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                 </>
             )}
          </div>
        </div>
        
        {/* Output/Edit Area */}
        <div className="flex-1 relative">
            <textarea
                className={`w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-800 text-lg leading-relaxed placeholder:text-slate-300 ${isLoading ? 'opacity-50' : ''}`}
                placeholder="Translation will appear here..."
                value={targetText}
                onChange={(e) => onTargetChange(e.target.value)}
                spellCheck={false}
            />
            
            {error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg shadow-sm text-sm font-medium border border-red-100">
                        {error}
                     </div>
                </div>
            )}
        </div>

        {/* Footer & Action */}
        <div className="px-4 py-3 bg-violet-50/50 border-t border-violet-100 rounded-b-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-400 text-[10px]">
                <Sparkles className="w-3 h-3" />
                <span>Refine with Gemini Pro</span>
            </div>

            <button
             onClick={onPolish}
             disabled={isLoading || !targetText.trim()}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
               isLoading || !targetText.trim()
                 ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                 : 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 hover:border-violet-300 shadow-sm hover:shadow'
             }`}
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
             Polish / Proofread
           </button>
        </div>
      </div>

    </div>
  );
};

export default TranslationArea;