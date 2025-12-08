import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface PassphraseModalProps {
  onSubmit: (passphrase: string) => void;
}

const PassphraseModal: React.FC<PassphraseModalProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-violet-100 rounded-full">
              <Lock className="w-8 h-8 text-violet-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-center text-slate-500 mb-8">
            Please enter the access passphrase to continue using LinguaFlow.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter passphrase"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access App
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassphraseModal;
