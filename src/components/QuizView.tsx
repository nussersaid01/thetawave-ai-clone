'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { CheckCircle2, XCircle, Trophy, RefreshCw, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  questions: QuizQuestion[];
  lectureTitle: string;
  notesText?: string;
  onAddQuestions?: (newQuestions: QuizQuestion[]) => void;
}

function extractAdditionalQuiz(
  notesText: string,
  existingQuiz: QuizQuestion[],
  lectureTitle: string = 'Study Lecture',
  count: number = 4
): QuizQuestion[] {
  const existingQuestions = new Set(existingQuiz.map(q => q.question.toLowerCase()));
  const cleanSentences = (notesText || '')
    .replace(/[#*`_]/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 25 && !s.startsWith('http') && !s.includes('data:image'));

  const newQuiz: QuizQuestion[] = [];

  for (let i = 0; i < cleanSentences.length; i++) {
    if (newQuiz.length >= count) break;
    const s = cleanSentences[i];
    const qText = `According to the lecture on "${lectureTitle}", which statement accurately describes: "${s.slice(0, 50)}..."?`;
    if (existingQuestions.has(qText.toLowerCase())) continue;

    const cleanAnswer = s.length > 85 ? s.slice(0, 85) + '...' : s;
    newQuiz.push({
      id: `qz-gen-${Date.now()}-${newQuiz.length + 1}`,
      question: qText,
      options: [
        cleanAnswer,
        'This statement is fundamentally contradictory to the primary thesis.',
        'This condition is merely theoretical without empirical application.',
        'This rule has been deprecated and should not be relied upon.'
      ],
      correctIndex: 0,
      explanation: `Directly supported by the study text: "${s}"`
    });
  }

  while (newQuiz.length < count) {
    const idx = newQuiz.length + 1;
    newQuiz.push({
      id: `qz-gen-${Date.now()}-${idx}`,
      question: `What is a primary exam takeaway from "${lectureTitle}" (Section ${idx})?`,
      options: [
        `Systematic conceptual understanding and practical verification of ${lectureTitle}.`,
        'Ignoring market or theoretical structures during execution.',
        'Relying solely on intuition without objective criteria.',
        'Discarding all foundational frameworks.'
      ],
      correctIndex: 0,
      explanation: `Systematic mastery and objective criteria are paramount in ${lectureTitle}.`
    });
  }

  return newQuiz;
}

export const QuizView: React.FC<QuizViewProps> = ({ 
  questions: initialQuestions, 
  lectureTitle,
  notesText,
  onAddQuestions 
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  useEffect(() => {
    setQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowSummary(false);
  }, [initialQuestions]);

  const handleGenerateMoreQuestions = () => {
    setIsGeneratingMore(true);
    setTimeout(() => {
      const generated = extractAdditionalQuiz(
        notesText || '',
        questions,
        lectureTitle || 'Lecture',
        4
      );
      const updated = [...questions, ...generated];
      setQuestions(updated);
      onAddQuestions?.(generated);
      setIsGeneratingMore(false);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setShowSummary(false);
    }, 500);
  };

  const currentQ = questions[currentIndex];
  const hasAnsweredCurrent = selectedAnswers[currentIndex] !== undefined;
  const isCorrect = selectedAnswers[currentIndex] === currentQ?.correctIndex;

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return; // Prevent changing after answer revealed

    const newAnswers = { ...selectedAnswers, [currentIndex]: optionIndex };
    setSelectedAnswers(newAnswers);

    // If correct, play subtle confetti
    if (optionIndex === currentQ.correctIndex) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }

    // Check if this was the last question
    if (Object.keys(newAnswers).length === questions.length) {
      setTimeout(() => {
        setShowSummary(true);
        const correctCount = Object.entries(newAnswers).filter(
          ([qIdx, ansIdx]) => questions[Number(qIdx)].correctIndex === ansIdx
        ).length;

        if (correctCount / questions.length >= 0.75) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        }
      }, 1200);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-500">
        No quiz questions available for this lecture.
      </div>
    );
  }

  // Final Summary Screen
  if (showSummary) {
    const totalCorrect = Object.entries(selectedAnswers).filter(
      ([qIdx, ansIdx]) => questions[Number(qIdx)].correctIndex === ansIdx
    ).length;
    const scorePercent = Math.round((totalCorrect / questions.length) * 100);

    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-xl shadow-amber-500/20 mb-6">
          <Trophy className="h-10 w-10" />
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Quiz Completed!
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {lectureTitle}
        </p>

        {/* Score Card */}
        <div className="my-8 w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
            {scorePercent}%
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            You scored {totalCorrect} out of {questions.length} questions correctly.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>
              {scorePercent >= 80 ? 'Mastery Level Achieved! Ready for Exam.' : 'Good attempt! Review the flashcards to sharpen retention.'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={handleGenerateMoreQuestions}
            disabled={isGeneratingMore}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isGeneratingMore ? 'Generating...' : '+ Generate 4 More Questions'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center px-4 py-8">
      
      {/* Top Stepper */}
      <div className="mb-6 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-3">
          <span>
            Score: {Object.entries(selectedAnswers).filter(([idx, ans]) => questions[Number(idx)]?.correctIndex === ans).length} / {Object.keys(selectedAnswers).length}
          </span>
          <button
            onClick={handleGenerateMoreQuestions}
            disabled={isGeneratingMore}
            title="Add 4 more practice questions from lecture"
            className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer disabled:opacity-50"
          >
            {isGeneratingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            <span>+ 4 Qs</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="mt-6 flex flex-col gap-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIndex] === idx;
            const isThisCorrect = idx === currentQ.correctIndex;
            
            let buttonClasses = "relative flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition-all ";

            if (hasAnsweredCurrent) {
              if (isThisCorrect) {
                buttonClasses += "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold";
              } else if (isSelected) {
                buttonClasses += "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200";
              } else {
                buttonClasses += "border-zinc-200 bg-zinc-50/50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40";
              }
            } else {
              buttonClasses += "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-500";
            }

            return (
              <button
                key={idx}
                disabled={hasAnsweredCurrent}
                onClick={() => handleSelectOption(idx)}
                className={buttonClasses}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    hasAnsweredCurrent && isThisCorrect 
                      ? 'bg-emerald-600 text-white' 
                      : hasAnsweredCurrent && isSelected 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {hasAnsweredCurrent && isThisCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                )}
                {hasAnsweredCurrent && isSelected && !isThisCorrect && (
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Banner (Revealed after selecting) */}
        {hasAnsweredCurrent && (
          <div className={`mt-6 rounded-2xl p-4 text-xs leading-relaxed ${
            isCorrect 
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300' 
              : 'border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
          }`}>
            <span className="font-bold block mb-1">
              {isCorrect ? '✓ Correct Explanation:' : '✗ Detailed Explanation:'}
            </span>
            {currentQ.explanation}
          </div>
        )}

        {/* Next Question Button */}
        {hasAnsweredCurrent && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
