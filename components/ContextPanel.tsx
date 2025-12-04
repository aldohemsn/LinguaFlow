import React, { useRef, useState } from 'react';
import { FileText, Upload, Loader2, Sparkles, X, Target } from 'lucide-react';
import { extractTextFromFile } from '../utils/fileUtils';
import { inferContext } from '../services/geminiService';
import { TextPurpose, TEXT_PURPOSE_DETAILS } from '../types';

interface ContextPanelProps {
  context: string;
  onContextChange: (context: string) => void;
  purpose: TextPurpose;
  onPurposeChange: (purpose: TextPurpose) => void;
  disabled?: boolean;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ 
  context, 
  onContextChange, 
  purpose,
  onPurposeChange,
  disabled 
}) => {
  const [isInferring, setIsInferring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInferring(true);
    setError(null);

    try {
      // 1. Extract text
      const text = await extractTextFromFile(file);
      
      // 2. Infer context via Gemini
      const inferredContext = await inferContext(text);
      
      onContextChange(inferredContext);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsInferring(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onContextChange('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 transition-all">
      
      {/* Purpose Selector */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-rose-500" />
          Text Purpose (Reiss's Typology)
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(TextPurpose).map((p) => (
            <button
              key={p}
              onClick={() => onPurposeChange(p)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                purpose === p
                  ? 'bg-rose-50 border-rose-200 text-rose-700 font-medium ring-1 ring-rose-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={TEXT_PURPOSE_DETAILS[p].description}
            >
              <span className="text-lg mb-1">{TEXT_PURPOSE_DETAILS[p].icon}</span>
              <span>{TEXT_PURPOSE_DETAILS[p].label}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 px-1">
          {TEXT_PURPOSE_DETAILS[purpose].description}
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Translation Context
        </h3>
        <div className="flex items-center gap-2">
           <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isInferring}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {isInferring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {isInferring ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.docx"
        className="hidden"
      />

      <div className="relative">
        <textarea
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="Describe the context (e.g., 'A legal contract for software licensing', 'A casual chat between friends'). Or upload a file to auto-detect."
          className="w-full px-3 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y min-h-[80px]"
          disabled={disabled || isInferring}
        />
        {context && (
           <button 
             onClick={handleClear}
             className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
           >
             <X className="w-3 h-3" />
           </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500 animate-in fade-in">
          {error}
        </p>
      )}
      
      {!context && !isInferring && !error && (
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
             <Sparkles className="w-3 h-3" />
             Upload a .txt or .docx file (e.g. the full article) to automatically extract context.
          </p>
      )}
      
      {isInferring && (
         <p className="mt-2 text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Gemini is reading your document and summarizing the context...
         </p>
      )}
    </div>
  );
};

export default ContextPanel;