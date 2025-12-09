
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import TranslationArea from './components/TranslationArea';
import ContextPanel from './components/ContextPanel';
import PassphraseModal from './components/PassphraseModal';
import { TranslationMode, TextPurpose } from './types';
import { generateTranslation } from './services/geminiService';
import { getStoredPassphrase, setStoredPassphrase } from './services/authService';
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
  // State initialization
  const [passphrase, setPassphrase] = useState(() => getStoredPassphrase());
  const [sourceText, setSourceText] = useState(() => localStorage.getItem('linguaFlow_sourceText') || '');
  const [targetText, setTargetText] = useState(() => localStorage.getItem('linguaFlow_targetText') || '');
  const [targetAudience, setTargetAudience] = useState(() => localStorage.getItem('linguaFlow_targetAudience') || '');
  const [context, setContext] = useState(() => localStorage.getItem('linguaFlow_context') || '');
  const [textPurpose, setTextPurpose] = useState<TextPurpose>(() => {
    const savedPurpose = localStorage.getItem('linguaFlow_textPurpose');
    return (savedPurpose as TextPurpose) || TextPurpose.INFORMATIVE;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workflowStep, setWorkflowStep] = useState(0); // 0: Idle, 1: Analyzed, 2: Deconstructed, 3: Completed
  const [backgroundSummary, setBackgroundSummary] = useState('');
  const [laymanLogic, setLaymanLogic] = useState('');

  // Effects to save state
  useEffect(() => {
    setStoredPassphrase(passphrase);
  }, [passphrase]);

  useEffect(() => {
    localStorage.setItem('linguaFlow_sourceText', sourceText);
  }, [sourceText]);

  useEffect(() => {
    localStorage.setItem('linguaFlow_targetText', targetText);
  }, [targetText]);

  useEffect(() => {
    localStorage.setItem('linguaFlow_targetAudience', targetAudience);
  }, [targetAudience]);

  useEffect(() => {
    localStorage.setItem('linguaFlow_context', context);
  }, [context]);

  useEffect(() => {
    localStorage.setItem('linguaFlow_textPurpose', textPurpose);
  }, [textPurpose]);

  const handleTranslateAction = useCallback(async () => {
    if (!sourceText.trim()) return;

    if (workflowStep === 3) {
      // Already complete, maybe prevent re-running or reset?
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (workflowStep === 0) {
        // Step 1: Insight Mode (Contextualization)
        const summary = await generateTranslation(sourceText, TranslationMode.BACKGROUND_SUMMARY);

        // Save raw result and display it for editing
        setBackgroundSummary(summary);
        setContext(summary); // Also set global context
        setTargetText(summary); // Show in target area for user review/edit

        setWorkflowStep(1);
      } else if (workflowStep === 1) {
        // Step 2: Deconstruction (Layman Logic)
        // CRITICAL: Use the *edited* targetText from Step 1 as the context for Step 2
        const editedSummary = targetText;
        setBackgroundSummary(editedSummary);
        setContext(editedSummary);

        const logic = await generateTranslation(sourceText, TranslationMode.DECONSTRUCT, targetAudience, editedSummary);

        // Save raw result and display for editing
        setLaymanLogic(logic);
        setTargetText(logic); // Show in target area for user review/edit

        setWorkflowStep(2);
      } else if (workflowStep === 2) {
        // Step 3: Reconstruction (Final Translation)
        // CRITICAL: Use the *edited* targetText from Step 2 as the Logic for Step 3
        const editedLogic = targetText;
        setLaymanLogic(editedLogic);

        // Combine the (potentially edited) summary and logic
        const combinedContext = `BACKGROUND INSIGHTS:\n${backgroundSummary}\n\nVERIFIED LOGIC:\n${editedLogic}`;

        const final = await generateTranslation(sourceText, TranslationMode.RECONSTRUCT, targetAudience, combinedContext, textPurpose);
        setTargetText(final);

        setWorkflowStep(3);
      }
    } catch (err: any) {
      setError(err.message || "Workflow error");
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, workflowStep, targetText, backgroundSummary, laymanLogic, targetAudience, textPurpose]);

  const handlePolishAction = useCallback(async () => {
    if (!targetText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateTranslation(
        targetText,
        TranslationMode.POLISH,
        targetAudience,
        context,
        textPurpose
      );
      setTargetText(result);
    } catch (err: any) {
      setError(err.message || "Polish failed");
    } finally {
      setIsLoading(false);
    }
  }, [targetText, targetAudience, context, textPurpose]);

  const handleClear = useCallback(() => {
    setSourceText('');
    setTargetText('');
    setTargetAudience('');
    setContext('');
    setTextPurpose(TextPurpose.INFORMATIVE);
    setError(null);

    setWorkflowStep(0);
    setBackgroundSummary('');
    setLaymanLogic('');

    localStorage.removeItem('linguaFlow_sourceText');
    localStorage.removeItem('linguaFlow_targetText');
    localStorage.removeItem('linguaFlow_targetAudience');
    localStorage.removeItem('linguaFlow_context');
    localStorage.removeItem('linguaFlow_textPurpose');

  }, []);

  const handleLogout = useCallback(() => {
    setPassphrase('');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!passphrase && <PassphraseModal onSubmit={setPassphrase} />}
      <Header onLogout={passphrase ? handleLogout : undefined} />
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-9 order-2 xl:order-1">
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
              workflowStep={workflowStep}
            />
          </div>

          <div className="xl:col-span-3 order-1 xl:order-2 space-y-6">
            <ContextPanel
              context={context}
              onContextChange={setContext}
              purpose={textPurpose}
              onPurposeChange={setTextPurpose}
              disabled={isLoading}
            />

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

              <div className="mt-3">
                <span className="text-xs text-slate-500 block mb-2">Suggestions:</span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_AUDIENCES.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setTargetAudience(suggestion)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all duration-200 ${targetAudience === suggestion
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
    </div >
  );
};

export default App;