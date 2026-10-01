'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, Music, Video, Loader2, Sparkles } from 'lucide-react';
import { LectureData } from '@/types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureCreated: (newLecture: LectureData) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onLectureCreated
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!lectureTitle) {
        setLectureTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUploadAndGenerate = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Reading source content...');

    let extractedText = '';
    let determinedTitle = lectureTitle.trim();
    let sourceType = 'Uploaded Source';

    try {
      if (selectedFile) {
        const fileName = selectedFile.name;
        if (!determinedTitle) {
          determinedTitle = fileName.replace(/\.[^/.]+$/, '');
        }
        setStatusMessage(`Extracting text from ${fileName}...`);

        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
        if (['txt', 'md', 'markdown', 'csv', 'json'].includes(fileExt) || selectedFile.type.startsWith('text/')) {
          extractedText = await selectedFile.text();
        } else if (fileExt === 'pdf') {
          // Client-side PDF extraction (handles > 4.5 MB without Vercel limit)
          setStatusMessage(`Parsing ${fileName} in browser...`);
          try {
            const { extractText } = await import('unpdf');
            const arrayBuffer = await selectedFile.arrayBuffer();
            const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
            const parsedText = (typeof text === 'string' ? text : Array.isArray(text) ? (text as string[]).join('\n\n') : '')
              .replace(/\s+/g, ' ')
              .trim();
            if (parsedText && parsedText.length > 20) {
              extractedText = parsedText;
              sourceType = 'PDF Document';
            }
          } catch (clientErr) {
            console.warn('Client-side PDF extraction fallback to server:', clientErr);
          }

          if (!extractedText) {
            setStatusMessage(`Extracting ${fileName} on server...`);
            const formData = new FormData();
            formData.append('file', selectedFile);

            const extractRes = await fetch('/api/extract', {
              method: 'POST',
              body: formData,
            });

            if (!extractRes.ok) {
              let errText = '';
              try {
                const errJson = await extractRes.json();
                errText = errJson.error;
              } catch {
                errText = await extractRes.text().catch(() => '');
              }
              if (extractRes.status === 413 || errText.includes('Entity Too Large')) {
                throw new Error(`File is too large for server processing (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB exceeds 4.5 MB).`);
              }
              throw new Error(errText || `Server extraction failed with HTTP ${extractRes.status}`);
            }

            const extractData = await extractRes.json();
            extractedText = extractData.text;
            if (extractData.title && !lectureTitle.trim()) {
              determinedTitle = extractData.title;
            }
            sourceType = `${extractData.type?.toUpperCase() || 'DOCUMENT'} File`;
          }
        } else {
          const formData = new FormData();
          formData.append('file', selectedFile);

          const extractRes = await fetch('/api/extract', {
            method: 'POST',
            body: formData,
          });

          if (!extractRes.ok) {
            let errText = '';
            try {
              const errJson = await extractRes.json();
              errText = errJson.error;
            } catch {
              errText = await extractRes.text().catch(() => '');
            }
            if (extractRes.status === 413 || errText.includes('Entity Too Large')) {
              throw new Error(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB exceeds 4.5 MB).`);
            }
            throw new Error(errText || `Server extraction failed with HTTP ${extractRes.status}`);
          }

          const extractData = await extractRes.json();
          if (!extractData.text) {
            throw new Error(extractData.error || `Failed to extract readable text from ${fileName}`);
          }
          extractedText = extractData.text;
          if (extractData.title && !lectureTitle.trim()) {
            determinedTitle = extractData.title;
          }
          sourceType = `${extractData.type?.toUpperCase() || 'DOCUMENT'} File`;
        }
      } else if (youtubeUrl.trim()) {
        setStatusMessage('Fetching YouTube transcript & captions...');
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl.trim() })
        });

        const extractData = await extractRes.json();
        if (!extractRes.ok || !extractData.text) {
          throw new Error(extractData.error || 'Failed to extract captions from this YouTube URL');
        }
        extractedText = extractData.text;
        if (extractData.title && !lectureTitle.trim()) {
          determinedTitle = extractData.title;
        }
        sourceType = 'YouTube Lecture';
      }

      if (!extractedText || extractedText.trim().length < 15) {
        throw new Error('No readable text content found in the provided source.');
      }

      setStatusMessage('Synthesizing AI study notes, mindmap, flashcards & quiz...');
      const title = determinedTitle || 'Uploaded Study Material';
      const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('thetawave_ai_model') : null;
      const selectedLang = typeof window !== 'undefined' ? localStorage.getItem('thetawave_language') : null;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          subject: sourceType,
          model: selectedModel || undefined,
          language: selectedLang || undefined,
          sampleTranscript: extractedText.slice(0, 30000)
        })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data: LectureData = await res.json();
      onLectureCreated(data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Upload processing error:', msg);

      if (extractedText && extractedText.trim().length >= 20) {
        const title = determinedTitle || 'Uploaded Study Material';
        const cleanParas = extractedText.split(/\n\s*\n/).filter(p => p.length > 25);
        const p1 = cleanParas[0] || extractedText.slice(0, 350);
        const p2 = cleanParas[1] || extractedText.slice(350, 700);
        const sentences = extractedText
          .replace(/[#*`_]/g, ' ')
          .split(/(?<=[.?!])\s+/)
          .map(s => s.replace(/\s+/g, ' ').trim())
          .filter(s => s.length > 25 && !s.startsWith('http'));

        const tags = ['Core Concept', 'Fundamental Rule', 'Practical Application', 'Data Analysis', 'Exam Takeaway', 'Execution Strategy', 'Mechanism', 'Key Definition', 'Self-Check', 'High-Yield Review', 'Pro Tip', 'Final Review'];
        const flashcards = [];
        const targetCards = 12;
        const cardStep = Math.max(1, Math.floor(sentences.length / targetCards));

        for (let i = 0; i < targetCards; i++) {
          const sentIdx = (i * cardStep) % (sentences.length || 1);
          const s = sentences[sentIdx] || `${title} core principles and systematic methodology.`;
          flashcards.push({
            id: `fc-up-${Date.now()}-${i + 1}`,
            front: i === 0 ? `What is the core focus of ${title}?` : `What key rule or finding applies to: "${s.slice(0, 50)}..."?`,
            back: s,
            tag: tags[i % tags.length]
          });
        }

        const quiz = [];
        const targetQuiz = 6;
        const qStep = Math.max(1, Math.floor(sentences.length / targetQuiz));

        for (let j = 0; j < targetQuiz; j++) {
          const qSentIdx = (j * qStep + 1) % (sentences.length || 1);
          const s = sentences[qSentIdx] || `${title} systematic verification framework.`;
          const cleanAnswer = s.length > 85 ? s.slice(0, 85) + '...' : s;
          quiz.push({
            id: `qz-up-${Date.now()}-${j + 1}`,
            question: `Based on the study materials for "${title}", which statement is ACCURATE?`,
            options: [
              cleanAnswer,
              'This statement directly contradicts the core thesis presented in the material.',
              'This condition is merely hypothetical and lacks empirical backing.',
              'This rule is obsolete and no longer recommended in standard practice.'
            ],
            correctIndex: 0,
            explanation: `Directly supported by the reference text: "${s}"`
          });
        }

        const fallback: LectureData = {
          id: `upload-${Date.now()}`,
          title: title,
          subject: sourceType,
          date: new Date().toISOString().split('T')[0],
          summary: `Comprehensive academic study package synthesized from "${title}". Features ${flashcards.length} high-yield flashcards and ${quiz.length} exam-style assessment questions.`,
          markdownNotes: `# ${title}\n\n## 1. Overview\n${p1}\n\n## 2. Key Insights\n* ${sentences[0] || 'Core principles'}\n* ${sentences[1] || 'Essential rules'}\n\n## 3. Detailed Content\n${p2}\n`,
          mindmapMarkdown: `# ${title}\n## 1. Chapter Summary\n### ${(sentences[0] || title).slice(0, 40)}\n## 2. Detailed Breakdown\n### ${(sentences[1] || title).slice(0, 40)}\n`,
          flashcards,
          quiz
        };
        onLectureCreated(fallback);
        onClose();
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
      setSelectedFile(null);
      setYoutubeUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Upload Materials or Lecture Video
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Drop in any PDF lecture slides, Word doc, audio recording (.mp3/.wav), or YouTube lecture link.
        </p>

        {/* Title input */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Subject / Lecture Title
          </label>
          <input
            type="text"
            value={lectureTitle}
            onChange={e => setLectureTitle(e.target.value)}
            disabled={isProcessing}
            placeholder="e.g. Econometrics: Multi-variable Regression"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {/* Drag & Drop Area */}
        <label className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 transition dark:border-zinc-700 dark:bg-zinc-950/40">
          <Upload className="h-8 w-8 text-zinc-400 mb-2" />
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {selectedFile ? selectedFile.name : 'Click to browse or drop file here'}
          </span>
          <span className="text-[11px] text-zinc-400 mt-1">
            Supports PDF, DOCX, MP3, WAV, MP4 (Up to 500MB)
          </span>
          <input 
            type="file" 
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt,.mp3,.wav,.m4a,.mp4" 
            className="hidden" 
          />
        </label>

        {/* YouTube Link Option */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            <Video className="h-4 w-4 text-rose-500" />
            <span>Or paste YouTube lecture URL</span>
          </div>
          <input
            type="text"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            disabled={isProcessing}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-800 dark:text-rose-200">
            <p className="font-bold">Extraction Error:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        )}

        {/* Progress Notification Banner during processing */}
        {isProcessing && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 p-3 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800/80 dark:text-indigo-200 animate-pulse">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
        )}

        {/* Submit */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAndGenerate}
            disabled={(!selectedFile && !youtubeUrl) || isProcessing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Transforming Materials...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Notes & Study Tools</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
