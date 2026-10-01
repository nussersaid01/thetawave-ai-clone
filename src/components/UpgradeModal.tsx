'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  Shield, 
  Crown, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro?: boolean;
  onUpgradeSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  isPro = false,
  onUpgradeSuccess 
}) => {
  const [step, setStep] = useState<'plan' | 'checkout' | 'success'>('plan');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('987');

  if (!isOpen) return null;

  const features = [
    'Unlimited Note Generation & Vector Embeddings',
    '3-Hour Audio & Video Lecture Transcriptions',
    'Gemini 1.5 Pro & Claude 3.5 Sonnet Deep Reasoning Engine',
    'Full Anki & Notion Flashcard Export (.apkg / .csv)',
    'Real-Time LaTeX Mathematical Solver & Formula Visualizer',
    'Priority Cloud Compute & Dedicated GPU Inference'
  ];

  const handleProceedToCheckout = () => {
    setStep('checkout');
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onUpgradeSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }, 1200);
  };

  const handleReset = () => {
    setStep('plan');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: PLAN OVERVIEW */}
        {step === 'plan' && (
          <div>
            <div className="text-center pt-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/30 mb-3">
                <Crown className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                ThetaWave Pro
              </h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                Supercharge your study workflow with limitless AI processing, instant lecture ingestion, and deep cognitive retention.
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${billingCycle === 'monthly' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
              >
                <span>Annual (Save 40%)</span>
                <span className="rounded-full bg-emerald-500 text-[10px] text-white px-1.5 py-0.2">Best Value</span>
              </button>
            </div>

            {/* Pricing Card */}
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-purple-50/30 p-5 dark:border-indigo-950 dark:from-indigo-950/40 dark:to-zinc-900">
              <div className="flex items-baseline justify-between border-b border-indigo-100/80 pb-3 dark:border-indigo-900/50">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {billingCycle === 'monthly' ? 'Student Special' : 'Annual Pass'}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                      {billingCycle === 'monthly' ? '$9.99' : '$79.99'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {billingCycle === 'monthly' ? '/ month' : '/ year ($6.66/mo)'}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  Instant Activation
                </span>
              </div>

              {/* Features List */}
              <ul className="mt-4 space-y-2.5">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                End-to-end encrypted 256-bit Stripe sandbox payment.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <div>
            <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  Secure Checkout
                </h3>
                <p className="text-[11px] text-zinc-500">
                  ThetaWave Pro · {billingCycle === 'monthly' ? '$9.99/mo' : '$79.99/yr'}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 pl-9 text-xs font-mono text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <CreditCard className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-mono text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-mono text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                  <span>Total Due Today</span>
                  <span>{billingCycle === 'monthly' ? '$9.99' : '$79.99'}</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Includes full access to unlimited lectures, Anki exports, and Gemini 1.5 Pro deep research.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('plan')}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Pay {billingCycle === 'monthly' ? '$9.99' : '$79.99'} & Unlock Pro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400 mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Welcome to ThetaWave Pro!
            </h3>
            <p className="mt-1.5 text-xs text-zinc-500 max-w-sm mx-auto">
              Your account has been upgraded successfully. You now have unlimited note storage, priority AI reasoning, and full export capabilities.
            </p>

            <div className="mt-6 rounded-2xl bg-indigo-50/60 p-4 dark:bg-indigo-950/40 text-left border border-indigo-100 dark:border-indigo-900/60">
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                💎 Active Pro Privileges:
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                <li>• Unlimited lecture uploads & vector index</li>
                <li>• High-tier Gemini 1.5 Pro Reasoning active</li>
                <li>• 0/Unlimited notes quota</li>
              </ul>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Start Studying with Pro
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
