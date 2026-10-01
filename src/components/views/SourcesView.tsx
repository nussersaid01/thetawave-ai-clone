'use client';

import React from 'react';
import { LectureData } from '@/types';
import { 
  FileText, 
  Music, 
  Video, 
  UploadCloud, 
  CheckCircle, 
  ExternalLink,
  Plus
} from 'lucide-react';

interface SourcesViewProps {
  notes: LectureData[];
  onOpenUpload: () => void;
  onOpenNote: (note: LectureData) => void;
}

export const SourcesView: React.FC<SourcesViewProps> = ({
  notes,
  onOpenUpload,
  onOpenNote
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-5xl mx-auto w-full">
      
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ingested Sources & Media
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            All audio recordings, lecture slides, PDFs, and video links vectorized by ThetaWave AI.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Source</span>
        </button>
      </div>

      {/* Sources Table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold dark:bg-zinc-800/60 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">Source Title</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {notes.map((n, idx) => (
              <tr key={n.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {idx % 2 === 0 ? <Music className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                  </div>
                  <span>{n.title}</span>
                </td>
                <td className="py-3.5 px-4 text-zinc-500">
                  {idx % 2 === 0 ? 'Audio Recording (.wav)' : 'Slide Deck (.pdf)'}
                </td>
                <td className="py-3.5 px-4 text-zinc-500">
                  {n.subject}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle className="h-3 w-3" />
                    Indexed & Vectorized
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onOpenNote(n)}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline"
                  >
                    View Note →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
