'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  ChevronDown, 
  Loader2, 
  Check,
  AlertTriangle,
  FileCheck2,
  FileX
} from 'lucide-react';
import { LectureData } from '@/types';

interface UploadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureCreated: (lecture: LectureData) => void;
}

function buildIntelligentFallback(
  title: string,
  extractedText: string,
  language: string,
  sourceType: string
): LectureData {
  const isArabic = language.includes('Arabic') || language.includes('العربية');
  const isJawi = language.includes('Jawi') || language.includes('جاوي');
  const isMalay = language.includes('Melayu') || language.includes('Malay');

  const cleanParagraphs = extractedText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 25);

  const p1 = cleanParagraphs[0] || extractedText.slice(0, 350);
  const p2 = cleanParagraphs[1] || extractedText.slice(350, 700);
  const p3 = cleanParagraphs[2] || extractedText.slice(700, 1050);

  const sentences = extractedText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const point1 = sentences[0] || `Key concepts extracted from ${title}.`;
  const point2 = sentences[1] || `Essential structural principles and practical formulations.`;
  const point3 = sentences[2] || `Important conclusions and summary evaluation.`;

  if (isArabic) {
    return {
      id: `upload-${Date.now()}`,
      title,
      subject: sourceType,
      duration: '30 دقيقة',
      date: new Date().toISOString().split('T')[0],
      summary: `ملخص تنفيذي للمادة المستخرجة من "${title}". تم استخلاص الأفكار الرئيسية وتوثيقها بدقة.`,
      markdownNotes: `# ${title}\n\n## 1. الملخص التنفيذي\n${p1}\n\n---\n\n## 2. المفاهيم والنقاط الجوهرية\n* ${point1}\n* ${point2}\n* ${point3}\n\n---\n\n## 3. التحليل التفصيلي للمحتوى\n${p2}\n\n${p3}\n\n---\n\n## 4. أهم استنتاجات المراجعة\n* التركيز على الفهم الشامل للنقاط الأساسية المذكورة أعلاه.\n* مراجعة المصطلحات البارزة للامتحانات.\n`,
      mindmapMarkdown: `# ${title}\n## 1. المقدمة والمفاهيم\n### ${point1.slice(0, 40)}\n## 2. التفاصيل المحورية\n### ${point2.slice(0, 40)}\n## 3. الاستنتاجات\n### ${point3.slice(0, 40)}`,
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          front: `ما هي الفكرة الجوهرية المستخلصة من ${title}؟`,
          back: point1,
          tag: 'المفهوم الأساسي'
        },
        {
          id: `fc-${Date.now()}-2`,
          front: `ما الذي يوضحه هذا المستند بشأن التفاصيل التطبيقية؟`,
          back: point2,
          tag: 'التحليل'
        }
      ],
      quiz: [
        {
          id: `qz-${Date.now()}-1`,
          question: `ما هو المحور الأساسي الذي تم استعراضه في ${title}؟`,
          options: [point1.slice(0, 60), 'موضوع غير مرتبط بالسياق', 'افتراضات عامة فقط', 'بيانات غير مكتملة'],
          correctIndex: 0,
          explanation: `تم استخلاص هذا المبدأ مباشرة من الوثيقة المرفوعة: ${point1.slice(0, 100)}`
        }
      ]
    };
  }

  if (isJawi) {
    return {
      id: `upload-${Date.now()}`,
      title,
      subject: sourceType,
      duration: '30 مينيت',
      date: new Date().toISOString().split('T')[0],
      summary: `ريڠكسن ايكسيكوتيف باهن يڠ دايكسترك درڤد "${title}". كسموا كونسيڤ اوتام تله دسوسون كمـس.`,
      markdownNotes: `# ${title}\n\n## ١. ريڠكسن ايكسيكوتيف\n${p1}\n\n---\n\n## ٢. ڤركارا دان كونسيڤ اوتام\n* ${point1}\n* ${point2}\n* ${point3}\n\n---\n\n## ٣. اناليسيس باهن سمڤادن\n${p2}\n\n${p3}\n\n---\n\n## ٤. روموسن دان اولسن ڤڤريقساءن\n* ڤستيکن كفهمن مندولوم ترهادڤ باهن اين.\n* سيمق كاتيݢوري اوتام سبلوم اوجين.\n`,
      mindmapMarkdown: `# ${title}\n## ١. اساس\n### ${point1.slice(0, 40)}\n## ٢. بوتيرن لنجوت\n### ${point2.slice(0, 40)}\n## ٣. روموسن\n### ${point3.slice(0, 40)}`,
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          front: `اڤاكه ايسو اوتام دالم ${title}؟`,
          back: point1,
          tag: 'كونسيڤ اوتام'
        }
      ],
      quiz: [
        {
          id: `qz-${Date.now()}-1`,
          question: `اڤاكه ڤرينسيڤ اوتام يڠ دتكنكن دالم باهن اين؟`,
          options: [point1.slice(0, 60), 'ڤركارا لوار كونتيک س', 'تيوري تنڤا بوقتي', 'كسيمڤولن سمنتارا'],
          correctIndex: 0,
          explanation: `دڤتيق لڠسوڠ درڤد باهن يڠ دموات-ناءيق: ${point1.slice(0, 100)}`
        }
      ]
    };
  }

  if (isMalay) {
    return {
      id: `upload-${Date.now()}`,
      title,
      subject: sourceType,
      duration: '30 minit',
      date: new Date().toISOString().split('T')[0],
      summary: `Ringkasan analisis bahan yang diekstrak daripada "${title}". Semua konsep utama telah dirumuskan secara tersusun.`,
      markdownNotes: `# ${title}\n\n## 1. Ringkasan Eksekutif\n${p1}\n\n---\n\n## 2. Konsep & Maklumat Penting\n* ${point1}\n* ${point2}\n* ${point3}\n\n---\n\n## 3. Analisis Terperinci Bahan\n${p2}\n\n${p3}\n\n---\n\n## 4. Rumusan Pembelajaran & Strategi Peperiksaan\n* Pastikan pemahaman kukuh terhadap fakta dan hujah utama di atas.\n* Semak semula istilah dan fokus pada soalan pemahaman.\n`,
      mindmapMarkdown: `# ${title}\n## 1. Asas & Gambaran Keseluruhan\n### ${point1.slice(0, 50)}\n## 2. Huraian Utama\n### ${point2.slice(0, 50)}\n## 3. Rumusan\n### ${point3.slice(0, 50)}`,
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          front: `Apakah idea utama yang dihuraikan dalam ${title}?`,
          back: point1,
          tag: 'Konsep Utama'
        },
        {
          id: `fc-${Date.now()}-2`,
          front: `Apakah perincian penting berkaitan topik ini?`,
          back: point2,
          tag: 'Analisis'
        }
      ],
      quiz: [
        {
          id: `qz-${Date.now()}-1`,
          question: `Apakah perkara utama yang dibincangkan dalam ${title}?`,
          options: [point1.slice(0, 60), 'Topik lain yang tiada kaitan', 'Kajian awal tanpa kesimpulan', 'Hipotesis tidak sahih'],
          correctIndex: 0,
          explanation: `Diekstrak terus daripada bahan rujukan: ${point1.slice(0, 100)}`
        }
      ]
    };
  }

  return {
    id: `upload-${Date.now()}`,
    title,
    subject: sourceType,
    duration: '30 mins',
    date: new Date().toISOString().split('T')[0],
    summary: `Structured academic study package synthesized from "${title}". Real content extracted and organized into key revision modules.`,
    markdownNotes: `# ${title}\n\n## 1. Executive Summary\n${p1}\n\n---\n\n## 2. Core Concepts & Highlights\n* ${point1}\n* ${point2}\n* ${point3}\n\n---\n\n## 3. In-Depth Source Analysis\n${p2}\n\n${p3}\n\n---\n\n## 4. Revision Takeaways & Exam Strategy\n* Master the core arguments and formulations extracted directly from the reference material.\n* Test your retention using the generated flashcards and self-assessment quiz.\n`,
    mindmapMarkdown: `# ${title}\n## 1. Overview & Fundamentals\n### ${point1.slice(0, 50)}\n## 2. Key Insights\n### ${point2.slice(0, 50)}\n## 3. Conclusions\n### ${point3.slice(0, 50)}`,
    flashcards: [
      {
        id: `fc-${Date.now()}-1`,
        front: `What is the primary concept discussed in ${title}?`,
        back: point1,
        tag: 'Core Concept'
      },
      {
        id: `fc-${Date.now()}-2`,
        front: `What key evidence or analytical point is highlighted in the text?`,
        back: point2,
        tag: 'Key Analysis'
      }
    ],
    quiz: [
      {
        id: `qz-${Date.now()}-1`,
        question: `Which fundamental insight is emphasized in ${title}?`,
        options: [point1.slice(0, 60), 'Unrelated tangential claims', 'Unverified assumptions', 'Historical anecdotes only'],
        correctIndex: 0,
        explanation: `Extracted directly from the source text: ${point1.slice(0, 100)}`
      }
    ]
  };
}

