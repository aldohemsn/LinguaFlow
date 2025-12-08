import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TranslationArea from './components/TranslationArea';
import ContextPanel from './components/ContextPanel';
import { TranslationMode, TextPurpose } from './types';
import { generateTranslation } from './services/geminiService';
import { Users } from 'lucide-react';

const SUGGESTED_AUDIENCES = [
  'General Public',
  'Legal Professionals',
  'Academic Researchers',
  'Business Executives',
  'Tech Developers',
  'Marketing Specialists',
  'Literary Critics'
];

const App: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetAudience, setTargetAudience] = useState('');
  const [context, setContext] = useState('');
  const [textPurpose, setTextPurpose] = useState<TextPurpose>(TextPurpose.INFORMATIVE);

  // Action 1: Translate (Source -> Target)
  const handleTranslateAction = useCallback(async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use TRANSLATOR mode for the initial draft
      const result = await generateTranslation(
        sourceText, 
        TranslationMode.TRANSLATOR, 
        targetAudience, 
        context, 
        textPurpose
      );
      setTargetText(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, targetAudience, context, textPurpose]);

  // Action 2: Polish (Target -> Target)
  const handlePolishAction = useCallback(async () => {
    if (!targetText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use POLISH mode to refine the existing draft
      const result = await generateTranslation(
        targetText, 
        TranslationMode.POLISH, 
        targetAudience, 
        context, 
        textPurpose
      );
      setTargetText(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [targetText, targetAudience, context, textPurpose]);

  const handleClear = useCallback(() => {
    setSourceText('');
    setTargetText('');
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9 order-2 xl:order-1">
                 {/* Main Dual-Pane Interface */}
                <TranslationArea 
                    isLoading={isLoading}
                    sourceText={sourceText}
                    targetText={targetText}
                    error={error}
                    onSourceChange={setSourceText}
                    onTargetChange={setTargetText}
                    onTranslate={handleTranslateAction}
                    onPolish={handlePolishAction}
                    onClear={handleClear}
                />
            </div>
            
            <div className="xl:col-span-3 order-1 xl:order-2 space-y-6">
                 {/* Sidebar Controls */}
                 
                 {/* Context Panel */}
                 <ContextPanel 
                    context={context} 
                    onContextChange={setContext}
                    purpose={textPurpose}
                    onPurposeChange={setTextPurpose}
                    disabled={isLoading}
                 />

                 {/* Audience Input (Always visible now as it applies to Polishing) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <label htmlFor="audience-input" className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Target Audience / Persona
                    </label>
                    <div className="relative">
                    <input
                        id="audience-input"
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Investors, Students..."
                        className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-sm transition-all"
                    />
                    </div>
                    
                    {/* Audience Suggestions */}
                    <div className="mt-3">
                    <span className="text-xs text-slate-500 block mb-2">Suggestions:</span>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTED_AUDIENCES.map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => setTargetAudience(suggestion)}
                            className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all duration-200 ${
                            targetAudience === suggestion
                                ? 'bg-violet-100 border-violet-200 text-violet-700 font-medium'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50'
                            }`}
                        >
                            {suggestion}
                        </button>
                        ))}
                    </div>
                    </div>
                </div>
            </div>
        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} LinguaFlow. Built with Google Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;