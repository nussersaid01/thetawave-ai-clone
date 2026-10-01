'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Shuffle, 
  CheckCircle, 
  HelpCircle,
  Sparkles,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsViewProps {
  cards: Flashcard[];
  onAddCards?: (newCards: Flashcard[]) => void;
  lectureTitle?: string;
  notesText?: string;
}

function extractAdditionalCards(
  notesText: string,
  existingCards: Flashcard[],
  lectureTitle: string = 'Study Lecture',
  count: number = 6
): Flashcard[] {
  const existingBacks = new Set(existingCards.map(c => c.back.toLowerCase()));
  const cleanSentences = (notesText || '')
    .replace(/[#*`_]/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 25 && !s.startsWith('http') && !s.includes('data:image'));

  const tags = ['In-Depth Concept', 'Exam Application', 'Key Formulation', 'Critical Insight', 'Deep Dive', 'Revision Focus', 'Analytical Detail'];
  const newCards: Flashcard[] = [];

  for (const s of cleanSentences) {
    if (newCards.length >= count) break;
    if (existingBacks.has(s.toLowerCase())) continue;

    const tag = tags[newCards.length % tags.length];
    newCards.push({
      id: `fc-gen-${Date.now()}-${newCards.length + 1}`,
      front: `What key insight or governing principle relates to: "${s.slice(0, 50)}..."?`,
      back: s,
      tag
    });
  }

  // Fallback high-yield cards if text is sparse
  while (newCards.length < count) {
    const idx = newCards.length + 1;
    newCards.push({
      id: `fc-gen-${Date.now()}-${idx}`,
      front: `Key application #${idx} for ${lectureTitle}?`,
      back: `Master the foundational methods and verify analytical consistency in ${lectureTitle}.`,
      tag: 'Exam Mastery'
    });
  }

  return newCards;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ 
  cards: initialCards,
  onAddCards,
  lectureTitle,
  notesText
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Set<string>>(new Set());
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('Personal Study');
  const [notification, setNotification] = useState<string | null>(null);

  // Reset when cards prop changes
  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCount(new Set());
  }, [initialCards]);

  const handleGenerateMore = () => {
    setIsGeneratingMore(true);
    setTimeout(() => {
      const generated = extractAdditionalCards(
        notesText || currentCard?.back || '',
        cards,
        lectureTitle || 'Lecture',
        6
      );
      const updated = [...cards, ...generated];
      setCards(updated);
      onAddCards?.(generated);
      setIsGeneratingMore(false);
      setNotification(`✨ +6 new flashcards generated! Total deck: ${updated.length} cards.`);
      setTimeout(() => setNotification(null), 3500);
    }, 500);
  };

  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const customCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      tag: newTag.trim() || 'Custom Note'
    };

    const updated = [...cards, customCard];
    setCards(updated);
    onAddCards?.([customCard]);
    setNewFront('');
    setNewBack('');
    setShowAddModal(false);
    setNotification('✓ Custom flashcard added to deck!');
    setTimeout(() => setNotification(null), 3000);
  };

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!studiedCount.has(currentCard.id)) {
      const next = new Set(studiedCount);
      next.add(currentCard.id);
      setStudiedCount(next);

      // Trigger celebration if all cards studied
      if (next.size === cards.length) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-500">
        No flashcards available for this lecture.
      </div>
    );
  }

  const progressPercentage = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-8">
      
      {/* Top Header & Progress */}
      <div className="mb-6 w-full">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {studiedCount.size} of {cards.length} Studied
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="group relative h-80 w-full cursor-pointer select-none [perspective:1000px]"
      >
        <div 
          className={`relative h-full w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl transition-all duration-500 [transform-style:preserve-3d] dark:border-zinc-800 dark:bg-zinc-900 ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                {currentCard.tag || 'Concept'}
              </span>
              <span className="text-[11px] text-zinc-400">Click or Space to flip</span>
            </div>

            <div className="my-auto text-center">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl leading-snug">
                {currentCard.front}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Tap to reveal answer</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 rounded-3xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                Explanation & Answer
              </span>
              <span className="text-[11px] text-zinc-400">Card #{currentIndex + 1}</span>
            </div>

            <div className="my-auto text-center">
              <p className="text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {currentCard.back}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Concept Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 flex items-center justify-between w-full max-w-sm">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle cards"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Shuffle</span>
          </button>
          
          <button
            onClick={handleFlip}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
          >
            Flip
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Deck Expansion Toolbar */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={handleGenerateMore}
          disabled={isGeneratingMore}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 cursor-pointer disabled:opacity-50"
        >
          {isGeneratingMore ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>{isGeneratingMore ? 'Generating...' : '+ Generate 6 More Cards'}</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-500" />
          <span>+ Add Card</span>
        </button>
      </div>

      {notification && (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200 text-center">
          {notification}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="mt-5 flex items-center gap-4 text-[11px] text-zinc-400">
        <span>← Previous</span>
        <span>Space to Flip</span>
        <span>Next →</span>
      </div>

      {/* Modal for adding custom flashcard */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                + Create Custom Flashcard
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomCard} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Question / Front:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the formula for calculating maximum allowable risk per trade?"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Answer / Back:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Risk = (Account Equity * 1%) / Stop Loss Distance in pips or ticks."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs text-zinc-800 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
                  Category / Tag:
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Risk Management, Formula, Key Concept"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2 text-xs text-zinc-800 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
