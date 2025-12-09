
import React, { useState } from 'react';
import { Copy, Check, X, Volume2, Sparkles, ArrowRight, Loader2, Download } from 'lucide-react';

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
  workflowStep: number;
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
  onClear,
  workflowStep,
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

  const getStepLabel = () => {
    switch (workflowStep) {
      case 0: return "Step 1: Get Passage Insight";
      case 1: return "Step 2: Get Layman Logic";
      case 2: return "Step 3: Final Translation";
      case 3: return "Translation Complete";
      default: return "Translate";
    }
  };

  const getStepDescription = () => {
    switch (workflowStep) {
      case 0: return "Analyze domain and terms";
      case 1: return "Deconstruct logic (Helper)";
      case 2: return "Synthesize insights & logic";
      case 3: return "Review final output";
      default: return "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[650px] min-h-[500px]">

      {/* --- Source Column --- */}
      <div className="flex flex-col h-full bg-white rounded-2xl border border-indigo-200 ring-4 ring-indigo-50/50 shadow-sm transition-all duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passage (Source)</span>
            {/* Unified Mode Badge */}
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              Unified Workflow
            </span>
          </div>

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
          placeholder="Paste your specific passage here..."
          value={sourceText}
          onChange={(e) => onSourceChange(e.target.value)}
          spellCheck={false}
        />

        {/* Footer & Action */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">{sourceText.length} chars</span>

          <button
            onClick={onTranslate}
            disabled={isLoading || !sourceText.trim() || workflowStep === 3}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isLoading || !sourceText.trim() || workflowStep === 3
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {getStepLabel()}
          </button>
        </div>
      </div>


      {/* --- Target Column (Wizard View) --- */}
      <div className="flex flex-col h-full bg-white rounded-2xl border border-violet-200 shadow-sm transition-all duration-200">

        {/* Header with Visual Stepper */}
        <div className="flex flex-col border-b border-slate-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                {workflowStep === 1
                  ? "Review Layman Logic (EDITABLE)"
                  : workflowStep === 0 && targetText && targetText.includes("Domain Context")
                    ? "Review Passage Insight (EDITABLE)"
                    : "Target Text"}
                <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">
                  {workflowStep < 3 ? "Editable Translator Aid" : "Final Output"}
                </span>
              </span>
              <div className="text-[10px] text-violet-500 font-medium mt-0.5">
                {getStepDescription()}
              </div>
            </div>

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
                </>
              )}
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex gap-1 px-4 pb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${workflowStep >= 1 ? 'bg-indigo-500' : 'bg-slate-100'}`} title="Context" />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${workflowStep >= 2 ? 'bg-violet-500' : 'bg-slate-100'}`} title="Logic" />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${workflowStep >= 3 ? 'bg-green-500' : 'bg-slate-100'}`} title="Final" />
          </div>
        </div>

        {/* Output/Edit Area */}
        <div className="flex-1 relative">
          <textarea
            className={`w-full h-full p-4 bg-transparent border-none resize-none focus:ring-0 text-slate-800 text-lg leading-relaxed placeholder:text-slate-300 font-mono ${isLoading ? 'opacity-50' : ''}`}
            placeholder="Step-by-step insights will appear here for your review..."
            value={targetText}
            onChange={(e) => onTargetChange(e.target.value)}
            spellCheck={false}
          />

          {/* Overlay hint for what to do */}
          {!isLoading && targetText && workflowStep < 3 && (
            <div className="absolute bottom-4 right-4 pointer-events-none opacity-50">
              <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded text-xs border border-yellow-200 shadow-sm">
                Review & Edit before next step
              </div>
            </div>
          )}

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
            <span>Passage-Oriented Expert Workflow</span>
          </div>

          <button
            onClick={onPolish}
            disabled={isLoading || !targetText.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isLoading || !targetText.trim()
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