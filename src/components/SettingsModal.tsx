'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Globe, Cpu, Database, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageChange?: (lang: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onLanguageChange }) => {
  const [language, setLanguage] = useState('English (US)');
  const [modelTier, setModelTier] = useState('meta-llama/llama-3.3-70b-instruct:free');
  const [autoSync, setAutoSync] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('thetawave_ai_model');
      if (savedModel) setModelTier(savedModel);
      const savedLang = localStorage.getItem('thetawave_language');
      if (savedLang) setLanguage(savedLang);
      const savedSync = localStorage.getItem('thetawave_autosync');
      if (savedSync !== null) setAutoSync(savedSync === 'true');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('thetawave_ai_model', modelTier);
      localStorage.setItem('thetawave_language', language);
      localStorage.setItem('thetawave_autosync', String(autoSync));
    }
    if (onLanguageChange) {
      onLanguageChange(language);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const isFreeModel = modelTier.endsWith(':free');

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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-medium"
            >
              <option value="English (US)">English (US)</option>
              <option value="Bahasa Melayu">Bahasa Melayu</option>
              <option value="العربية (Arabic)">العربية (Arabic)</option>
              <option value="Tulisan Jawi (جاوي)">Tulisan Jawi (جاوي)</option>
            </select>

            {(language.includes('Arabic') || language.includes('العربية') || language.includes('Jawi') || language.includes('جاوي')) && (
              <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 dark:text-amber-100">
                    💡 Recommended Model for {language.includes('Jawi') || language.includes('جاوي') ? 'Jawi Script' : 'Arabic'}:
                  </p>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                    We recommend selecting at least <strong>Meta LLaMA 3.3 70B (Free)</strong> or <strong>DeepSeek-V3 / R1</strong> for optimal grammar, morphology, and script accuracy.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Model Architecture */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-zinc-500" />
                Default Reasoning Engine
              </label>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isFreeModel 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              }`}>
                {isFreeModel ? '🟢 100% Free' : '⚡ Paid (~$0.0002)'}
              </span>
            </div>
            <select
              value={modelTier}
              onChange={(e) => setModelTier(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-medium"
            >
              <optgroup label="── 🟢 Free Tier ($0.00 Cost) ──">
                <option value="google/gemini-2.0-flash-exp:free">
                  Gemini 2.0 Flash (Free • Ultra Fast)
                </option>
                <option value="meta-llama/llama-3.3-70b-instruct:free">
                  Meta LLaMA 3.3 70B (Free • Smart Academic) [Default]
                </option>
              </optgroup>
              <optgroup label="── ⚡ Paid Tier (High Reasoning & Value) ──">
                <option value="deepseek/deepseek-chat">
                  DeepSeek-V3 (Paid ~$0.0002 • Flagship Core)
                </option>
                <option value="deepseek/deepseek-r1">
                  DeepSeek-R1 (Paid ~$0.0006 • PhD Deep Reasoning & Math)
                </option>
              </optgroup>
            </select>
            <p className="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
              {modelTier === 'google/gemini-2.0-flash-exp:free' && '⚡ Ultra-fast, ideal for rapid summaries and quick flashcards.'}
              {modelTier === 'meta-llama/llama-3.3-70b-instruct:free' && '🎓 Most capable open-source 70B model for deep academic lecture synthesis.'}
              {modelTier === 'deepseek/deepseek-chat' && '🧠 GPT-4o / Claude 3.5 level intelligence at micro cost (~$0.0002/note).'}
              {modelTier === 'deepseek/deepseek-r1' && '🔬 Supreme reasoning engine with step-by-step proofs and complex mathematical derivations.'}
            </p>
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
            onClick={handleSave}
            disabled={isSaved}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition ${
              isSaved ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{isSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
