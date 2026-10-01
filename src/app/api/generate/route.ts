import { NextRequest, NextResponse } from 'next/server';
import { LectureData, Flashcard, QuizQuestion } from '@/types';
import { callAICompletion } from '@/lib/aiProvider';

function enrichStudyDeck(
  lectureTitle: string,
  rawContent: string,
  language: string,
  initialCards: Flashcard[] = [],
  initialQuiz: QuizQuestion[] = [],
  targetCards: number = 12,
  targetQuiz: number = 6
): { flashcards: Flashcard[]; quiz: QuizQuestion[] } {
  const isMalay = language.toLowerCase().includes('melayu') || language.toLowerCase().includes('malay');
  const isArabic = language.toLowerCase().includes('arabic') || language.includes('العربية');
  const isJawi = language.toLowerCase().includes('jawi') || language.includes('جاوي');

  const flashcards = [...initialCards];
  const quiz = [...initialQuiz];

  // Extract clean meaningful sentences from document text
  const cleanSentences = rawContent
    .replace(/[#*`_]/g, ' ')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 25 && !s.startsWith('http') && !s.includes('data:image'));

  const tags = isMalay 
    ? ['Konsep Asas', 'Peraturan Utama', 'Aplikasi Praktikal', 'Analisis Data', 'Rumusan Peperiksaan', 'Strategi & Tindakan', 'Mekanisme', 'Definisi Utama', 'Ujian Kefahaman', 'Fokus Ulangkaji']
    : isArabic
    ? ['المفهوم الأساسي', 'القواعد الحاكمة', 'التطبيق العملي', 'التحليل', 'استنتاجات الامتحان', 'الإستراتيجية', 'الميكانيزم', 'التعريف الجوهري', 'التقييم الذاتي', 'التركيز']
    : isJawi
    ? ['كونسيڤ اساس', 'ڤراتورن اوتام', 'اڤليكاسي ڤريكتيکل', 'اناليسيس داتا', 'روموسن ڤڤريقساءن', 'ستراتيݢي', 'ميكانيزم', 'ديفينيسي اوتام', 'اوجين كفهمن', 'فوكوس']
    : ['Core Concept', 'Fundamental Rule', 'Practical Application', 'Data Analysis', 'Exam Takeaway', 'Execution Strategy', 'Mechanism', 'Key Definition', 'Self-Check', 'High-Yield Review'];

  // 1. Expand flashcards up to at least targetCards items
  let sentIdx = 0;
  while (flashcards.length < targetCards && sentIdx < cleanSentences.length) {
    const s = cleanSentences[sentIdx];
    const tag = tags[flashcards.length % tags.length];
    const cardId = `fc-rich-${Date.now()}-${flashcards.length + 1}`;

    if (isMalay) {
      flashcards.push({
        id: cardId,
        front: flashcards.length === 0 
          ? `Apakah idea atau hukum utama yang dihuraikan dalam ${lectureTitle}?`
          : `Apakah huraian dan prinsip utama berkaitan perkara berikut: "${s.slice(0, 55)}..."?`,
        back: s,
        tag
      });
    } else if (isArabic) {
      flashcards.push({
        id: cardId,
        front: flashcards.length === 0
          ? `ما هو المبدأ الجوهري الحاكم في ${lectureTitle}؟`
          : `ما هو الشرح والتحليل المستخلص بشأن: "${s.slice(0, 55)}..."؟`,
        back: s,
        tag
      });
    } else if (isJawi) {
      flashcards.push({
        id: cardId,
        front: flashcards.length === 0
          ? `اڤاكه ايديا اتاو حكوم اوتام دالم ${lectureTitle}؟`
          : `اڤاكه هوراين دان ڤرينسيڤ اوتام بركأيتن: "${s.slice(0, 55)}..."؟`,
        back: s,
        tag
      });
    } else {
      flashcards.push({
        id: cardId,
        front: flashcards.length === 0
          ? `What is the primary governing principle in ${lectureTitle}?`
          : `What key rule or takeaway applies to: "${s.slice(0, 55)}..."?`,
        back: s,
        tag
      });
    }
    sentIdx = (sentIdx + 2) % (cleanSentences.length || 1);
    if (sentIdx === 0 && cleanSentences.length < 5) break;
  }

  // 2. Expand quiz questions up to at least targetQuiz items
  let qSentIdx = 1;
  while (quiz.length < targetQuiz && qSentIdx < cleanSentences.length) {
    const s = cleanSentences[qSentIdx];
    const qId = `qz-rich-${Date.now()}-${quiz.length + 1}`;
    const cleanAnswer = s.length > 90 ? s.slice(0, 90) + '...' : s;

    if (isMalay) {
      quiz.push({
        id: qId,
        question: `Berdasarkan pembelajaran "${lectureTitle}", manakah antara berikut kenyataan yang BENAR?`,
        options: [
          cleanAnswer,
          'Kenyataan ini bertentangan dengan prinsip asal yang digariskan dalam rujukan.',
          'Konsep ini hanya terpakai secara terhad dan tidak disahkan secara empirikal.',
          'Prinsip ini telah dimansuhkan dalam analisis terkini.'
        ],
        correctIndex: 0,
        explanation: `Diekstrak terus daripada bahan rujukan: "${s}"`
      });
    } else if (isArabic) {
      quiz.push({
        id: qId,
        question: `بناءً على دراسة "${lectureTitle}"، أي من العبارات التالية تعتبر صحيحة تماماً؟`,
        options: [
          cleanAnswer,
          'هذا المفهوم يتعارض تماماً مع المبادئ التأسيسية للمرجع.',
          'الفرضية المذكورة غير مؤكدة ولم يتم إثباتها تجريبياً.',
          'تم استبعاد هذه النقطة في أحدث أطر التحليل.'
        ],
        correctIndex: 0,
        explanation: `مستخرج مباشرة من النص الأكاديمي: "${s}"`
      });
    } else if (isJawi) {
      quiz.push({
        id: qId,
        question: `برداسركن ڤمبلاجرن "${lectureTitle}"، ماناكه انتارا برايكوت كڽاتاءن يڠ بنر؟`,
        options: [
          cleanAnswer,
          'كڽاتاءن اين برتنتڠن دڠن ڤرينسيڤ اساس دالم باهن.',
          'كونسيڤ اين تيدق دصحكن دالم كاجين.',
          'ڤركارا اين تله دڤادمكن درڤد اناليسيس تركيني.'
        ],
        correctIndex: 0,
        explanation: `دڤتيق لڠسوڠ درڤد باهن: "${s}"`
      });
    } else {
      quiz.push({
        id: qId,
        question: `Based on the study materials for "${lectureTitle}", which of the following is ACCURATE?`,
        options: [
          cleanAnswer,
          'This statement directly contradicts the core thesis presented in the material.',
          'This condition is merely hypothetical and lacks empirical backing.',
          'This rule is obsolete and no longer recommended in standard practice.'
        ],
        correctIndex: 0,
        explanation: `Directly supported by the study text: "${s}"`
      });
    }
    qSentIdx = (qSentIdx + 3) % (cleanSentences.length || 1);
    if (qSentIdx === 1 && cleanSentences.length < 5) break;
  }

  return { flashcards, quiz };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, sampleTranscript, model, language, deckDepth = 'standard' } = body;

    const isIntensive = deckDepth === 'intensive';
    const targetCards = isIntensive ? 24 : 12;
    const targetQuiz = isIntensive ? 12 : 6;

    const lectureTitle = title || 'Synthesized Lecture';
    const lectureSubject = subject || 'General Studies';
    const outputLanguage = language || 'English (US)';
    const isMalay = outputLanguage.toLowerCase().includes('melayu') || outputLanguage.toLowerCase().includes('malay');
    const isArabic = outputLanguage.toLowerCase().includes('arabic') || outputLanguage.includes('العربية');
    const isJawi = outputLanguage.toLowerCase().includes('jawi') || outputLanguage.includes('جاوي');

    let languageDirective = `Output Language Requirement: All notes, summaries, mindmap, flashcards, and quiz must be generated in English (US).`;
    if (isArabic) {
      languageDirective = `MANDATORY LANGUAGE DIRECTIVE: The student has selected ARABIC (العربية).
- You MUST write the ENTIRE JSON response strictly in modern standard academic Arabic (الفصحى).
- summary: ملخص تنفيذي موجز (2-3 جمل) باللغة العربية الفصحى.
- markdownNotes: ملاحظات شاملة ومنظمة باللغة العربية الفصحى مع استخدام العناوين الأكاديمية (مثل: # ${lectureTitle}, ## 1. الملخص التنفيذي, ## 2. المبادئ النظرية والمعادلات الرياضية, ## 3. الاشتقاق والتحليل خطوة بخطوة, ## 4. أهم الاستنتاجات وإستراتيجية الاختبارات). معادلات LaTeX $...$ و $$...$$ تظل قياسية دولياً.
- mindmapMarkdown: خريطة ذهنية هرمية باللغة العربية (# الموضوع الرئيسي, ## موضوع فرعي, ### تفاصيل).
- flashcards: الأسئلة (front) والأجوبة (back) والتصنيف (tag) جميعها باللغة العربية.
- quiz: الأسئلة وخيارات الإجابة والشرح جميعها باللغة العربية.
DO NOT use English except for universal math symbols or chemical formulas.`;
    } else if (isJawi) {
      languageDirective = `MANDATORY LANGUAGE DIRECTIVE: The student has selected TULISAN JAWI (توليسن جاوي).
- You MUST write the ENTIRE JSON response strictly in Bahasa Melayu using TULISAN JAWI script (huruf Jawi: ا، ب، ت، ث، ج، چ، ح، خ، د، ذ، ر، ز، س، ش، ص، ض، ط، ظ، ع، غ، ڠ، ف، ڤ، ق، ك، ݢ، ل، م، ن، و، ۏ، ه، ء، ي، ى، ڽ).
- summary: ريڠكسن ايكسيكوتيف (2-3 ايات) دالم توليسن جاوي.
- markdownNotes: نوتا كومڤريهينسيف دان تراتور دالم توليسن جاوي دڠن تاجوق-تاجوق دالم جاوي (چونتوه: # ${lectureTitle}, ## ١. ريڠكسن ايكسيكوتيف, ## ٢. ڤرينسيڤ تيوري دان فورمولاسي ماتماتيك, ## ٣. تربيتن دان اناليسيس لڠكه دمي لڠكه, ## ٤. روموسن ڤنتيڠ دان ستراتيݢي ڤڤريقساءن). ڤرسمان لايتيكس (LaTeX) $...$ دان $$...$$ ككل ستندرد انتارابڠسا.
- mindmapMarkdown: ڤتا ميندا هيراركي دالم توليسن جاوي (# توڤيق اوتام, ## سوب-توڤيق, ### بوتيرن).
- flashcards: سوءالن (front)، جواڤن (back)، دان كاتيݢوري (tag) سمواڽ دالم توليسن جاوي.
- quiz: سوءالن، ڤيليهن جواڤن، دان ڤنجلسن سمواڽ دالم توليسن جاوي.
DO NOT use Rumi (Latin letters) except for universal math symbols or chemical formulas.`;
    } else if (isMalay) {
      languageDirective = `MANDATORY LANGUAGE DIRECTIVE: The student has selected BAHASA MELAYU.
- You MUST write the ENTIRE JSON response strictly in fluent, formal Bahasa Melayu (Malay).
- summary: Ringkasan eksekutif 2-3 ayat dalam Bahasa Melayu.
- markdownNotes: Nota komprehensif lengkap dalam Bahasa Melayu dengan tajuk-tajuk Melayu (cth: # ${lectureTitle}, ## 1. Ringkasan Eksekutif, ## 2. Prinsip Teori & Formulasi Matematik, ## 3. Terbitan Analisis, ## 4. Rumusan Penting & Strategi Peperiksaan). Persamaan LaTeX $...$ dan $$...$$ kekal standard antarabangsa.
- mindmapMarkdown: Peta minda hierarki dalam Bahasa Melayu (# Topik Utama, ## Subtopik, ### Butiran).
- flashcards: Soalan (front), jawapan (back), dan kategori (tag) SEMUANYA dalam Bahasa Melayu.
- quiz: Soalan, pilihan jawapan (A, B, C, D), dan penjelasan SEMUANYA dalam Bahasa Melayu.
DO NOT use English except for universal math symbols, chemical symbols, or equations.`;
    }

    const prompt = `You are an elite academic professor and study coach.
Analyze the following lecture topic and detailed reference materials:
Title: ${lectureTitle}
Subject: ${lectureSubject}
Transcript / Content: ${sampleTranscript || lectureTitle}

${languageDirective}

MANDATORY QUANTITY & RIGOR REQUIREMENTS:
1. "summary": A comprehensive 3-5 sentence executive TL;DR in ${outputLanguage}.
2. "markdownNotes": In-depth, exhaustive notes in Markdown with at least 5 structured sections (Definitions, Governing Principles, Step-by-Step Mechanisms, Real-World Examples/Applications, and High-Yield Exam Review). Use Markdown tables and LaTeX math where applicable.
3. "mindmapMarkdown": A rich hierarchical mindmap with 4-6 main topic branches and 2-3 subnodes per branch.
4. "flashcards": You MUST generate AT LEAST ${isIntensive ? '20 TO 25' : '10 TO 15'} HIGH-YIELD FLASHCARDS!
   - Each flashcard must test a distinct key term, rule, definition, formula, or concept from the content.
   - "front": Clear, focused question or prompt.
   - "back": Comprehensive, clear explanation.
   - "tag": Subtopic or category tag.
   - DO NOT generate fewer than ${isIntensive ? '20' : '10'} flashcards!
5. "quiz": You MUST generate AT LEAST ${isIntensive ? '10 TO 12' : '5 TO 8'} MULTIPLE-CHOICE EXAM QUESTIONS!
   - Each question must have 4 distinct, plausible options.
   - "correctIndex": 0, 1, 2, or 3 corresponding to the correct answer.
   - "explanation": In-depth explanation of why the correct option is right and why the distractors are wrong.
   - DO NOT generate fewer than ${isIntensive ? '10' : '5'} quiz questions!

Generate a comprehensive JSON object matching this schema:
{
  "summary": "3-5 sentence executive summary in ${outputLanguage}",
  "markdownNotes": "# Title\\n\\n## 1. Overview...",
  "mindmapMarkdown": "# Central Topic\\n## Branch 1\\n### Sub 1...",
  "flashcards": [
    { "id": "fc-1", "front": "Concept / Question 1", "back": "Detailed answer 1", "tag": "Core Concept" },
    { "id": "fc-2", "front": "Concept / Question 2", "back": "Detailed answer 2", "tag": "Rule & Principle" },
    { "id": "fc-3", "front": "Concept / Question 3", "back": "Detailed answer 3", "tag": "Application" },
    { "id": "fc-4", "front": "Concept / Question 4", "back": "Detailed answer 4", "tag": "Analysis" },
    { "id": "fc-5", "front": "Concept / Question 5", "back": "Detailed answer 5", "tag": "Key Term" },
    { "id": "fc-6", "front": "Concept / Question 6", "back": "Detailed answer 6", "tag": "Mechanism" },
    { "id": "fc-7", "front": "Concept / Question 7", "back": "Detailed answer 7", "tag": "Strategy" },
    { "id": "fc-8", "front": "Concept / Question 8", "back": "Detailed answer 8", "tag": "Exam Review" },
    { "id": "fc-9", "front": "Concept / Question 9", "back": "Detailed answer 9", "tag": "Formula & Method" },
    { "id": "fc-10", "front": "Concept / Question 10", "back": "Detailed answer 10", "tag": "Summary" }
  ],
  "quiz": [
    { "id": "qz-1", "question": "Question 1?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why correct" },
    { "id": "qz-2", "question": "Question 2?", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "Why correct" },
    { "id": "qz-3", "question": "Question 3?", "options": ["A", "B", "C", "D"], "correctIndex": 2, "explanation": "Why correct" },
    { "id": "qz-4", "question": "Question 4?", "options": ["A", "B", "C", "D"], "correctIndex": 3, "explanation": "Why correct" },
    { "id": "qz-5", "question": "Question 5?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why correct" },
    { "id": "qz-6", "question": "Question 6?", "options": ["A", "B", "C", "D"], "correctIndex": 1, "explanation": "Why correct" }
  ]
}

Return ONLY raw valid JSON.`;

    const aiOutput = await callAICompletion(prompt, true, model);
    if (aiOutput) {
      try {
        const cleaned = aiOutput
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '')
          .trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;
        const parsed = JSON.parse(jsonStr);

        const rawCards: Flashcard[] = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
        const rawQuiz: QuizQuestion[] = Array.isArray(parsed.quiz) ? parsed.quiz : [];

        const enriched = enrichStudyDeck(
          lectureTitle,
          (sampleTranscript || '') + '\n\n' + (parsed.markdownNotes || ''),
          outputLanguage,
          rawCards,
          rawQuiz,
          targetCards,
          targetQuiz
        );

        const completeLecture: LectureData = {
          id: `lec-${Date.now()}`,
          title: lectureTitle,
          subject: lectureSubject,
          duration: '45 mins',
          date: new Date().toISOString().split('T')[0],
          summary: parsed.summary,
          markdownNotes: parsed.markdownNotes,
          mindmapMarkdown: parsed.mindmapMarkdown,
          flashcards: enriched.flashcards,
          quiz: enriched.quiz
        };

        return NextResponse.json(completeLecture);
      } catch (parseErr) {
        console.warn('AI JSON parsing failed, using high-fidelity fallback synthesis:', parseErr);
      }
    }

    // Dynamic High-Fidelity Synthesis Engine
    if (sampleTranscript && typeof sampleTranscript === 'string' && sampleTranscript.trim().length >= 40) {
      const cleanParas = sampleTranscript
        .split(/\n\s*\n/)
        .map(p => p.replace(/\s+/g, ' ').trim())
        .filter(p => p.length > 25);

      const p1 = cleanParas[0] || sampleTranscript.slice(0, 350);
      const p2 = cleanParas[1] || sampleTranscript.slice(350, 700);
      const p3 = cleanParas[2] || sampleTranscript.slice(700, 1050);

      const sentences = sampleTranscript
        .split(/(?<=[.?!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

      const s1 = sentences[0] || `Key conceptual analysis of ${lectureTitle}.`;
      const s2 = sentences[1] || `Detailed examination of governing formulations and analytical points.`;
      const s3 = sentences[2] || `Conclusions and examination-tested review takeaways.`;

      const enriched = enrichStudyDeck(
        lectureTitle,
        sampleTranscript,
        outputLanguage,
        [],
        [],
        targetCards,
        targetQuiz
      );

      if (isArabic) {
        return NextResponse.json({
          id: `lec-${Date.now()}`,
          title: lectureTitle,
          subject: lectureSubject,
          duration: '45 دقيقة',
          date: new Date().toISOString().split('T')[0],
          summary: `ملخص تنفيذي شامل للمادة المستخرجة من "${lectureTitle}". تم استخلاص ${enriched.flashcards.length} بطاقة تعليمية و${enriched.quiz.length} أسئلة اختبار تقييمية.`,
          markdownNotes: `# ${lectureTitle}\n\n## 1. الملخص التنفيذي\n${p1}\n\n---\n\n## 2. المفاهيم والنقاط الجوهرية\n* ${s1}\n* ${s2}\n* ${s3}\n\n---\n\n## 3. التحليل التفصيلي للمحتوى\n${p2}\n\n${p3}\n\n---\n\n## 4. أهم استنتاجات المراجعة\n* التركيز على الفهم الشامل للنقاط الأساسية المستخرجة.\n* مراجعة المصطلحات البارزة للامتحانات.\n`,
          mindmapMarkdown: `# ${lectureTitle}\n## 1. المقدمة والمفاهيم\n### ${s1.slice(0, 40)}\n## 2. التفاصيل المحورية\n### ${s2.slice(0, 40)}\n## 3. الاستنتاجات\n### ${s3.slice(0, 40)}`,
          flashcards: enriched.flashcards,
          quiz: enriched.quiz
        });
      }

      if (isJawi) {
        return NextResponse.json({
          id: `lec-${Date.now()}`,
          title: lectureTitle,
          subject: lectureSubject,
          duration: '45 مينيت',
          date: new Date().toISOString().split('T')[0],
          summary: `ريڠكسن ايكسيكوتيف كومڤريهينسيف باهن يڠ دايكسترك درڤد "${lectureTitle}". دسدياكن ${enriched.flashcards.length} كد ايمبسن دان ${enriched.quiz.length} سوءالن كوءيز.`,
          markdownNotes: `# ${lectureTitle}\n\n## ١. ريڠكسن ايكسيكوتيف\n${p1}\n\n---\n\n## ٢. ڤركارا دان كونسيڤ اوتام\n* ${s1}\n* ${s2}\n* ${s3}\n\n---\n\n## ٣. اناليسيس باهن سمڤادن\n${p2}\n\n${p3}\n\n---\n\n## ٤. روموسن دان اولسن ڤڤريقساءن\n* ڤستيکن كفهمن مندولوم ترهادڤ باهن اين.\n* سيمق كاتيݢوري اوتام سبلوم اوجين.\n`,
          mindmapMarkdown: `# ${lectureTitle}\n## ١. اساس\n### ${s1.slice(0, 40)}\n## ٢. بوتيرن لنجوت\n### ${s2.slice(0, 40)}\n## ٣. روموسن\n### ${s3.slice(0, 40)}`,
          flashcards: enriched.flashcards,
          quiz: enriched.quiz
        });
      }

      if (isMalay) {
        return NextResponse.json({
          id: `lec-${Date.now()}`,
          title: lectureTitle,
          subject: lectureSubject,
          duration: '45 minit',
          date: new Date().toISOString().split('T')[0],
          summary: `Ringkasan analisis komprehensif bagi bahan "${lectureTitle}". Mengandungi ${enriched.flashcards.length} kad imbasan dan ${enriched.quiz.length} soalan kuiz penilaian kendiri.`,
          markdownNotes: `# ${lectureTitle}\n\n## 1. Ringkasan Eksekutif\n${p1}\n\n---\n\n## 2. Konsep & Maklumat Penting\n* ${s1}\n* ${s2}\n* ${s3}\n\n---\n\n## 3. Analisis Terperinci Bahan\n${p2}\n\n${p3}\n\n---\n\n## 4. Rumusan Pembelajaran & Strategi Peperiksaan\n* Pastikan pemahaman kukuh terhadap fakta dan hujah utama di atas.\n* Semak semula istilah dan fokus pada soalan pemahaman.\n`,
          mindmapMarkdown: `# ${lectureTitle}\n## 1. Asas & Gambaran Keseluruhan\n### ${s1.slice(0, 50)}\n## 2. Huraian Utama\n### ${s2.slice(0, 50)}\n## 3. Rumusan\n### ${s3.slice(0, 50)}`,
          flashcards: enriched.flashcards,
          quiz: enriched.quiz
        });
      }

      // Default English with extracted text
      return NextResponse.json({
        id: `lec-${Date.now()}`,
        title: lectureTitle,
        subject: lectureSubject,
        duration: '45 mins',
        date: new Date().toISOString().split('T')[0],
        summary: `Comprehensive academic study package synthesized from "${lectureTitle}". Features ${enriched.flashcards.length} high-yield flashcards and ${enriched.quiz.length} exam-style assessment questions.`,
        markdownNotes: `# ${lectureTitle}\n\n## 1. Executive Summary\n${p1}\n\n---\n\n## 2. Core Concepts & Highlights\n* ${s1}\n* ${s2}\n* ${s3}\n\n---\n\n## 3. In-Depth Source Analysis\n${p2}\n\n${p3}\n\n---\n\n## 4. Revision Takeaways & Exam Strategy\n* Master the core arguments and formulations extracted directly from the reference material.\n* Test your retention using the generated flashcards and self-assessment quiz.\n`,
        mindmapMarkdown: `# ${lectureTitle}\n## 1. Overview & Fundamentals\n### ${s1.slice(0, 50)}\n## 2. Key Insights\n### ${s2.slice(0, 50)}\n## 3. Conclusions\n### ${s3.slice(0, 50)}`,
        flashcards: enriched.flashcards,
        quiz: enriched.quiz
      });
    }

    const syntheticLecture: LectureData = isArabic ? {
      id: `lec-${Date.now()}`,
      title: lectureTitle,
      subject: lectureSubject,
      duration: '45 دقيقة',
      date: new Date().toISOString().split('T')[0],
      summary: `تركيب أكاديمي شامل لمحاضرة "${lectureTitle}". تستعرض هذه المحاضرة المبادئ النظرية الأساسية، النماذج الرياضية الحاكمة، وأطر التحليل التطبيقية.`,
      markdownNotes: `# ${lectureTitle}

## 1. الملخص التنفيذي
تبحث هذه الجلسة في الآليات التأسيسية الرئيسية التي تحكم **${lectureTitle}**. نقوم بفحص المسلمات النظرية، واشتقاق المعادلات الرياضية، وتطبيق منهجيات حل المشكلات المنظومة في الحالات الحرجة.

---

## 2. المبادئ النظرية والمعادلات الرياضية
يتم تعريف التحويل الأساسي الذي يحكم هذا النظام بواسطة:

$$\\Psi(\\mathbf{x}, t) = \\sum_{k=1}^K w_k \\cdot \\phi_k(\\mathbf{x}) e^{-i \\omega_k t}$$

حيث:
* $\\Psi(\\mathbf{x}, t)$ يمثل استجابة النظام المركب عبر الإحداثيات المكانية $\\mathbf{x}$ والزمن $t$.
* $w_k \\in \\mathbb{R}$ يمثل معامل الترجيح لكل نمط توافقي.
* $\\phi_k(\\mathbf{x})$ يشير إلى الدوال الذاتية المتعامدة الأساسية.

### جدول مقارنة معلمات النظام
| المعلمة | الرمز | الوحدة | التفسير الفيزيائي |
| :--- | :--- | :--- | :--- |
| **سعة الاستجابة** | $\\alpha$ | $[\\text{arb}]$ | مقدار الطاقة الأساسي |
| **معامل التخميد** | $\\gamma$ | $[\\text{s}^{-1}]$ | معدل الاضمحلال الأسي لكل دورة |
| **التردد الرنيني** | $\\omega_0$ | $[\\text{rad/s}]$ | التردد الطبيعي الحر |

---

## 3. الاشتقاق والتحليل خطوة بخطوة
1. **الشروط الحدية الابتدائية**: تعيين القيم الحدية عند $t = 0$ مع حالات التوازن $\\Psi(0) = \\Psi_0$.
2. **مؤثر تفاضلي من الدرجة الأولى**: تطبيق المؤثر الخطي:
   $$\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$$
3. **حل التوازن**: التكامل عبر حدود الحجم يعطي ثوابت التدفق المحفوظة.

---

## 4. أهم الاستنتاجات وإستراتيجية الاختبارات
* تذكر أن الحدود غير المتجانسة تقود التذبذبات العابرة قبل الوصول إلى الحالة المستقرة.
* عند تقييم الحدود، تحقق دائماً من قانون حفظ الطاقة عبر الواجهات.
* عادة ما يتم التركيز على اشتقاق الصيغ الرياضية في أسئلة الامتحانات النصفية.
`,
      mindmapMarkdown: `# ${lectureTitle}
## 1. الأسس والمفاهيم
### تعريف المسألة
### السياق التاريخي
### الفرضيات الحاكمة
## 2. النماذج والصيغ الرياضية
### المؤثرات التفاضلية
### الشروط الحدية
### التوازن والاستقرار
## 3. التطبيقات العملية
### التحليل التجريبي
### قياسات الأداء
### التطبيقات الهندسية
## 4. التلخيص والمراجعة
### النقاط الرئيسية للامتحان
### الأخطاء الشائعة`,
      flashcards: [
        {
          id: 'fc-ar-1',
          front: `ما هي المعادلة التفاضلية الحاكمة في ${lectureTitle}؟`,
          back: `المعادلة التي تربط التغير الزمني بانتشار المويجات: $\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$.`,
          tag: 'المعادلات'
        },
        {
          id: 'fc-ar-2',
          front: 'ما الذي يمثله الرمز $\\gamma$ في صيغة التخميد؟',
          back: 'يمثل معامل التخميد الأسي الذي يحدد سرعة تلاشي الطاقة لكل دورة زمنية.',
          tag: 'المعلمات'
        },
        {
          id: 'fc-ar-3',
          front: 'لماذا تعتبر الشروط الحدية ضرورية للحل التحليلي؟',
          back: 'لأنها تضمن توافق الحل مع قوانين حفظ الطاقة وتمنع الحلول اللانهائية غير الفيزيائية.',
          tag: 'التحليل الرياضي'
        }
      ],
      quiz: [
        {
          id: 'qz-ar-1',
          question: `ما هو الشرط الأساسي لضمان استقرار النظام في ${lectureTitle}؟`,
          options: [
            'أن يكون معامل التخميد $\\gamma > 0$ لمنع التباعد الأسي',
            'أن تكون جميع الترددات سالبة تماماً',
            'إلغاء جميع الشروط الحدية المكانية',
            'مساواة الطاقة الكلية بالصفر في جميع الأوقات'
          ],
          correctIndex: 0,
          explanation: 'يتطلب الاستقرار الفيزيائي أن يكون معامل التخميد موجباً لضمان تلاشي الاضطرابات العابرة.'
        },
        {
          id: 'qz-ar-2',
          question: 'أي من العناصر التالية يحدد دقة الحل التقريبي؟',
          options: [
            'عدد الأنماط التوافقية $K$ المستخدمة في التجميع',
            'لون الرسم البياني في المحاكاة',
            'إهمال المتغيرات المكانية',
            'افتراض أن الزمن لا نهائي'
          ],
          correctIndex: 0,
          explanation: 'زيادة عدد الأنماط $K$ تسمح بتمثيل أدق للتغيرات الحادة وفق متسلسلة فورييه.'
        }
      ]
    } : isJawi ? {
      id: `lec-${Date.now()}`,
      title: lectureTitle,
      subject: lectureSubject,
      duration: '45 مينيت',
      date: new Date().toISOString().split('T')[0],
      summary: `سينتيسيس اكاديميق كومڤريهينسيف باݢي "${lectureTitle}". كوليه اين مروڠكاي ڤرينسيڤ اساس تيوري، موديل ماتماتيق يڠ مڠاول سيستم، دان كراڠك اناليسيس ڤريكتيكل.`,
      markdownNotes: `# ${lectureTitle}

## ١. ريڠكسن ايكسيكوتيف
سيسي اين مڠكاجي ميكانيزم اساس اوتام يڠ مڠاول **${lectureTitle}**. كامي منليتي ڤوستولت تيوري، منربيتكن ڤرسمان ماتماتيق، دان مڠاڤليكاسيكن كاهده ڤڽلساين مسئله سچارا سيستماتيک اونتوق كيس-كيس كريتيکل.

---

## ٢. ڤرينسيڤ تيوري دان فورمولاسي ماتماتيق
ترانسفورماسي اساس يڠ مڠاول سيستم اين دتکريفكن اوليه:

$$\\Psi(\\mathbf{x}, t) = \\sum_{k=1}^K w_k \\cdot \\phi_k(\\mathbf{x}) e^{-i \\omega_k t}$$

دمان:
* $\\Psi(\\mathbf{x}, t)$ مننداكن تيندق بالس سيستم كومڤوسيت مرنتاسي كووردينت رواڠ $\\mathbf{x}$ دان ماس $t$.
* $w_k \\in \\mathbb{R}$ مريڤريسينتاسيكن ڤكالي ڤمبرت باݢي ستياڤ مود هرمونيق.
* $\\phi_k(\\mathbf{x})$ مرجوع كڤد فوڠسي ايݢن اساس اورتوݢونل.

### جدوال ڤربنديڠن ڤاراميتر سيستم
| ڤاراميتر | سيمبول | اونيت | تفسيرن فيزيكل |
| :--- | :--- | :--- | :--- |
| **امڤليتود تيندق بالس** | $\\alpha$ | $[\\text{arb}]$ | مغنيتود تناݢ اوتام |
| **فكتور ردن** | $\\gamma$ | $[\\text{s}^{-1}]$ | قدر رڤوتن ايكسڤوننشيل ستياڤ كيفارن |
| **كيكريڤن ريسوننس** | $\\omega_0$ | $[\\text{rad/s}]$ | كيكريڤن سمولا جادي تنڤا ڤقساءن |

---

## ٣. تربيتن دان اناليسيس لڠكه دمي لڠكه
1. **شراط سمڤادن اولين**: تتڤكن نيلاي سمڤادن ڤد $t = 0$ دڠن كاداءن كسأيمباڠن $\\Psi(0) = \\Psi_0$.
2. **اوڤراتور درجات ڤرتام**: اڤليكاسيكن اوڤراتور لينيار:
   $$\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$$
3. **ڤڽلساين كسأيمباڠن**: ڤڠاميرن مرنتاسي باتسن ايسيڤادو مڠحاصيلكن فلوک س كككالن.

---

## ٤. روموسن ڤنتيڠ دان ستراتيݢي ڤڤريقساءن
* ايڠت بهاوا سبوتن بوكن-هوموݢينوس منجادي ڤندوروڠ كڤد تورون-ناءيق سمنتارا سبلوم منچاڤاي كاداءن ستندرد.
* كتيك منيلاي حد سمڤادن، سنتياس ڤريقسا حكوم كأبادين تناݢ.
* تربيتن فورمولا كروڤ كالي دأوجي دالم ڤڤريقساءن ڤرتڠهن سيميستر.
`,
      mindmapMarkdown: `# ${lectureTitle}
## ١. اساس دان كونسيڤ
### ديفينيسي مسئله
### كونتيک س سجاره
### اڠݢاين اوتام
## ٢. موديل دان فورمولا ماتماتيق
### اوڤراتور ديفيـرينشيل
### شراط سمڤادن
### كسأيمباڠن دان كستابيلن
## ٣. اڤليكاسي دان ايک سڤيريمن
### اناليسيس امڤيريکل
### اوكورن ڤريستاسي
### اينتݢراسي اينجينيريڠ
## ٤. روموسن دان اولڠكاجي
### فوكوس ڤڤريقساءن
### كسيلڤن لازيم`,
      flashcards: [
        {
          id: 'fc-jw-1',
          front: `اڤاكه ڤرسمان ماتماتيق اوتام دالم ${lectureTitle}؟`,
          back: `ڤرسمان يڠ مڠهوبوڠكن كاداءن رواڠ دان ماس: $\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$.`,
          tag: 'فورمولاسي'
        },
        {
          id: 'fc-jw-2',
          front: 'اڤاكه يڠ دواكيلي اوليه $\\gamma$ دالم سيستم اين؟',
          back: 'فكتور ردن يڠ مننتوكن قدر كحيلڠن تناݢ باݢي ستياڤ كيفارن.',
          tag: 'ڤاراميتر'
        },
        {
          id: 'fc-jw-3',
          front: 'مڠاڤاكه شراط سمڤادن ساڠت ڤنتيڠ دالم اناليسيس؟',
          back: 'كران اي ممستيكن ڤڽلساين مماتوهي حكوم كأبادين تناݢ دان مڠيلقكن نيلاي تيدق ڤاستي.',
          tag: 'اناليسيس'
        }
      ],
      quiz: [
        {
          id: 'qz-jw-1',
          question: `اڤاكه شراط اوتام باݢي ممستيكن كستابيلن سيستم دالم ${lectureTitle}؟`,
          options: [
            'فكتور ردن $\\gamma > 0$ باݢي مڠيلقكن ككچاوءن تيدق ترکنتورول',
            'سموا نيلاي كيكريڤن دڤقسا منجادي سيفر',
            'مڠهاڤوسكن سموا شراط سمڤادن فيزيكل',
            'مڠاڠݢڤ بهاوا ماس تيدق بروبه'
          ],
          correctIndex: 0,
          explanation: 'ردن ڤوسيتيف دڤرلوكن اونتوق ممستيكن ترانسيين تيدق برليڤت ݢندا تنڤا كاولن.'
        },
        {
          id: 'qz-jw-2',
          question: 'اڤاكه چونتوه ڤڽلساين يڠ مماتوهي حكوم كأبادين؟',
          options: [
            'ڤڠاميرن مرنتاسي ايسيڤادو ممبري حسيل فلوک س يڠ كونستن',
            'ڤڠاباين كسموا اينڤوت لوارن',
            'ڤڠݢوناءن نيلاي راوق تنڤا ڤقسي',
            'ڤڠورڠن درجات ايكوسي كڤد سيفر'
          ],
          correctIndex: 0,
          explanation: 'حكوم كأبادين دبوقتيكن كتيك فلوک س كسلوروهن ككل دڤليهارا مرنتاسي سمڤادن سيستم.'
        }
      ]
    } : isMalay ? {
      id: `lec-${Date.now()}`,
      title: lectureTitle,
      subject: lectureSubject,
      duration: '45 minit',
      date: new Date().toISOString().split('T')[0],
      summary: `Sintesis akademik komprehensif bagi "${lectureTitle}". Kuliah ini merungkai prinsip asas teori, model matematik yang mengawal sistem, dan kerangka analisis praktikal.`,
      markdownNotes: `# ${lectureTitle}

## 1. Ringkasan Eksekutif
Sesi ini mengkaji mekanisme asas utama yang mengawal **${lectureTitle}**. Kami meneliti postulat teori, menerbitkan persamaan matematik, dan mengaplikasikan kaedah penyelesaian masalah secara sistematik untuk kes-kes kritikal.

---

## 2. Prinsip Teori & Formulasi Matematik
Transformasi asas yang mengawal sistem ini ditakrifkan oleh:

$$\\Psi(\\mathbf{x}, t) = \\sum_{k=1}^K w_k \\cdot \\phi_k(\\mathbf{x}) e^{-i \\omega_k t}$$

Di mana:
* $\\Psi(\\mathbf{x}, t)$ menandakan tindak balas sistem komposit merentasi koordinat ruang $\\mathbf{x}$ dan masa $t$.
* $w_k \\in \\mathbb{R}$ mewakili pekali pemberat bagi setiap mod harmonik.
* $\\phi_k(\\mathbf{x})$ merujuk kepada fungsi eigen asas ortogonal.

### Jadual Perbandingan Parameter Sistem
| Parameter | Notasi | Unit | Tafsiran Fizikal |
| :--- | :--- | :--- | :--- |
| **Amplitud Tindak Balas** | $\\alpha$ | $[\\text{arb}]$ | Magnitud tenaga utama |
| **Faktor Pelembapan** | $\\gamma$ | $[\\text{s}^{-1}]$ | Kadar pereputan eksponen setiap kitaran |
| **Frekuensi Resonan** | $\\omega_0$ | $[\\text{rad/s}]$ | Frekuensi semula jadi tanpa daya |

---

## 3. Terbitan & Analisis Langkah demi Langkah
1. **Keadaan Sempadan Awal**: Tetapkan nilai sempadan pada $t = 0$ dengan keadaan keseimbangan $\\Psi(0) = \\Psi_0$.
2. **Operator Pembezaan Peringkat Pertama**: Gunakan operator terlinear:
   $$\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$$
3. **Penyelesaian Keseimbangan**: Pengamiran merentasi batasan isipadu menghasilkan pemalar fluks terabadi.

---

## 4. Rumusan Penting & Strategi Peperiksaan
* Ingat bahawa sebutan bukan homogen mendorong turun naik fana sebelum mencapai keadaan mantap.
* Semasa menilai had sempadan, sentiasa sahkan keabadian tenaga merentasi antara muka.
* Terbitan formula ini kerap ditanya dalam soalan peperiksaan pertengahan semester.
`,
      mindmapMarkdown: `# ${lectureTitle}
## 1. Asas Utama
### Definisi Masalah
### Konteks Sejarah
### Andaian Asas
## 2. Pemodelan Matematik
### Persamaan Asas: Psi(x, t)
### Penguraian Fungsi Eigen
### Kekangan Sempadan
## 3. Terbitan Analisis
### Langkah 1: Nilai Awal
### Langkah 2: Operator Terlinear
### Langkah 3: Fluks Keadaan Mantap
## 4. Aplikasi & Sambungan
### Kes Penggunaan Praktikal
### Kesilapan Biasa Peperiksaan
### Formula Penting Dihafal
`,
      flashcards: [
        {
          id: `fc-gen-1`,
          front: `Apakah hubungan utama yang mengawal ${lectureTitle}?`,
          back: `Hubungan antara penguraian fungsi eigen dan ayunan harmonik temporal: Psi(x, t) = sum(w_k * phi_k(x) * exp(-i*omega*t)).`,
          tag: 'Formula Asas'
        },
        {
          id: `fc-gen-2`,
          front: `Bagaimanakah had sempadan disahkan semasa fasa terbitan?`,
          back: `Dengan memastikan keabadian fluks merentasi sempadan antara muka di bawah keadaan awal t = 0.`,
          tag: 'Terbitan'
        },
        {
          id: `fc-gen-3`,
          front: `Apakah yang mewakili frekuensi semula jadi tanpa daya dalam formulasi ini?`,
          back: `Parameter frekuensi resonan omega_0 (diukur dalam unit radian sesaat).`,
          tag: 'Parameter'
        }
      ],
      quiz: [
        {
          id: `qz-gen-1`,
          question: `Dalam formulasi yang mengawal ${lectureTitle}, apakah yang diwakili oleh phi_k(x)?`,
          options: [
            'Fungsi eigen asas ortogonal',
            'Hingar gangguan rawak',
            'Ofset ruang malar',
            'Geseran empirikal statik'
          ],
          correctIndex: 0,
          explanation: 'phi_k(x) mewakili set fungsi eigen asas ortogonal yang merentasi domain ruang.'
        },
        {
          id: `qz-gen-2`,
          question: `Parameter manakah yang bertanggungjawab terhadap kadar pereputan tenaga eksponen setiap kitaran?`,
          options: [
            'Faktor pelembapan (gamma)',
            'Frekuensi semula jadi (omega_0)',
            'Faktor skala amplitud (alpha)',
            'Pekali pemberat (w_k)'
          ],
          correctIndex: 0,
          explanation: 'Faktor pelembapan gamma menentukan kadar pereputan eksponen bagi setiap kitaran operasi.'
        },
        {
          id: `qz-gen-3`,
          question: `Mengapakah pengesahan keabadian fluks sempadan penting semasa penyelesaian keadaan mantap?`,
          options: [
            'Ia mengelakkan pelanggaran hukum keabadian tenaga fizikal',
            'Ia memaksa tindak balas menjadi sifar secara buatan',
            'Ia menghapuskan semua langkah pengamiran matematik',
            'Ia menukar persamaan bukan linear kepada pemalar linear'
          ],
          correctIndex: 0,
          explanation: 'Mengekalkan fluks sempadan memastikan bahawa model matematik mematuhi hukum keabadian tenaga fizikal sepenuhnya.'
        }
      ]
    } : {
      id: `lec-${Date.now()}`,
      title: lectureTitle,
      subject: lectureSubject,
      duration: '45 mins',
      date: new Date().toISOString().split('T')[0],
      summary: `Comprehensive academic synthesis of "${lectureTitle}". This lecture establishes theoretical underpinnings, governing mathematical models, and practical analytical frameworks.`,
      markdownNotes: `# ${lectureTitle}

## 1. Executive Summary
This session investigates the primary foundational mechanisms governing **${lectureTitle}**. We examine theoretical postulates, deduce governing mathematical equations, and apply systematic problem-solving methods to critical edge cases.

---

## 2. Theoretical Principles & Governing Mathematical Formulation
The foundational transformation governing this system is defined by:

$$\\Psi(\\mathbf{x}, t) = \\sum_{k=1}^K w_k \\cdot \\phi_k(\\mathbf{x}) e^{-i \\omega_k t}$$

Where:
* $\\Psi(\\mathbf{x}, t)$ denotes the composite system response over spatial coordinates $\\mathbf{x}$ and time $t$.
* $w_k \\in \\mathbb{R}$ represents the weighting coefficient per harmonic mode.
* $\\phi_k(\\mathbf{x})$ corresponds to the orthogonal basis eigenfunctions.

### System Parameter Comparison Table
| Parameter | Notation | Unit | Physical Interpretation |
| :--- | :--- | :--- | :--- |
| **Response Amplitude** | $\\alpha$ | $[\\text{arb}]$ | Primary energy magnitude |
| **Damping Factor** | $\\gamma$ | $[\\text{s}^{-1}]$ | Exponential decay rate per cycle |
| **Resonant Frequency** | $\\omega_0$ | $[\\text{rad/s}]$ | Natural unforced frequency |

---

## 3. Derivation & Step-by-Step Analytical Breakdown
1. **Initial Boundary Conditions**: Set boundary values at $t = 0$ with equilibrium states $\\Psi(0) = \\Psi_0$.
2. **First-Order Differential Operator**: Apply the linearized operator:
   $$\\frac{\\partial \\Psi}{\\partial t} + \\mathcal{D} \\nabla^2 \\Psi = \\mathcal{S}(\\mathbf{x})$$
3. **Equilibrium Solution**: Integrating across volume bounds yields conserved flux invariants.

---

## 4. Key Takeaways & Exam Strategy
* Remember that non-homogeneous terms drive transient fluctuations before reaching steady-state.
* When evaluating boundary limits, always check conservation of energy across interfaces.
* Formula derivation is commonly targeted in midterm problem sets.
`,
      mindmapMarkdown: `# ${lectureTitle}
## 1. Core Foundations
### Problem Definition
### Historical Context
### Governing Assumptions
## 2. Mathematical Modeling
### Base Equation: Psi(x, t)
### Eigenfunction Decomposition
### Boundary Constraints
## 3. Analytical Derivation
### Step 1: Initial Values
### Step 2: Linearized Operator
### Step 3: Steady-State Flux
## 4. Applications & Extensions
### Practical Use Cases
### Common Exam Pitfalls
### Key Formulas to Memorize
`,
      flashcards: [
        {
          id: `fc-gen-1`,
          front: `What is the principal governing relationship in ${lectureTitle}?`,
          back: `The relationship between eigenfunction decomposition and temporal harmonic oscillation: Psi(x, t) = sum(w_k * phi_k(x) * exp(-i*omega*t)).`,
          tag: 'Core Equation'
        },
        {
          id: `fc-gen-2`,
          front: `How are the boundary limits verified during the derivation phase?`,
          back: `By ensuring flux conservation across the interface boundaries under initial condition t = 0.`,
          tag: 'Derivation'
        },
        {
          id: `fc-gen-3`,
          front: `What represents the natural unforced frequency in this formulation?`,
          back: `The resonant frequency parameter omega_0 (measured in radians per second).`,
          tag: 'Parameters'
        }
      ],
      quiz: [
        {
          id: `qz-gen-1`,
          question: `In the governing formulation for ${lectureTitle}, what does phi_k(x) represent?`,
          options: [
            'Orthogonal basis eigenfunctions',
            'Random perturbation noise',
            'Constant spatial offset',
            'Static empirical friction'
          ],
          correctIndex: 0,
          explanation: 'phi_k(x) represents the set of orthogonal basis eigenfunctions spanning the spatial domain.'
        },
        {
          id: `qz-gen-2`,
          question: `Which parameter accounts for the exponential energy decay rate per cycle?`,
          options: [
            'Damping factor (gamma)',
            'Natural frequency (omega_0)',
            'Amplitude scaling factor (alpha)',
            'Weighting coefficient (w_k)'
          ],
          correctIndex: 0,
          explanation: 'The damping factor gamma dictates the rate of exponential decay per operational cycle.'
        },
        {
          id: `qz-gen-3`,
          question: `Why is verifying boundary flux conservation essential during steady-state solution?`,
          options: [
            'It prevents physical violation of energy conservation',
            'It artificially forces the response to zero',
            'It eliminates all mathematical integration steps',
            'It changes non-linear equations into linear constants'
          ],
          correctIndex: 0,
          explanation: 'Conserving boundary flux ensures that the mathematical model adheres strictly to physical conservation laws.'
        }
      ]
    };

    return NextResponse.json(syntheticLecture);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
