'use client';

import React, { useState } from 'react';
import { LectureData, StudyFolder } from '@/types';
import { 
  Folder, 
  FolderOpen, 
  FolderPlus, 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

interface FoldersViewProps {
  folders: StudyFolder[];
  notes: LectureData[];
  selectedFolderId?: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onOpenNote: (note: LectureData) => void;
  onNewNoteInFolder: (folderName: string) => void;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  folders,
  notes,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onOpenNote,
  onNewNoteInFolder
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');

  const activeFolder = folders.find(f => f.id === selectedFolderId || f.name === selectedFolderId);

  const folderColors = [
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Purple', value: '#8b5cf6' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Sky', value: '#0ea5e9' }
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setIsCreateModalOpen(false);
  };

  // If a folder is opened (Folder Detail View)
  if (activeFolder) {
    const notesInFolder = notes.filter(n => n.folder === activeFolder.name);

    return (
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <button
            onClick={() => onSelectFolder(null)}
            className="hover:text-indigo-600 transition flex items-center gap-1 font-medium"
          >
            <Folder className="h-3.5 w-3.5" />
            <span>Folders</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" style={{ color: activeFolder.color || '#6366f1' }} />
            {activeFolder.name}
          </span>
        </div>

        {/* Folder Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm text-white"
              style={{ backgroundColor: activeFolder.color || '#6366f1' }}
            >
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {activeFolder.name}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500">
                {notesInFolder.length} study note{notesInFolder.length !== 1 ? 's' : ''} organized in this folder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewNoteInFolder(activeFolder.name)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note Here</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete the folder "${activeFolder.name}"?`)) {
                  onDeleteFolder(activeFolder.id);
                  onSelectFolder(null);
                }
              }}
              className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-red-300 hover:text-red-500 dark:border-zinc-800 transition"
              title="Delete Folder"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notes in this Folder */}
        {notesInFolder.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              This folder is empty
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              Create a new note in this folder or move existing study notes from your library.
            </p>
            <button
              onClick={() => onNewNoteInFolder(activeFolder.name)}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Note in {activeFolder.name}</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {notesInFolder.map(n => (
              <div
                key={n.id}
                onClick={() => onOpenNote(n)}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {n.subject}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3" />
                      {n.date}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">
                    {n.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                    {n.summary}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>{n.flashcards.length} Cards</span>
                    <span>{n.quiz.length} Quizzes</span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition">
                    Open Note →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Folders Overview (Grid of all folders)
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Study Folders
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Organize lecture notes, exam prep, and research materials into categorized workspaces.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Folders Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map(fld => {
          const notesCount = notes.filter(n => n.folder === fld.name).length;

          return (
            <div
              key={fld.id}
              onClick={() => onSelectFolder(fld.id)}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: fld.color || '#6366f1' }}
                  >
                    <Folder className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-indigo-600 transition">
                    View Folder →
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">
                  {fld.name}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {notesCount} note{notesCount !== 1 ? 's' : ''} stored
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80 text-[10px] text-zinc-400">
                <span>Created {fld.createdAt}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Folder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Create New Folder
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Organize your courses and study materials.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Prep, Thesis, Semester 2"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {folderColors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewFolderColor(c.value)}
                      className={`h-7 w-7 rounded-full transition-transform ${newFolderColor === c.value ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
