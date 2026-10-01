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
  CloudRain,
  Waves,
  Coffee,
  Headphones,
  ArrowLeft
} from 'lucide-react';
import { 
  startAmbientSound, 
  stopAmbientSound, 
  playCompletionChime, 
  setAmbientVolume,
  SoundScapeType 
} from '@/lib/focusAudio';

interface GoFocusViewProps {
  onBackToDashboard?: () => void;
}

export const GoFocusView: React.FC<GoFocusViewProps> = ({ onBackToDashboard }) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundScape, setSoundScape] = useState<SoundScapeType>('rain');
  const [volume, setVolume] = useState(0.4);

  // Sync default soundscape to mode
  useEffect(() => {
    if (mode === 'break') {
      setSoundScape('ocean'); // 5m Quick Break defaults to calming ocean waves
    } else {
      setSoundScape('rain');  // 25m Focus defaults to cozy rain patter
    }
  }, [mode]);

  // Main countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      // Session finished! Play completion bell chime
      playCompletionChime();
      stopAmbientSound();

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

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  // Handle Play / Pause button
  const toggleTimer = () => {
    const nextActive = !isActive;
    setIsActive(nextActive);

    if (nextActive) {
      if (soundEnabled) {
        startAmbientSound(soundScape, volume);
      }
    } else {
      stopAmbientSound();
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    stopAmbientSound();
    setSecondsLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  // Switch between 25m Focus and 5m Quick Break
  const setStudyMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    stopAmbientSound();
    setSecondsLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
    const newSound: SoundScapeType = newMode === 'study' ? 'rain' : 'ocean';
    setSoundScape(newSound);
  };

  // Toggle audio speaker button
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);

    if (nextState) {
      startAmbientSound(soundScape, volume);
    } else {
      stopAmbientSound();
    }
  };

  // Switch soundscape preset (Rain, Ocean, Brown Noise, Theta Wave)
  const changeSoundScape = (newSound: SoundScapeType) => {
    setSoundScape(newSound);
    if (soundEnabled) {
      startAmbientSound(newSound, volume);
    }
  };

  // Adjust volume
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
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center px-4 py-4 sm:py-8 text-center select-none">
      
      {/* Top Mobile Bar with Back Button */}
      {onBackToDashboard && (
        <div className="w-full flex items-center justify-start mb-3 sm:mb-4 md:hidden">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
        </div>
      )}

      {/* Mode Selector (25m Focus / 5m Break) */}
      <div className="mb-4 sm:mb-8 flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-zinc-100 p-1 sm:p-1.5 dark:bg-zinc-900 shadow-inner">
        <button
          onClick={() => setStudyMode('study')}
          className={`rounded-xl px-3.5 sm:px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            mode === 'study'
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
          }`}
        >
          25m Focus Session
        </button>
        <button
          onClick={() => setStudyMode('break')}
          className={`rounded-xl px-3.5 sm:px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
            mode === 'break'
              ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-800 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
          }`}
        >
          5m Quick Break
        </button>
      </div>

      {/* Circular Timer Visual with Scalable Responsive SVG Ring */}
      <div className="relative flex h-60 w-60 sm:h-72 sm:w-72 items-center justify-center my-2 sm:my-3">
        <svg 
          viewBox="0 0 288 288"
          className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
        >
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

        <div className="relative flex flex-col items-center justify-center rounded-full h-48 w-48 sm:h-60 sm:w-60 bg-white shadow-xl dark:bg-zinc-900">
          <span className="text-5xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {timeFormatted}
          </span>
          <span className={`mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
            mode === 'study' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {mode === 'study' ? 'Theta Wave Focus' : 'Rest & Recharge'}
          </span>
          
          {soundEnabled && (
            <span className="mt-1 sm:mt-1.5 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
              <span>
                {isActive ? 'Playing' : 'Paused'}: {
                  soundScape === 'rain' ? '🌧️ Cozy Rain' :
                  soundScape === 'ocean' ? '🌊 Ocean Waves' :
                  soundScape === 'brown' ? '☕ Deep Brown' :
                  '🎧 Theta 6Hz'
                }
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="mt-4 sm:mt-8 flex items-center gap-3 sm:gap-4">
        {/* Play / Pause Button */}
        <button
          onClick={toggleTimer}
          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-lg sm:shadow-xl transition-all cursor-pointer ${
            mode === 'study'
              ? 'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-700'
              : 'bg-emerald-600 shadow-emerald-500/25 hover:bg-emerald-700'
          }`}
          title={isActive ? 'Pause Session & Audio' : 'Start Session & Audio'}
        >
          {isActive ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />}
        </button>

        {/* Reset Button */}
        <button
          onClick={resetTimer}
          title="Reset Timer"
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Sound Toggle (Speaker) */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Ambient Audio' : 'Play Ambient Soundscape'}
          className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-sm transition-all cursor-pointer ${
            soundEnabled
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 ring-2 ring-indigo-500/20'
              : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 hover:border-zinc-300'
          }`}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>
      </div>

      {/* Sound Selection Chips & Volume Controls */}
      <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2.5 sm:gap-3 w-full px-2">
        {/* Preset Sound Chips (Grid on Mobile, Row on Desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-1.5 sm:gap-2 w-full max-w-sm">
          <button
            onClick={() => changeSoundScape('rain')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundScape === 'rain'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            <CloudRain className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Cozy Rain</span>
          </button>

          <button
            onClick={() => changeSoundScape('ocean')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundScape === 'ocean'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            <Waves className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Ocean Waves</span>
          </button>

          <button
            onClick={() => changeSoundScape('brown')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundScape === 'brown'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            <Coffee className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Deep Brown</span>
          </button>

          <button
            onClick={() => changeSoundScape('binaural')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              soundScape === 'binaural'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            <Headphones className="h-3.5 w-3.5 text-purple-500 shrink-0" />
            <span className="truncate">Theta Wave</span>
          </button>
        </div>

        {/* Volume Slider when Sound is Enabled */}
        {soundEnabled && (
          <div className="flex items-center gap-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-700 text-xs">
            <span className="text-[11px] font-medium text-zinc-500">Volume:</span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 sm:w-28 accent-indigo-600 h-1 cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 font-semibold w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}

        {/* Test Chime Button */}
        <button
          type="button"
          onClick={() => playCompletionChime()}
          className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-0.5 cursor-pointer"
        >
          <Bell className="h-3 w-3" />
          <span>Test Completion Bell</span>
        </button>
      </div>

      {/* Focus Advice */}
      <div className="mt-5 sm:mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3 sm:p-4 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 max-w-sm">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>ThetaWave Focus Science</span>
        </div>
        <p className="text-[11px] sm:text-xs leading-relaxed">
          {mode === 'study'
            ? 'Gentle rainfall and low-frequency ambient sounds mask background distractions, guiding your brain into a state of deep, uninterrupted academic flow.'
            : 'A 5-minute break with calming soundscapes resets parasympathetic tone, reducing cognitive fatigue before your next study session.'}
        </p>
      </div>

    </div>
  );
};
