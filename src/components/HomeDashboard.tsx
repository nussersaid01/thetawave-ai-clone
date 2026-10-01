'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  PenTool, 
  Search, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Moon, 
  Sun,
  ArrowUp, 
  Layers, 
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Timer
} from 'lucide-react';
import { LectureData } from '@/types';

interface HomeDashboardProps {
  onOpenUpload: () => void;
  onOpenNote: (lecture: LectureData) => void;
  recentNotes: LectureData[];
  onNewEmptyNote: () => void;
  onNavigateFocus?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenUpload,
  onOpenNote,
  recentNotes,
  onNewEmptyNote,
  onNavigateFocus,
  isDarkMode = false,
  onToggleTheme
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = recentNotes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-6xl mx-auto w-full">
      
      {/* Top Header Greeting */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Hello Nusser
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            How can I help you learn today?
          </p>
        </div>

        <button 
          onClick={onToggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="rounded-xl border border-zinc-200/80 bg-white p-2.5 text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition-colors"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Two Main Action Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-10">
        
        {/* Card 1: Upload Source */}
        <div 
          onClick={onOpenUpload}
          className="group relative flex cursor-pointer items-center justify-between rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white to-[#faf8ff] p-7 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/60"
        >
          <div className="max-w-[70%]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">
              Upload Source
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
              Create note from audio, video, pdf, webpage, or lecture slides...
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner group-hover:scale-105 transition-transform dark:bg-indigo-950/60 dark:text-indigo-400">
            <UploadCloud className="h-8 w-8" />
          </div>
        </div>

        {/* Card 2: Write by Myself */}
        <div 
          onClick={onNewEmptyNote}
          className="group relative flex cursor-pointer items-center justify-between rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white to-[#fbfbfe] p-7 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/60"
        >
          <div className="max-w-[70%]">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-purple-600 transition-colors">
              Write by Myself
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
              Create a clean study note from scratch with rich Markdown & LaTeX.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-inner group-hover:scale-105 transition-transform dark:bg-purple-950/60 dark:text-purple-400">
            <PenTool className="h-8 w-8" />
          </div>
        </div>

        {/* Card 3: Go Focus Study Room */}
        {onNavigateFocus && (
          <div 
            onClick={onNavigateFocus}
            className="group relative flex cursor-pointer items-center justify-between rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white to-[#f0fdf4] p-7 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/60 md:col-span-2"
          >
            <div className="max-w-[70%]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                <span>Go Focus Study Room</span>
                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Pomodoro & Audio
                </span>
              </h3>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                25m Focus Sprint & 5m Quick Break with cozy rain, ocean waves, and brown noise.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner group-hover:scale-105 transition-transform dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
              <Timer className="h-8 w-8" />
            </div>
          </div>
        )}

      </div>

      {/* Middle Section: Dig into My Notes Search Bar */}
      <div className="mb-12">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          Dig into My Notes
        </h2>

        <div className="relative rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 px-2">
            <Search className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask questions about your recent courses or search notes..."
              className="w-full bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-2.5 px-1 dark:border-zinc-800/60">
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
              <span>@ All notes</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:text-zinc-400">
              <span>⭐ Starred</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:text-zinc-400">
              <span>📝 Summarize...</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fan of File Cards Visual / Drag to Upload */}
      <div 
        onClick={onOpenUpload}
        className="my-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200/90 bg-[#fafafa]/80 py-10 px-4 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition dark:border-zinc-800 dark:bg-zinc-950/30"
      >
        <div className="flex items-center justify-center gap-1 text-zinc-400 text-xs font-semibold mb-6">
          <ArrowUp className="h-4 w-4" />
          <span>Drag to upload</span>
        </div>

        {/* Floating Format Cards Fan */}
        <div className="relative flex items-center justify-center h-28 w-80 mb-4">
          
          {/* Card 1: DOC (Blue) */}
          <div className="absolute -left-2 transform -rotate-12 h-20 w-16 rounded-xl border border-blue-200 bg-blue-50 p-2 shadow-md flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-blue-600">DOC</span>
            <div className="h-1 w-8 bg-blue-300 rounded" />
          </div>

          {/* Card 2: PPTX (Orange) */}
          <div className="absolute left-14 transform -rotate-6 h-22 w-16 rounded-xl border border-amber-200 bg-amber-50 p-2 shadow-md flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-amber-600">PPTX</span>
            <div className="h-1 w-8 bg-amber-300 rounded" />
          </div>

          {/* Card 3: PDF (Red Centerpiece) */}
          <div className="absolute z-10 h-24 w-18 rounded-xl border border-rose-300 bg-rose-500 text-white p-2.5 shadow-xl flex flex-col justify-between">
            <span className="text-xs font-black">PDF</span>
            <div className="h-1.5 w-10 bg-white/60 rounded" />
          </div>

          {/* Card 4: Image (Green) */}
          <div className="absolute right-14 transform rotate-6 h-22 w-16 rounded-xl border border-emerald-200 bg-emerald-50 p-2 shadow-md flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-emerald-600">IMG</span>
            <div className="h-1 w-8 bg-emerald-300 rounded" />
          </div>

          {/* Card 5: Audio (Purple) */}
          <div className="absolute -right-2 transform rotate-12 h-20 w-16 rounded-xl border border-purple-200 bg-purple-50 p-2 shadow-md flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-purple-600">AUDIO</span>
            <div className="h-1 w-8 bg-purple-300 rounded" />
          </div>

        </div>

        <p className="text-xs text-zinc-500">
          Upload course file: Select a file from various formats to generate notes, mindmaps & quizzes.
        </p>
      </div>

      {/* Recent Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Recent Notes
          </h2>
          <span className="text-xs text-zinc-400">
            {recentNotes.length} notes available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                    {note.subject}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    <span>{note.date}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {note.title}
                </h3>

                <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {note.summary}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/60 text-xs">
                <span className="text-zinc-400 text-[11px]">
                  {note.flashcards.length} Cards · {note.quiz.length} Quizzes
                </span>
                
                <span className="flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform dark:text-indigo-400">
                  Open Note
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
