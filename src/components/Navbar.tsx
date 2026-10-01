'use client';

import React from 'react';
import { 
  FileText, 
  GitFork, 
  Layers, 
  HelpCircle, 
  Timer, 
  Mic, 
  Upload, 
  MessageSquare,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { LectureData } from '@/types';

interface NavbarProps {
  activeTab: 'notes' | 'mindmap' | 'flashcards' | 'quiz' | 'focus';
  setActiveTab: (tab: 'notes' | 'mindmap' | 'flashcards' | 'quiz' | 'focus') => void;
  currentLecture: LectureData;
  onOpenRecorder: () => void;
  onOpenFileUpload: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onBackToDashboard: () => void;
  onSwitchSample: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentLecture,
  onOpenRecorder,
  onOpenFileUpload,
  onToggleChat,
  isChatOpen,
  onBackToDashboard,
  onSwitchSample,
  isDarkMode = false,
  onToggleTheme
}) => {
  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'mindmap', label: 'Mind Map', icon: GitFork },
    { id: 'flashcards', label: `Flashcards (${currentLecture.flashcards.length})`, icon: Layers },
    { id: 'quiz', label: `Quiz (${currentLecture.quiz.length})`, icon: HelpCircle },
    { id: 'focus', label: 'GoFocus', icon: Timer },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left: Back button & Lecture Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="hidden h-5 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />

          {/* Active Lecture Title */}
          <div className="max-w-[180px] sm:max-w-xs md:max-w-md truncate text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">Active: </span>
            {currentLecture.title}
          </div>
        </div>

        {/* Center: Mode Tabs */}
        <nav className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Switch Sample */}
          <button
            onClick={onSwitchSample}
            title="Switch demo lecture topic"
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
            <span>Topic</span>
          </button>

          {/* Upload */}
          <button
            onClick={onOpenFileUpload}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Record */}
          <button
            onClick={onOpenRecorder}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700"
          >
            <Mic className="h-3.5 w-3.5 animate-pulse" />
            <span>Record</span>
          </button>

          {/* Ask AI */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isChatOpen
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition-colors"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
