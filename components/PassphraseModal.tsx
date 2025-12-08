import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { verifyPassphrase } from '../services/authService';

interface PassphraseModalProps {
  onSubmit: (passphrase: string) => void;
}

const PassphraseModal: React.FC<PassphraseModalProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await verifyPassphrase(input.trim());
      if (isValid) {
        onSubmit(input.trim());
      } else {
        setError('Invalid passphrase. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
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
                onChange={(e) => {
                    setInput(e.target.value);
                    setError('');
                }}
                placeholder="Enter passphrase"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none ${error ? 'border-red-500' : 'border-slate-200'}`}
                autoFocus
                disabled={isVerifying}
              />
               {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isVerifying}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
              ) : (
                  'Access App'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PassphraseModal;
