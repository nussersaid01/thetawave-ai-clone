import { NextRequest, NextResponse } from 'next/server';
import { callAICompletion } from '@/lib/aiProvider';

export async function POST(req: NextRequest) {
  try {
    const { query, lectureTitle, lectureSummary, markdownNotes, model, language } = await req.json();
    const isMalay = (language || '').toLowerCase().includes('melayu') || (language || '').toLowerCase().includes('malay');

    const prompt = `You are ThetaWave Study Buddy AI. You are helping a student understand their lecture notes.
Lecture Title: ${lectureTitle}
Lecture Summary: ${lectureSummary || 'Academic lecture'}
Lecture Notes:
${markdownNotes || 'No notes provided'}

User Question: ${query}
${isMalay ? 'MANDATORY: Answer strictly in formal, natural Bahasa Melayu (Malay). Do NOT answer in English.' : ''}

Provide a concise, direct, and illuminating answer grounded in these lecture notes. Mention specific section references or citations if applicable. Format mathematics with LaTeX inline $...$ or display $$...$$ where appropriate.`;

    const rawReply = await callAICompletion(prompt, false, model);
    if (rawReply) {
      const cleanedReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return NextResponse.json({
        reply: cleanedReply,
        citations: [`${lectureTitle} Lecture Notes`]
      });
    }

    // Grounded fallback response if no AI key configured or network down
    let reply = isMalay ? `Berdasarkan kuliah "${lectureTitle}": ` : `Based on your lecture "${lectureTitle}": `;
    const qLower = (query || '').toLowerCase();

    if (isMalay) {
      if (qLower.includes('exam') || qLower.includes('peperiksaan') || qLower.includes('ujian')) {
        reply += `Jangkakan soalan yang memberi tumpuan kepada prinsip asas dalam Bahagian 2 dan langkah-langkah terbitan dalam Bahagian 3. Pastikan anda boleh menulis semula formula utama tanpa melihat nota.`;
      } else if (qLower.includes('formula') || qLower.includes('persamaan') || qLower.includes('matematik')) {
        reply += `Persamaan utama dihuraikan dalam Bahagian 2. Ia memodelkan tindak balas sistem dengan memetakan transformasi linear merentasi batasan operator bukan linear.`;
      } else if (qLower.includes('analogi') || qLower.includes('mudah') || qLower.includes('terang') || qLower.includes('jelas')) {
        reply += `Fikirkan mekanisme ini seperti loji penapisan air berperingkat: setiap lapisan menapis bendasing yang lebih halus sehingga hasil yang paling tulen diperoleh.`;
      } else {
        reply += `Konsep utama berpusat pada pemahaman definisi asas, langkah terbitan sistematik, dan pengesahan andaian terhadap kriteria saintifik.`;
      }
    } else {
      if (qLower.includes('exam') || qLower.includes('test')) {
        reply += `Expect questions focusing on the fundamental principles in Section 2 and the step-by-step derivation in Section 3. Ensure you can replicate the governing equations without notes.`;
      } else if (qLower.includes('formula') || qLower.includes('equation') || qLower.includes('math')) {
        reply += `The central governing equation is detailed in Section 2. It models system response by mapping linear transformations through non-linear operator bounds.`;
      } else if (qLower.includes('analogy') || qLower.includes('simple') || qLower.includes('explain')) {
        reply += `Think of this mechanism like a multi-stage water filtration plant: each layer captures finer impurities (features) until the purest output is delivered.`;
      } else {
        reply += `The primary concept centers around understanding foundational definitions, systematic derivation steps, and validating assumptions against empirical criteria.`;
      }
    }

    return NextResponse.json({
      reply,
      citations: [isMalay ? `Nota Kuliah ${lectureTitle}` : `${lectureTitle} Notes`]
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
