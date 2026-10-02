'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Flashcard } from '@/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Shuffle, 
  CheckCircle, 
  Sparkles,
  Plus,
  Loader2,
  X,
  Search,
  Edit3,
  Trash2,
  Save,
  Layers,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlashcardsViewProps {
  cards: Flashcard[];
  onAddCards?: (newCards: Flashcard[]) => void;
  onUpdateCards?: (updatedCards: Flashcard[]) => void;
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
  onUpdateCards,
  lectureTitle,
  notesText
}) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState<Set<string>>(new Set());
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [showAllCardsModal, setShowAllCardsModal] = useState(false);
  const [showAddCardInline, setShowAddCardInline] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Custom card creation state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('Personal Study');
  
  // Card editing state inside modal
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editTag, setEditTag] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  // Sync state when cards prop changes
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
        notesText || cards[currentIndex]?.back || '',
        cards,
        lectureTitle || 'Lecture',
        6
      );
      const updated = [...cards, ...generated];
      setCards(updated);
      onAddCards?.(generated);
      onUpdateCards?.(updated);
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
    onUpdateCards?.(updated);
    setNewFront('');
    setNewBack('');
    setShowAddCardInline(false);
    setNotification('✓ Custom flashcard added to deck!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditTag(card.tag || '');
  };

  const handleSaveEditCard = (cardId: string) => {
    const updated = cards.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          front: editFront.trim() || c.front,
          back: editBack.trim() || c.back,
          tag: editTag.trim() || c.tag
        };
      }
      return c;
    });
    setCards(updated);
    onUpdateCards?.(updated);
    setEditingCardId(null);
    setNotification('✓ Flashcard updated successfully!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert('Deck must contain at least one card.');
      return;
    }
    const updated = cards.filter(c => c.id !== cardId);
    setCards(updated);
    onUpdateCards?.(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    setNotification('✓ Flashcard deleted from deck.');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleJumpToCard = (cardIndex: number) => {
    setCurrentIndex(cardIndex);
    setIsFlipped(false);
    setShowAllCardsModal(false);
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
    if (currentCard && !studiedCount.has(currentCard.id)) {
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
      // Don't capture keys if an input/textarea or modal is focused
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) || showAllCardsModal) {
        return;
      }
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
  }, [isFlipped, currentIndex, handleNext, handlePrev, showAllCardsModal]);

  const filteredCards = useMemo(() => {
    if (!searchFilter.trim()) return cards;
    const q = searchFilter.toLowerCase();
    return cards.filter(c => 
      c.front.toLowerCase().includes(q) || 
      c.back.toLowerCase().includes(q) || 
      (c.tag && c.tag.toLowerCase().includes(q))
    );
  }, [cards, searchFilter]);

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
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-zinc-400">({progressPercentage}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              {studiedCount.size} / {cards.length} Studied
            </span>
          </div>
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

      {/* Navigation Controls (ThetaWave Parity: Prev, Flip, Shuffle, All Flashcards, Next) */}
      <div className="mt-8 flex items-center justify-between w-full max-w-md">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Shuffle cards"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Shuffle</span>
          </button>
          
          <button
            onClick={handleFlip}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 cursor-pointer"
          >
            Flip
          </button>

          {/* ThetaWave "All Flashcards" modal trigger */}
          <button
            onClick={() => setShowAllCardsModal(true)}
            title="Browse, search, edit and manage all cards"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>All Flashcards</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
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
          onClick={() => {
            setShowAllCardsModal(true);
            setShowAddCardInline(true);
          }}
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

      {/* ThetaWave "All Flashcards" Modal Dialog */}
      {showAllCardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="flex flex-col h-[85vh] w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    All Flashcards
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {cards.length} cards total in this deck • {studiedCount.size} studied
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddCardInline(!showAddCardInline)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showAddCardInline ? 'Hide Form' : 'New Card'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowAllCardsModal(false);
                    setShowAddCardInline(false);
                    setEditingCardId(null);
                  }}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-3 dark:border-zinc-800/60 dark:bg-zinc-950/30">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search flashcards by question, answer, or tag..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-8 text-xs text-zinc-800 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
                {searchFilter && (
                  <button 
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Add Form Drawer (inside modal) */}
            {showAddCardInline && (
              <form onSubmit={handleAddCustomCard} className="border-b border-zinc-200 bg-indigo-50/40 p-4 dark:border-zinc-800 dark:bg-indigo-950/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    + Add New Flashcard to Deck
                  </span>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tag / Category"
                    className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs text-zinc-800 focus:outline-none dark:border-indigo-900 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    required
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Front: Concept or question prompt..."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-2 text-xs text-zinc-800 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <textarea
                    rows={2}
                    required
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Back: Comprehensive answer and rationale..."
                    className="w-full rounded-xl border border-zinc-200 bg-white p-2 text-xs text-zinc-800 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCardInline(false)}
                    className="rounded-lg px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Save to Deck
                  </button>
                </div>
              </form>
            )}

            {/* Cards Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {filteredCards.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  No flashcards match &ldquo;{searchFilter}&rdquo;
                </div>
              ) : (
                filteredCards.map((card, idx) => {
                  const isStudied = studiedCount.has(card.id);
                  const isEditing = editingCardId === card.id;
                  const originalIndex = cards.findIndex(c => c.id === card.id);

                  if (isEditing) {
                    return (
                      <div 
                        key={card.id}
                        className="rounded-2xl border-2 border-indigo-500 bg-white p-4 shadow-sm dark:bg-zinc-900"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-indigo-600">Editing Card #{originalIndex + 1}</span>
                          <input
                            type="text"
                            value={editTag}
                            onChange={(e) => setEditTag(e.target.value)}
                            placeholder="Tag"
                            className="rounded-lg border border-zinc-200 px-2 py-0.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Question (Front):</label>
                            <textarea
                              rows={2}
                              value={editFront}
                              onChange={(e) => setEditFront(e.target.value)}
                              className="w-full rounded-xl border border-zinc-200 p-2 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Answer (Back):</label>
                            <textarea
                              rows={3}
                              value={editBack}
                              onChange={(e) => setEditBack(e.target.value)}
                              className="w-full rounded-xl border border-zinc-200 p-2 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => setEditingCardId(null)}
                            className="rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEditCard(card.id)}
                            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={card.id}
                      className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            #{originalIndex + 1}
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {card.tag || 'Concept'}
                          </span>
                          {isStudied && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="h-3 w-3" />
                              Studied
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleJumpToCard(originalIndex)}
                            title="Jump to this card in player"
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-indigo-400 cursor-pointer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Study</span>
                          </button>
                          <button
                            onClick={() => handleStartEditCard(card)}
                            title="Edit card"
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            title="Delete card"
                            className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="rounded-xl bg-zinc-50/60 p-3 dark:bg-zinc-900/40">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Front (Question)
                          </span>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {card.front}
                          </p>
                        </div>

                        <div className="rounded-xl bg-indigo-50/30 p-3 dark:bg-indigo-950/20">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                            Back (Answer)
                          </span>
                          <p className="text-zinc-700 dark:text-zinc-300">
                            {card.back}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 text-xs text-zinc-500 dark:border-zinc-800">
              <span>Tip: Click &lsquo;Study&rsquo; on any card to load it directly into the 3D player.</span>
              <button
                onClick={() => setShowAllCardsModal(false)}
                className="rounded-xl bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
