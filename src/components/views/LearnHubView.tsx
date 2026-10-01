'use client';

import React, { useState } from 'react';
import { LectureData, Flashcard, QuizQuestion } from '@/types';
import { 
  Flame, 
  Layers, 
  HelpCircle, 
  Trophy, 
  Sparkles, 
  CheckCircle, 
  RotateCw,
  Play
} from 'lucide-react';
import { FlashcardsView } from '@/components/FlashcardsView';
import { QuizView } from '@/components/QuizView';

interface LearnHubViewProps {
  notes: LectureData[];
}

export const LearnHubView: React.FC<LearnHubViewProps> = ({ notes }) => {
  const [activeMode, setActiveMode] = useState<'overview' | 'all-flashcards' | 'all-quiz'>('overview');

  // Consolidate all flashcards across all notes
  const allFlashcards: Flashcard[] = notes.flatMap(n => 
    n.flashcards.map(fc => ({ ...fc, tag: fc.tag ? `${n.subject} · ${fc.tag}` : n.subject }))
  );

  // Consolidate all quiz questions across all notes
  const allQuizzes: QuizQuestion[] = notes.flatMap(n => n.quiz);

  if (activeMode === 'all-flashcards') {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <button
          onClick={() => setActiveMode('overview')}
          className="mb-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to Learn Hub
        </button>
        <FlashcardsView cards={allFlashcards} />
      </div>
    );
  }

  if (activeMode === 'all-quiz') {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <button
          onClick={() => setActiveMode('overview')}
          className="mb-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          ← Back to Learn Hub
        </button>
        <QuizView questions={allQuizzes} lectureTitle="Consolidated Cross-Course Mock Exam" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 max-w-5xl mx-auto w-full">
      
      {/* Top Header & Streak Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Active Recall & Learn Hub
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Scientifically proven spaced repetition and cross-course test drills.
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
          <Flame className="h-5 w-5 text-amber-500 animate-bounce" />
          <div>
            <span className="text-xs font-black block leading-none">4 DAY STREAK</span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400">Keep learning daily!</span>
          </div>
        </div>
      </div>

      {/* Main 2 Study Decks */}
      <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        
        {/* Unified Flashcards Drill */}
        <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-4">
              <Layers className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Master Spaced Repetition Deck
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
              Consolidated flashcards from all your courses ({allFlashcards.length} cards total). Flip through concepts with randomized Leitner drill.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {allFlashcards.length} Cards Ready
            </span>
            <button
              onClick={() => setActiveMode('all-flashcards')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Start Review</span>
            </button>
          </div>
        </div>

        {/* Unified Mock Exam Quiz */}
        <div className="flex flex-col justify-between rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900/50">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-4">
              <HelpCircle className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Comprehensive Mock Exam
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
              Cross-disciplinary quiz testing your knowledge across Neural Networks, Bioenergetics, and all active subjects ({allQuizzes.length} questions).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {allQuizzes.length} Questions
            </span>
            <button
              onClick={() => setActiveMode('all-quiz')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>

      </div>

      {/* Memory Retention Tips */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          Ebbinghaus Forgetting Curve Science
        </h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Without active review, up to 70% of lecture information is forgotten within 24 hours. ThetaWave AI spaces out review intervals at Day 1, Day 3, and Day 7 to permanently solidify concepts into long-term memory.
        </p>
      </div>

    </div>
  );
};
