'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { LectureData } from '@/types';
import { Copy, Check, Download, BookOpen, Clock, Calendar } from 'lucide-react';

interface NotesViewProps {
  lecture: LectureData;
}

export const NotesView: React.FC<NotesViewProps> = ({ lecture }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(lecture.markdownNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([lecture.markdownNotes], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${lecture.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe Tokenized Parser for Markdown + KaTeX (Prevents SVG element splitting)
  const formattedContent = useMemo(() => {
    let raw = lecture.markdownNotes;
    const mathTokens: string[] = [];

    // 1. Extract display math $$...$$
    raw = raw.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        mathTokens.push(`<div class="my-4 overflow-x-auto py-2 text-center">${rendered}</div>`);
      } catch (err) {
        mathTokens.push(`<pre class="text-red-500">${math}</pre>`);
      }
      return `\n\n%%MATH_BLOCK_${mathTokens.length - 1}%%\n\n`;
    });

    // 2. Extract inline math $...$
    raw = raw.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        mathTokens.push(rendered);
      } catch (err) {
        mathTokens.push(`<code>${math}</code>`);
      }
      return `%%MATH_INLINE_${mathTokens.length - 1}%%`;
    });

    // 3. Parse Markdown lines without breaking SVG tags
    const lines = raw.split('\n');
    const htmlLines: string[] = [];
    let inTable = false;
    let tableHtml = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<div class="my-4 overflow-x-auto"><table class="w-full border-collapse border border-zinc-200 dark:border-zinc-800 text-left text-xs">';
        }
        
        if (line.includes('---')) {
          continue;
        }

        const cols = line.split('|').slice(1, -1);
        const isHeader = !tableHtml.includes('<tbody>');

        if (isHeader) {
          tableHtml += '<thead class="bg-zinc-100 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-zinc-100"><tr>';
          cols.forEach(c => {
            tableHtml += `<th class="border border-zinc-200 dark:border-zinc-800 px-3 py-2">${c.trim()}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr class="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">';
          cols.forEach(c => {
            tableHtml += `<td class="border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-700 dark:text-zinc-300">${c.trim()}</td>`;
          });
          tableHtml += '</tr>';
        }
        continue;
      } else if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table></div>';
        htmlLines.push(tableHtml);
      }

      const trimmed = line.trim();
      if (trimmed.startsWith('%%MATH_BLOCK_') && trimmed.endsWith('%%')) {
        htmlLines.push(trimmed);
      } else if (line.startsWith('# ')) {
        htmlLines.push(`<h1 class="mt-6 mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${line.replace('# ', '')}</h1>`);
      } else if (line.startsWith('## ')) {
        htmlLines.push(`<h2 class="mt-5 mb-2 text-lg font-semibold tracking-tight text-indigo-700 dark:text-indigo-400 border-b border-zinc-200 dark:border-zinc-800 pb-1">${line.replace('## ', '')}</h2>`);
      } else if (line.startsWith('### ')) {
        htmlLines.push(`<h3 class="mt-3 mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">${line.replace('### ', '')}</h3>`);
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        htmlLines.push(`<li class="ml-4 list-disc text-sm text-zinc-700 dark:text-zinc-300 my-1">${line.substring(2)}</li>`);
      } else if (line.trim() === '---') {
        htmlLines.push('<hr class="my-5 border-zinc-200 dark:border-zinc-800" />');
      } else if (line.trim().length > 0) {
        htmlLines.push(`<p class="my-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">${line}</p>`);
      }
    }

    if (inTable) {
      tableHtml += '</tbody></table></div>';
      htmlLines.push(tableHtml);
    }

    let result = htmlLines.join('\n');

    // 4. Re-inject KaTeX rendered math tokens intact
    mathTokens.forEach((tokenHtml, idx) => {
      result = result.replaceAll(`%%MATH_BLOCK_${idx}%%`, tokenHtml);
      result = result.replaceAll(`%%MATH_INLINE_${idx}%%`, tokenHtml);
    });

    return result;
  }, [lecture.markdownNotes]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      
      {/* Header Info & Actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            <BookOpen className="h-3 w-3" />
            {lecture.subject}
          </span>
          <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
            {lecture.title}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
            {lecture.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {lecture.duration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {lecture.date}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white p-5 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-950">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
          Executive Summary (TL;DR)
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {lecture.summary}
        </p>
      </div>

      {/* Formatted Notes Body */}
      <div 
        className="prose prose-zinc max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />

    </div>
  );
};
