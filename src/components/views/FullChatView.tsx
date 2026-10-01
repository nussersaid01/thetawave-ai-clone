'use client';

import React, { useState } from 'react';
import { LectureData, ChatMessage } from '@/types';
import { Bot, User, Send, Sparkles, BookOpen, Layers, Check } from 'lucide-react';

interface FullChatViewProps {
  notes: LectureData[];
}

export const FullChatView: React.FC<FullChatViewProps> = ({ notes }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello Nusser! I am your ThetaWave Study Copilot. I have analyzed all your uploaded lectures and notes. Ask me anything, compare concepts across courses, or ask for exam predictions!',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const promptSuggestions = [
    'Summarize the core equations across all my courses',
    'What will likely be tested in my upcoming exams?',
    'Give me a mnemonic to remember ATP yield in cellular respiration',
    'Compare Backpropagation with biological learning models'
  ];

  const handleSend = async (customQuery?: string) => {
    const query = customQuery || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Pick contextual notes
    const contextNotes = selectedCourse === 'all' 
      ? notes 
      : notes.filter(n => n.id === selectedCourse);

    const mergedNotes = contextNotes.map(n => `### ${n.title}\n${n.markdownNotes}`).join('\n\n---\n\n');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          lectureTitle: selectedCourse === 'all' ? 'All Courses Library' : contextNotes[0]?.title,
          lectureSummary: 'Multi-course synthesis',
          markdownNotes: mergedNotes
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || ['Notes Knowledge Hub']
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Fallback response for full chat', err);
      setTimeout(() => {
        let replyText = `Synthesizing answer from your library: `;
        if (query.toLowerCase().includes('equation') || query.toLowerCase().includes('formula')) {
          replyText += `Key mathematical formulations include: 1) Neural backpropagation error delta = ((W^[l+1])^T * delta^[l+1]) element-wise multiplied by sigma'(z); and 2) Chemiosmotic ATP synthesis in mitochondria.`;
        } else if (query.toLowerCase().includes('exam') || query.toLowerCase().includes('test')) {
          replyText += `High-probability exam questions: Be prepared to derive the gradient updates dL/dW for hidden layers, and detail the proton gradient mechanism across Complex I-IV in cellular respiration.`;
        } else {
          replyText += `Your notes connect systematic mathematical formulation with biological and computational structures. Regular review of the flashcards will solidify long-term retention.`;
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: ['All Notes Library']
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden max-w-4xl mx-auto w-full px-4 py-6">
      
      {/* Header & Course Scope Selector */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Study Assistant AI
          </h2>
          <p className="text-xs text-zinc-500">
            Ask questions grounded in all your notes and study materials.
          </p>
        </div>

        {/* Scope Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Context:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="all">@ All Courses ({notes.length} notes)</option>
            {notes.map(n => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto border-b border-zinc-100 dark:border-zinc-800/60">
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 whitespace-nowrap transition dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            ✨ {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-zinc-100/80 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none border border-zinc-200/60 dark:border-zinc-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.citations && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-800 flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <BookOpen className="h-3 w-3" />
                    <span>Cited from: {m.citations.join(', ')}</span>
                  </div>
                )}
                
                <span className="block text-[10px] text-zinc-400 mt-1.5 text-right">
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white shadow-sm mt-0.5">
                  N
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 pl-11">
            <Bot className="h-4 w-4 animate-spin text-indigo-600" />
            <span>ThetaWave AI is formulating response...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask questions about your courses or request explanations..."
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
