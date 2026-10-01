'use client';

import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  BookOpen, 
  Folder, 
  Layers, 
  Clock, 
  Sparkles, 
  Settings, 
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  FolderOpen,
  Plus,
  Crown,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { StudyFolder } from '@/types';

export type ViewMode = 'home' | 'all-notes' | 'learn' | 'chat' | 'sources' | 'focus' | 'folders' | 'workspace';

interface SidebarProps {
  currentView: ViewMode;
  onNavigateHome: () => void;
  onNavigateAllNotes: (filter?: string) => void;
  onNavigateLearn: () => void;
  onNavigateChat: () => void;
  onNavigateSources: () => void;
  onNavigateFocus: () => void;
  onNavigateFolders: (folderName?: string | null) => void;
  notesCount: number;
  subjects?: string[];
  folders?: StudyFolder[];
  notes?: { folder?: string }[];
  isPro?: boolean;
  onOpenUpgrade?: () => void;
  onOpenSettings?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigateHome,
  onNavigateAllNotes,
  onNavigateLearn,
  onNavigateChat,
  onNavigateSources,
  onNavigateFocus,
  onNavigateFolders,
  notesCount,
  subjects = ['Computer Science & AI', 'Biology & Biochemistry', 'Applied Mathematics'],
  folders = [],
  notes = [],
  isPro = false,
  onOpenUpgrade,
  onOpenSettings,
  isDarkMode = false,
  onToggleTheme
}) => {
  const [isCoursesOpen, setIsCoursesOpen] = useState(true);
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-zinc-200/80 bg-[#fbfbfe] p-4 dark:border-zinc-800 dark:bg-zinc-950 shrink-0 select-none overflow-y-auto">
      
      {/* Top Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 mb-6">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              ThetaWave AI
            </span>
          </div>

          <button 
            title="Collapse Sidebar"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {/* 1. Home */}
          <button
            onClick={onNavigateHome}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-[#ede9fe] text-indigo-700 shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>

          {/* 2. All Notes */}
          <button
            onClick={() => onNavigateAllNotes('All')}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              currentView === 'all-notes' || currentView === 'workspace'
                ? 'bg-[#ede9fe] text-indigo-700 font-semibold shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4" />
              <span>All Notes</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
              {notesCount}
            </span>
          </button>

          {/* 3. Learn */}
          <button
            onClick={onNavigateLearn}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              currentView === 'learn'
                ? 'bg-[#ede9fe] text-indigo-700 font-semibold shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4" />
              <span>Learn</span>
            </div>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Active Recall
            </span>
          </button>

          {/* 4. Chat */}
          <button
            onClick={onNavigateChat}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              currentView === 'chat'
                ? 'bg-[#ede9fe] text-indigo-700 font-semibold shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              AI Copilot
            </span>
          </button>

          {/* Expandable Categories */}
          <div className="pt-2 space-y-1">
            
            {/* 5. All Courses Dropdown */}
            <div>
              <button 
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-zinc-500" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">All Courses</span>
                </div>
                {isCoursesOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 transition-transform" />
                )}
              </button>

              {isCoursesOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1 py-1">
                  <button
                    onClick={() => onNavigateAllNotes('All')}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <span>All Courses</span>
                    <span className="text-[10px] text-zinc-400">{notesCount}</span>
                  </button>
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => onNavigateAllNotes(subj)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors text-left"
                    >
                      <span className="truncate pr-1">{subj}</span>
                      <span className="text-[10px] text-zinc-400">●</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Folders Section with dedicated FoldersView navigation */}
            <div>
              <div className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors">
                <button 
                  onClick={() => onNavigateFolders(null)}
                  className={`flex items-center gap-3 flex-1 text-left ${currentView === 'folders' ? 'text-indigo-600 font-bold' : ''}`}
                >
                  <Folder className="h-4 w-4 text-zinc-500" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Folders</span>
                </button>
                <button
                  onClick={() => setIsFoldersOpen(!isFoldersOpen)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 transition"
                  title="Toggle Folders List"
                >
                  {isFoldersOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 transition-transform" />
                  )}
                </button>
              </div>

              {isFoldersOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-zinc-200 dark:border-zinc-800 space-y-1 py-1">
                  {folders.map((fld) => {
                    const count = notes.filter(n => n.folder === fld.name).length;
                    return (
                      <button
                        key={fld.id}
                        onClick={() => onNavigateFolders(fld.name)}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors text-left"
                      >
                        <span className="truncate pr-1 flex items-center gap-1.5">
                          <FolderOpen className="h-3 w-3" style={{ color: fld.color || '#f59e0b' }} />
                          {fld.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7. Sources */}
            <button
              onClick={onNavigateSources}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                currentView === 'sources'
                  ? 'bg-[#ede9fe] text-indigo-700 font-semibold shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span>Sources</span>
              </div>
              <span className="text-[10px] text-zinc-400">Media</span>
            </button>

            {/* 8. Focus Room */}
            <button 
              onClick={onNavigateFocus}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                currentView === 'focus'
                  ? 'bg-[#ede9fe] text-indigo-700 font-semibold shadow-sm dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                <span>Focus Room</span>
              </div>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                New
              </span>
            </button>

          </div>
        </nav>
      </div>

      {/* Bottom Promo, Quota & User Profile */}
      <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-4">
        
        {/* Pro Banner or Upgrade Button */}
        {isPro ? (
          <div className="flex w-full items-center justify-between rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-3 text-left shadow-sm dark:border-amber-700/50">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500 animate-bounce" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                ThetaWave Pro
              </span>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-300">
              ACTIVE
            </span>
          </div>
        ) : (
          <button 
            onClick={onOpenUpgrade}
            className="flex w-full items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/50 p-3 text-left transition hover:border-indigo-300 hover:shadow-sm dark:border-indigo-950 dark:from-indigo-950/30 dark:to-purple-950/30"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Get unlimited notes
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </button>
        )}

        {/* Plan Status Card */}
        {isPro ? (
          <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/40 to-white p-3.5 shadow-sm dark:border-indigo-950 dark:from-indigo-950/30 dark:to-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 fill-indigo-600" />
                Pro Active
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Unlimited
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              {notesCount} notes · High-Tier AI Reasoning
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
              <div className="h-full bg-emerald-500 w-full" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Free Plan</span>
              <button 
                onClick={onOpenUpgrade}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Upgrade
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              {notesCount}/3 notes created
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (notesCount / 3) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* User Account & Controls */}
        <div className="flex items-center justify-between px-1.5 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
              N
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Nusser</p>
              <p className="text-[10px] text-zinc-400">nusser@thetawave.ai</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button 
              onClick={onOpenSettings}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </aside>
  );
};
