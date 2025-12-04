import React from 'react';
import { TranslationMode } from '../types';
import { Zap, Feather } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: TranslationMode;
  onModeChange: (mode: TranslationMode) => void;
  disabled?: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
  return (
    <div className="bg-slate-100 p-1.5 rounded-xl inline-flex w-full sm:w-auto">
      <button
        onClick={() => onModeChange(TranslationMode.TRANSLATOR)}
        disabled={disabled}
        className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          currentMode === TranslationMode.TRANSLATOR
            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
      >
        <Zap className={`w-4 h-4 ${currentMode === TranslationMode.TRANSLATOR ? 'fill-indigo-600' : ''}`} />
        <span>Fast Translator</span>
      </button>

      <button
        onClick={() => onModeChange(TranslationMode.PROOFREADER)}
        disabled={disabled}
        className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
          currentMode === TranslationMode.PROOFREADER
            ? 'bg-white text-violet-600 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
      >
        <Feather className={`w-4 h-4 ${currentMode === TranslationMode.PROOFREADER ? 'fill-violet-600' : ''}`} />
        <span>Pro Proofreader</span>
      </button>
    </div>
  );
};

export default ModeSelector;