import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import TranslationArea from './components/TranslationArea';
import ContextPanel from './components/ContextPanel';
import { TranslationMode, TextPurpose } from './types';
import { generateTranslation } from './services/geminiService';
import { Info, Users } from 'lucide-react';

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
  const [mode, setMode] = useState<TranslationMode>(TranslationMode.TRANSLATOR);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState('');
  const [context, setContext] = useState('');
  const [textPurpose, setTextPurpose] = useState<TextPurpose>(TextPurpose.INFORMATIVE);
  
  // Store the last input text to re-trigger translation on mode switch if needed
  const [lastInput, setLastInput] = useState('');
  
  // Ref for debouncing updates
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTranslate = useCallback(async (
    text: string, 
    currentMode: TranslationMode, 
    currentAudience: string, 
    currentContext: string,
    currentPurpose: TextPurpose
  ) => {
    setLastInput(text);
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateTranslation(text, currentMode, currentAudience, currentContext, currentPurpose);
      setTranslatedText(result);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Wrapper for TranslationArea which only passes text
  const onTranslateText = useCallback((text: string) => {
    handleTranslate(text, mode, targetAudience, context, textPurpose);
  }, [handleTranslate, mode, targetAudience, context, textPurpose]);

  const handleModeChange = (newMode: TranslationMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    
    // If there is text, re-translate automatically with the new mode
    if (lastInput.trim()) {
        setTranslatedText(''); // Clear previous result visually
        handleTranslate(lastInput, newMode, targetAudience, context, textPurpose);
    }
  };

  const triggerDebouncedTranslation = (newText: string, newMode: TranslationMode, newAudience: string, newContext: string, newPurpose: TextPurpose) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (newText.trim()) {
        debounceRef.current = setTimeout(() => {
            handleTranslate(newText, newMode, newAudience, newContext, newPurpose);
        }, 1000);
      }
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAudience = e.target.value;
    setTargetAudience(newAudience);
    triggerDebouncedTranslation(lastInput, mode, newAudience, context, textPurpose);
  };

  const handleContextChange = (newContext: string) => {
    setContext(newContext);
    triggerDebouncedTranslation(lastInput, mode, targetAudience, newContext, textPurpose);
  };
  
  const handlePurposeChange = (newPurpose: TextPurpose) => {
    setTextPurpose(newPurpose);
    // Determine if we should trigger immediately or debounce. 
    // Usually clicking a button is intentional, so immediate is better, but consistency with other inputs?
    // Let's trigger immediately if we have text.
    if (lastInput.trim()) {
      handleTranslate(lastInput, mode, targetAudience, context, newPurpose);
    }
  };

  const applyAudienceSuggestion = (suggestion: string) => {
    setTargetAudience(suggestion);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Apply immediately without debounce for better UX on click
    if (lastInput.trim()) {
      handleTranslate(lastInput, mode, suggestion, context, textPurpose);
    }
  };

  const handleClear = useCallback(() => {
    setLastInput('');
    setTranslatedText('');
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="max-w-xl">
             <h2 className="text-2xl font-bold text-slate-900 mb-2">
               {mode === TranslationMode.TRANSLATOR ? 'AI Translator' : 'AI Proofreader'}
             </h2>
             <p className="text-slate-500 text-sm leading-relaxed">
               {mode === TranslationMode.TRANSLATOR 
                 ? 'Powered by Gemini Flash Lite. Delivers fast, accurate, and literal bi-directional translation (EN↔ZH).' 
                 : 'Powered by Gemini Pro. Polishes the draft into native-level target language.'}
             </p>
          </div>
          <ModeSelector 
            currentMode={mode} 
            onModeChange={handleModeChange} 
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 order-2 lg:order-1">
                 {/* Main Interface */}
                <TranslationArea 
                    mode={mode}
                    isLoading={isLoading}
                    translatedText={translatedText}
                    error={error}
                    onTranslate={onTranslateText}
                    onClear={handleClear}
                />
            </div>
            
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                 {/* Context Panel */}
                 <ContextPanel 
                    context={context} 
                    onContextChange={handleContextChange}
                    purpose={textPurpose}
                    onPurposeChange={handlePurposeChange}
                    disabled={isLoading}
                 />

                 {/* Audience Input (Proofreader Mode Only) */}
                {mode === TranslationMode.PROOFREADER && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="audience-input" className="block text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-500" />
                    Target Audience / Reader Persona <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                    <input
                        id="audience-input"
                        type="text"
                        value={targetAudience}
                        onChange={handleAudienceChange}
                        placeholder="Who is this for? e.g., Investors, Students..."
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
                            onClick={() => applyAudienceSuggestion(suggestion)}
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
                )}
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