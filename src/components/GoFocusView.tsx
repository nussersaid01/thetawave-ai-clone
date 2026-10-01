'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckSquare } from 'lucide-react';

export const GoFocusView: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      if (mode === 'study') {
        setMode('break');
        setSecondsLeft(5 * 60);
      } else {
        setMode('study');
        setSecondsLeft(25 * 60);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const setStudyMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setSecondsLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalSeconds = mode === 'study' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-8 text-center">
      
      {/* Mode Selector */}
      <div className="mb-8 flex items-center gap-2 rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-900">
        <button
          onClick={() => setStudyMode('study')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            mode === 'study'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
          }`}
        >
          25m Focus Session
        </button>
        <button
          onClick={() => setStudyMode('break')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            mode === 'break'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
          }`}
        >
          5m Quick Break
        </button>
      </div>

      {/* Circular Timer Visual */}
      <div className="relative flex h-72 w-72 items-center justify-center rounded-full border-8 border-zinc-100 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center">
          <span className="text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {timeFormatted}
          </span>
          <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {mode === 'study' ? 'Theta Wave Focus' : 'Rest & Recharge'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={toggleTimer}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 transition hover:bg-indigo-700"
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>

        <button
          onClick={resetTimer}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title="Toggle Ambient Audio"
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition ${
            soundEnabled
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
              : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Focus Advice */}
      <div className="mt-10 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 max-w-sm">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>ThetaWave Focus Science</span>
        </div>
        <p>
          Studying in 25-minute sprints synchronizes with natural ultradian rhythm peaks, preventing mental fatigue while accelerating memory consolidation.
        </p>
      </div>

    </div>
  );
};
