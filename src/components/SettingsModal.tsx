'use client';

import React, { useState } from 'react';
import { X, Settings, Moon, Sun, Globe, Cpu, Database, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState('English (US)');
  const [modelTier, setModelTier] = useState('gemini-2.5-flash');
  const [autoSync, setAutoSync] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Workspace Settings
            </h2>
            <p className="text-[11px] text-zinc-500">
              Personalize your study assistant and AI defaults
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="mt-5 space-y-4 text-xs">
          
          {/* Note Output Language */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              Primary Notes Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="English (US)">English (US)</option>
              <option value="Bahasa Melayu">Bahasa Melayu</option>
              <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              <option value="Japanese">Japanese</option>
              <option value="German">German</option>
            </select>
          </div>

          {/* AI Model Architecture */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-zinc-500" />
              Default Reasoning Engine
            </label>
            <select
              value={modelTier}
              onChange={(e) => setModelTier(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast & Adaptive)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Research & Complex Math)</option>
              <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Advanced Creative Synthesis)</option>
            </select>
          </div>

          {/* Cloud Synchronization */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">Local Vector Cache</p>
                <p className="text-[10px] text-zinc-400">Offline search & fast indexing</p>
              </div>
            </div>
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`h-5 w-9 rounded-full transition-colors relative ${autoSync ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${autoSync ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>

        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Check className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
};
