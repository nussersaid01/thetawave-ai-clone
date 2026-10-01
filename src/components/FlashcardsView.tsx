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
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsViewProps {
  cards: Flashcard[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Set<string>>(new Set());

  // Reset when cards prop changes
  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCount(new Set());
  }, [initialCards]);

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

      {/* Keyboard hints */}
      <div className="mt-6 flex items-center gap-4 text-[11px] text-zinc-400">
        <span>← Previous</span>
        <span>Space to Flip</span>
        <span>Next →</span>
      </div>

    </div>
  );
};
