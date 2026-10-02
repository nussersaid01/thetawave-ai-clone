'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  HelpCircle
} from 'lucide-react';
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
      explanation: `Directly supported by the study text: "${s}"`,
      distractorExplanations: [
        `Option A is correct: "${s}"`,
        'Option B is incorrect because this thesis is the core empirical foundation of the lesson.',
        'Option C is incorrect because practical real-world applications are explicitly documented.',
        'Option D is incorrect because this standard rule remains active and recommended.'
      ]
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
      explanation: `Systematic mastery and objective criteria are paramount in ${lectureTitle}.`,
      distractorExplanations: [
        `Option A is correct: Systematic mastery and objective criteria are the primary takeaways.`,
        'Option B is incorrect: Structures and models must never be ignored.',
        'Option C is incorrect: Intuition alone without objective metrics leads to errors.',
        'Option D is incorrect: Foundational frameworks form the basis of the curriculum.'
      ]
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
  const [explanationFeedback, setExplanationFeedback] = useState<Record<number, 'up' | 'down'>>({});
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);

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
    setIsExplanationOpen(true);

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

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowSummary(false);
    setExplanationFeedback({});
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

  const completionPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const currentFeedback = explanationFeedback[currentIndex];

  // Prepare distractor explanations
  const distractorItems = currentQ.options.map((option, idx) => {
    const isThisCorrect = idx === currentQ.correctIndex;
    let explanationText = '';
    if (currentQ.distractorExplanations && currentQ.distractorExplanations[idx]) {
      explanationText = currentQ.distractorExplanations[idx];
    } else if (isThisCorrect) {
      explanationText = currentQ.explanation || 'Correct answer supported by study notes.';
    } else {
      explanationText = `Option ${String.fromCharCode(65 + idx)} is incorrect because it contradicts or lacks evidence from the primary lecture source.`;
    }
    return {
      letter: String.fromCharCode(65 + idx),
      option,
      isThisCorrect,
      explanationText
    };
  });

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col justify-center px-4 py-8">
      
      {/* Top Stepper Header (ThetaWave Parity: Percentage & Stepper) */}
      <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            {completionPercent}% Completed
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-500">
            Score: <strong className="text-indigo-600 dark:text-indigo-400">{Object.entries(selectedAnswers).filter(([idx, ans]) => questions[Number(idx)]?.correctIndex === ans).length}</strong> / {Object.keys(selectedAnswers).length}
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
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        
        {/* Question Prompt Badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Single Choice
          </span>
          <span className="text-[11px] text-zinc-400">
            Select one best answer
          </span>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 sm:text-xl leading-snug">
          {currentQ.question}
        </h3>

        {/* Options List */}
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
              buttonClasses += "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-500 cursor-pointer";
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

        {/* ThetaWave "👇 Explanation" Accordion (Revealed after selecting) */}
        {hasAnsweredCurrent && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/60 transition-all dark:border-zinc-800 dark:bg-zinc-950/60">
            {/* Accordion Header */}
            <button
              onClick={() => setIsExplanationOpen(!isExplanationOpen)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  👇 Explanation
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isCorrect 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                </span>
              </div>
              {isExplanationOpen ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {/* Accordion Content */}
            {isExplanationOpen && (
              <div className="border-t border-zinc-200/70 p-4 pt-3 dark:border-zinc-800/70">
                {/* Main Rationale */}
                <div className="mb-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <strong className="block text-zinc-900 dark:text-zinc-100 mb-1">
                    Key Answer Takeaway:
                  </strong>
                  {currentQ.explanation}
                </div>

                {/* Distractor Breakdown (Options Analysis) */}
                <div className="space-y-2 border-t border-zinc-200/60 pt-3 dark:border-zinc-800/60">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Option Breakdown & Distractors:
                  </span>
                  {distractorItems.map((item, dIdx) => (
                    <div 
                      key={dIdx} 
                      className={`rounded-xl p-2.5 text-[11px] leading-relaxed ${
                        item.isThisCorrect
                          ? 'border border-emerald-200/80 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'border border-zinc-200/60 bg-white/70 text-zinc-600 dark:border-zinc-800/60 dark:bg-zinc-900/40 dark:text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                          item.isThisCorrect 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {item.letter}
                        </span>
                        <span>{item.isThisCorrect ? 'Correct Rationale' : 'Distractor Analysis'}</span>
                      </div>
                      <p>{item.explanationText}</p>
                    </div>
                  ))}
                </div>

                {/* Was this explanation clear? Thumbs Feedback Widget */}
                <div className="mt-4 flex flex-wrap items-center justify-between border-t border-zinc-200/60 pt-3 text-[11px] text-zinc-500 dark:border-zinc-800/60">
                  <span>Was this explanation clear and pedagogical?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExplanationFeedback(prev => ({ ...prev, [currentIndex]: 'up' }))}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition cursor-pointer ${
                        currentFeedback === 'up'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Clear</span>
                    </button>

                    <button
                      onClick={() => setExplanationFeedback(prev => ({ ...prev, [currentIndex]: 'down' }))}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition cursor-pointer ${
                        currentFeedback === 'down'
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-300'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>Needs Detail</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Navigation Controls (Prev / Next Question) */}
        {hasAnsweredCurrent && (
          <div className="mt-6 flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 cursor-pointer"
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