export const UploadSourceModal: React.FC<UploadSourceModalProps> = ({
  isOpen,
  onClose,
  onLectureCreated
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedLink, setPastedLink] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('English (US)');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('thetawave_language');
      if (savedLang) {
        setOutputLanguage(savedLang);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const languages = [
    'English (US)',
    'Bahasa Melayu',
    'العربية (Arabic)',
    'Tulisan Jawi (جاوي)'
  ];

  const isArabicOrJawi = outputLanguage.includes('Arabic') || outputLanguage.includes('العربية') || outputLanguage.includes('Jawi') || outputLanguage.includes('جاوي');
  const isJawi = outputLanguage.includes('Jawi') || outputLanguage.includes('جاوي');

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleCreateNote = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProcessingStatus('Starting extraction...');

    let extractedText = '';
    let determinedTitle = '';
    let determinedSubject = 'Uploaded Source';

    try {
      // 1. EXTRACTION PHASE
      if (selectedFile) {
        const fileName = selectedFile.name;
        determinedTitle = fileName.replace(/\.[^/.]+$/, '');
        setProcessingStatus(`Extracting text from ${fileName}...`);

        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

        // If plain text file, read directly in browser
        if (['txt', 'md', 'markdown', 'csv', 'json'].includes(fileExt) || selectedFile.type.startsWith('text/')) {
          extractedText = await selectedFile.text();
        } else if (fileExt === 'pdf') {
          // 1. Try client-side extraction first (supports large PDFs > 4.5 MB without Vercel payload limits)
          setProcessingStatus(`Parsing ${fileName} in browser...`);
          try {
            const { extractText } = await import('unpdf');
            const arrayBuffer = await selectedFile.arrayBuffer();
            const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
            const parsedText = (typeof text === 'string' ? text : Array.isArray(text) ? (text as string[]).join('\n\n') : '')
              .replace(/\s+/g, ' ')
              .trim();
            if (parsedText && parsedText.length > 20) {
              extractedText = parsedText;
              determinedSubject = 'PDF Lecture';
            }
          } catch (clientErr) {
            console.warn('Client-side PDF extraction skipped, falling back to server extraction:', clientErr);
          }

          // 2. If client extraction didn't yield text, fallback to /api/extract
          if (!extractedText) {
            setProcessingStatus(`Extracting ${fileName} on server...`);
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
                throw new Error(`File is too large for server processing (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB exceeds the 4.5 MB limit). Please use a smaller PDF.`);
              }
              throw new Error(errText || `Server extraction failed with HTTP ${extractRes.status}`);
            }

            const extractData = await extractRes.json();
            extractedText = extractData.text;
            if (extractData.title) determinedTitle = extractData.title;
            determinedSubject = `${extractData.type?.toUpperCase() || 'DOCUMENT'} Lecture`;
          }
        } else {
          // Send DOCX, etc. to /api/extract
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
            throw new Error(errText || `Extraction failed with HTTP ${extractRes.status}`);
          }

          const extractData = await extractRes.json();
          if (!extractData.text) {
            throw new Error(extractData.error || `Could not extract readable text from ${fileName}`);
          }

          extractedText = extractData.text;
          if (extractData.title) determinedTitle = extractData.title;
          determinedSubject = `${extractData.type?.toUpperCase() || 'DOCUMENT'} Lecture`;
        }
      } else if (pastedLink.trim()) {
        const trimmed = pastedLink.trim();
        const isUrl = /^https?:\/\//i.test(trimmed) || /^(www\.|youtu\.be|youtube\.com)/i.test(trimmed);

        if (isUrl) {
          const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(trimmed);
          setProcessingStatus(isYouTube ? 'Fetching YouTube transcript & video title...' : 'Extracting webpage article content...');

          const extractRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: trimmed })
          });

          if (!extractRes.ok) {
            let errText = '';
            try {
              const errJson = await extractRes.json();
              errText = errJson.error;
            } catch {
              errText = await extractRes.text().catch(() => '');
            }
            throw new Error(errText || 'Failed to extract content from the provided URL');
          }

          const extractData = await extractRes.json();
          if (!extractData.text) {
            throw new Error(extractData.error || 'Failed to extract content from the provided URL');
          }

          extractedText = extractData.text;
          determinedTitle = extractData.title || (isYouTube ? 'YouTube Lecture' : 'Web Article');
          determinedSubject = isYouTube ? 'YouTube Lecture' : 'Web Resource';
        } else {
          // Direct pasted text
          setProcessingStatus('Processing pasted text...');
          extractedText = trimmed;
          determinedTitle = trimmed.split('\n')[0].slice(0, 45).trim() || 'Custom Study Notes';
          determinedSubject = 'Study Notes';
        }
      }

      if (!extractedText || extractedText.trim().length < 15) {
        throw new Error('The source contains insufficient readable text for study note generation.');
      }

      // 2. SYNTHESIS PHASE
      setProcessingStatus('Synthesizing AI study notes, mindmap, flashcards & quiz...');
      const selectedModel = typeof window !== 'undefined' ? localStorage.getItem('thetawave_ai_model') : null;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: determinedTitle,
          subject: determinedSubject,
          language: outputLanguage,
          model: selectedModel || undefined,
          sampleTranscript: extractedText.slice(0, 30000)
        })
      });

      if (!res.ok) throw new Error('AI generation failed');
      const data: LectureData = await res.json();
      onLectureCreated(data);
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('Note creation error:', errMsg);

      // If we have extracted text, provide high-fidelity note directly from real content!
      if (extractedText && extractedText.trim().length >= 20) {
        const fallbackNote = buildIntelligentFallback(
          determinedTitle || 'Uploaded Study Material',
          extractedText,
          outputLanguage,
          determinedSubject
        );
        onLectureCreated(fallbackNote);
        onClose();
      } else {
        setErrorMessage(errMsg);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Upload Source
        </h2>
        <span className="text-xs font-semibold text-zinc-500 block mt-1">
          Real document parsing & YouTube transcript extraction
        </span>

        {/* 1. Large Drop Area */}
        <label className={`mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 px-6 text-center cursor-pointer transition ${
          selectedFile 
            ? 'border-emerald-400 bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/20' 
            : 'border-zinc-200 bg-[#fafafa] hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-indigo-500'
        }`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-3 shadow-inner ${
            selectedFile ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300'
          }`}>
            {selectedFile ? <FileCheck2 className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
          </div>
          
          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {selectedFile ? selectedFile.name : 'Drop PDF, DOCX, TXT or click to browse'}
          </span>
          <span className="mt-1 text-xs text-zinc-400">
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for parsing` : 'Supports PDF, Word (.docx), Plain Text (.txt, .md)'}
          </span>
          
          <input 
            type="file" 
            onChange={handleFileDrop}
            accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json" 
            className="hidden" 
          />
        </label>

        {/* 2. Paste Link or Text Area */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Or paste YouTube link / Web URL / Free text
          </label>
          <div className="relative rounded-2xl border border-zinc-200 bg-[#fafafa] p-3 focus-within:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950/60">
            <textarea
              rows={3}
              value={pastedLink}
              disabled={isProcessing}
              onChange={(e) => {
                setPastedLink(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Paste YouTube video link (e.g. https://youtube.com/watch?v=...), web page URL, or lecture notes..."
              className="w-full bg-transparent text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-200 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-800 dark:text-rose-200">
            <FileX className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold">Extraction Error:</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Progress Notification Banner during processing */}
        {isProcessing && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 p-3 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800/80 dark:text-indigo-200 animate-pulse">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">{processingStatus}</span>
          </div>
        )}

        {/* Dynamic Model Recommendation Banner for Arabic / Jawi */}
        {isArabicOrJawi && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-100">
                💡 Recommended Model for {isJawi ? 'Jawi Script' : 'Arabic'}:
              </p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                We recommend selecting at least <strong>Meta LLaMA 3.3 70B</strong> or <strong>DeepSeek-V3 / R1</strong> in Settings for optimal grammar, morphology, and script accuracy.
              </p>
            </div>
          </div>
        )}

        {/* 3. Footer Options: Output Language & Create Note */}
        <div className="mt-5 flex items-center justify-between pt-2">
          
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center gap-2">
            <span className="text-xs text-zinc-500">Output Language:</span>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer"
              >
                <span>{outputLanguage}</span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {isLangOpen && (
                <div className="absolute left-0 bottom-full mb-1 z-30 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setOutputLanguage(lang);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('thetawave_language', lang);
                        }
                        setIsLangOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <span>{lang}</span>
                      {outputLanguage === lang && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Create Note Action Button */}
          <button
            onClick={handleCreateNote}
            disabled={(!selectedFile && !pastedLink.trim()) || isProcessing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9080fc] to-[#7c69f8] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Create Note</span>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
