'use client';

import React, { useState, useEffect } from 'react';
import { LectureData } from '@/types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  ArrowRight, 
  BookOpen, 
  LayoutGrid, 
  List,
  Folder
} from 'lucide-react';

interface AllNotesViewProps {
  notes: LectureData[];
  onOpenNote: (note: LectureData) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  activeFilter?: string;
}

export const AllNotesView: React.FC<AllNotesViewProps> = ({
  notes,
  onOpenNote,
  onNewNote,
  onDeleteNote,
  activeFilter: initialFilter = 'All'
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialFilter);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (initialFilter) {
      setSelectedCategory(initialFilter);
    }
  }, [initialFilter]);

  const uniqueSubjects = Array.from(new Set(notes.map(n => n.subject)));
  const uniqueFolders = Array.from(new Set(notes.map(n => n.folder).filter(Boolean))) as string[];
  const allFilters = ['All', ...uniqueSubjects];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                            n.subject === selectedCategory || 
                            n.folder === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-6xl mx-auto w-full">
      
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            All Study Notes
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Manage, review, and search across your entire academic library ({notes.length} total notes).
          </p>
        </div>

        <button
          onClick={onNewNote}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes by title or keywords..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-sm sm:max-w-md">
            {allFilters.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Grid/List Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`rounded p-1 ${layoutMode === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`rounded p-1 ${layoutMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}
              title="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Display */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
          <BookOpen className="h-10 w-10 text-zinc-400 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No notes found
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            Try adjusting your search query or create a new study note.
          </p>
          <button
            onClick={onNewNote}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Note</span>
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {note.subject}
                    </span>
                    {note.folder && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                        <Folder className="h-2.5 w-2.5" />
                        {note.folder}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${note.title}"?`)) {
                        onDeleteNote(note.id);
                      }
                    }}
                    title="Delete Note"
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 
                  onClick={() => onOpenNote(note)}
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer group-hover:text-indigo-600 transition line-clamp-2"
                >
                  {note.title}
                </h3>

                <p className="mt-2 text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                  {note.summary}
                </p>
              </div>

              <div className="mt-5 border-t border-zinc-100 pt-3 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>{note.flashcards.length} Cards</span>
                  <span>{note.quiz.length} Quizzes</span>
                </div>

                <button
                  onClick={() => onOpenNote(note)}
                  className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3 max-w-[70%]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span>{note.subject}</span>
                    {note.folder && <span>· 📁 {note.folder}</span>}
                    <span>· {note.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  {note.flashcards.length} cards · {note.quiz.length} quizzes
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${note.title}"?`)) {
                      onDeleteNote(note.id);
                    }
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-600 transition"
                  title="Delete Note"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
