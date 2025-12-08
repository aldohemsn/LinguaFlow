import React from 'react';
import { Languages, Sparkles, LogOut } from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">LinguaFlow</h1>
            <p className="text-xs text-slate-500 font-medium">AI Translation Suite</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <a 
             href="https://ai.google.dev/" 
             target="_blank" 
             rel="noreferrer"
             className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
           >
             <Sparkles className="w-4 h-4" />
             <span>Powered by Gemini</span>
           </a>
           
           {onLogout && (
             <button
               onClick={onLogout}
               className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
               title="Log Out"
             >
               <LogOut className="w-4 h-4" />
               <span className="hidden sm:inline">Log Out</span>
             </button>
           )}
        </div>
      </div>
    </header>
  );
};

export default Header;