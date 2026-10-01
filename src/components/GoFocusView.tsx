'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bell, 
  Headphones 
} from 'lucide-react';
import { 
  startAmbientSound, 
  stopAmbientSound, 
  playCompletionChime, 
  setAmbientVolume 
} from '@/lib/focusAudio';

export const GoFocusView: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.35);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      playCompletionChime();
      if (mode === 'study') {
        setMode('break');
        setSecondsLeft(5 * 60);
        if (soundEnabled) {
          startAmbientSound('break', volume);
        }
      } else {
        setMode('study');
        setSecondsLeft(25 * 60);
        if (soundEnabled) {
          startAmbientSound('study', volume);
        }
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, soundEnabled, volume]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const setStudyMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setSecondsLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
    if (soundEnabled) {
      startAmbientSound(newMode, volume);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      startAmbientSound(mode, volume);
    } else {
      stopAmbientSound();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const totalSeconds = mode === 'study' ? 25 * 60 : 5 * 60;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - (totalSeconds - secondsLeft) / totalSeconds);

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

      {/* Circular Timer Visual with Animated SVG Progress Ring */}
      <div className="relative flex h-72 w-72 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r={radius}
            className="stroke-zinc-100 dark:stroke-zinc-800/80"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="144"
            cy="144"
            r={radius}
            className={`transition-all duration-1000 ease-linear ${
              mode === 'study' ? 'stroke-indigo-600' : 'stroke-emerald-500'
            }`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="relative flex flex-col items-center justify-center rounded-full h-60 w-60 bg-white shadow-xl dark:bg-zinc-900">
          <span className="text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {timeFormatted}
          </span>
          <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
            mode === 'study' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {mode === 'study' ? 'Theta Wave Focus' : 'Rest & Recharge'}
          </span>
          {soundEnabled && (
            <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {mode === 'study' ? 'Theta 6Hz Beat Active' : 'Zen Waves Active'}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={toggleTimer}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl transition cursor-pointer ${
            mode === 'study'
              ? 'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700'
              : 'bg-emerald-600 shadow-emerald-500/25 hover:bg-emerald-700'
          }`}
          title={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>

        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Matikan Bunyi (Mute)' : 'Hidupkan Bunyi Gelombang Minda (Ambient Audio)'}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition cursor-pointer ${
            soundEnabled
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
              : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5 animate-pulse" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Sound Settings & Presets */}
      <div className="mt-4 flex flex-col items-center gap-2">
        {soundEnabled && (
          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-2 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/40">
            <span className="flex items-center gap-1.5 font-medium text-indigo-700 dark:text-indigo-300">
              <Headphones className="h-3.5 w-3.5" />
              <span>
                {mode === 'study' 
                  ? 'Theta Binaural Beat (6Hz) & Pink Noise' 
                  : 'Zen 432Hz Calming Relaxation Waves'}
              </span>
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-indigo-200 dark:border-indigo-800 pl-3">
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-indigo-600 h-1 cursor-pointer"
                title={`Kelantangan: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => playCompletionChime()}
          className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-1 cursor-pointer"
        >
          <Bell className="h-3 w-3" />
          <span>Uji Bunyi Loceng Tamat (Test Chime)</span>
        </button>
      </div>

      {/* Focus Advice */}
      <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 max-w-sm">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>ThetaWave Focus Science</span>
        </div>
        <p>
          {mode === 'study'
            ? 'Gelombang Theta (4-7Hz) merangsang keadaan aliran minda (deep flow) dan fokus mendalam bagi mempercepatkan hafalan nota kuliah.'
            : 'Fasa rehat 5 minit dengan frekuensi 432Hz membantu sistem saraf parasimpatetik menenangkan otak sebelum memulakan sesi fokus seterusnya.'}
        </p>
      </div>

    </div>
  );
};
