/**
 * Universal AI Provider Gateway
 * Seamlessly supports:
 * 1. Google Gemini (100% Free - gemini-2.5-flash / gemini-1.5-flash)
 * 2. Groq Cloud (100% Free & Open Source - Llama 3.3 70B & DeepSeek R1 Distill)
 * 3. DeepSeek API (Ultra-Cheap & Super Smart - DeepSeek-V3 & DeepSeek-R1)
 * 4. OpenRouter (Free open-source & pay-as-you-go models)
 * 5. OpenAI / Custom OpenAI-compatible endpoints (Ollama, Together, vLLM)
 */

interface GenerateLectureParams {
  title: string;
  subject: string;
  transcript?: string;
}

interface ChatParams {
  query: string;
  lectureTitle: string;
  lectureSummary?: string;
  markdownNotes?: string;
}

export async function callAICompletion(prompt: string, jsonMode = false): Promise<string | null> {
  // 1. Google Gemini API
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const model = process.env.AI_MODEL || 'gemini-2.5-flash';
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: jsonMode ? { responseMimeType: 'application/json' } : {}
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      console.warn('Gemini request failed:', e);
    }
  }

  // 2. Groq Cloud (Free Open Source Llama 3.3 70B / DeepSeek R1)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.3
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('Groq request failed:', e);
    }
  }

  // 3. DeepSeek API (Ultra-cheap DeepSeek-V3 / DeepSeek-R1)
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    try {
      const model = process.env.AI_MODEL || 'deepseek-chat';
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          temperature: 0.3
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('DeepSeek request failed:', e);
    }
  }

  // 4. OpenRouter API (Supports Free Models like deepseek/deepseek-r1:free)
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    try {
      const model = process.env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('OpenRouter request failed:', e);
    }
  }

  // 5. Generic OpenAI-Compatible or Custom Base URL
  const genericKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  if (genericKey) {
    try {
      const model = process.env.AI_MODEL || 'gpt-4o-mini';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${genericKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('Generic OpenAI-compatible request failed:', e);
    }
  }

  return null;
}
