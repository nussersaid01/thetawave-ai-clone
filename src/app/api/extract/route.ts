import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import { YoutubeTranscript } from 'youtube-transcript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanHtmlText(html: string): { title: string; text: string } {
  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Web Source';

  // Remove scripts, styles, iframes, svgs, noscripts
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');

  // Replace block elements with line breaks
  cleaned = cleaned.replace(/<\/(p|div|h[1-6]|li|tr|article|section|blockquote)>/gi, '\n');
  cleaned = cleaned.replace(/<br\s*[\/]?>/gi, '\n');

  // Strip remaining tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–');

  // Normalize whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');

  return { title, text: cleaned.slice(0, 50000) };
}

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // CASE 1: Multipart Form Data (File Upload: PDF, DOCX, TXT, MD)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      const baseTitle = fileName.replace(/\.[^/.]+$/, '');

      // 1. PDF File
      if (fileExt === 'pdf' || file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const { text, totalPages } = await extractText(uint8, { mergePages: true });

        const rawPdfText = text;
        const extractedText = (typeof rawPdfText === 'string' ? rawPdfText : '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!extractedText || extractedText.length < 10) {
          return NextResponse.json({
            error: 'PDF contains no readable text or is image-only/scanned.'
          }, { status: 422 });
        }

        return NextResponse.json({
          title: baseTitle,
          text: extractedText.slice(0, 50000),
          totalPages,
          type: 'pdf'
        });
      }

      // 2. DOCX File
      if (fileExt === 'docx' || file.type.includes('wordprocessingml')) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        const extractedText = result.value.trim();

        if (!extractedText || extractedText.length < 10) {
          return NextResponse.json({
            error: 'DOCX document contains no readable text.'
          }, { status: 422 });
        }

        return NextResponse.json({
          title: baseTitle,
          text: extractedText.slice(0, 50000),
          type: 'docx'
        });
      }

      // 3. Plain Text / Markdown / Code / CSV
      if (['txt', 'md', 'markdown', 'csv', 'json', 'js', 'ts', 'py', 'html'].includes(fileExt) || file.type.startsWith('text/')) {
        const rawText = await file.text();
        const extractedText = rawText.trim();

        if (!extractedText || extractedText.length < 10) {
          return NextResponse.json({
            error: 'Text file is empty.'
          }, { status: 422 });
        }

        return NextResponse.json({
          title: baseTitle,
          text: extractedText.slice(0, 50000),
          type: 'text'
        });
      }

      return NextResponse.json({
        error: `Unsupported file format (.${fileExt}). Please upload PDF, DOCX, TXT, or MD.`
      }, { status: 400 });
    }

    // CASE 2: JSON Payload (YouTube URL, Web URL, or Pasted Text)
    const body = await req.json();
    const { url, text: rawPastedText } = body;

    // A. Pasted text directly
    if (rawPastedText && typeof rawPastedText === 'string' && rawPastedText.trim().length > 0) {
      const trimmed = rawPastedText.trim();
      const firstLine = trimmed.split('\n')[0].slice(0, 50).trim();
      return NextResponse.json({
        title: firstLine || 'Custom Notes',
        text: trimmed.slice(0, 50000),
        type: 'text'
      });
    }

    // B. Link / URL
    if (url && typeof url === 'string') {
      const cleanUrl = url.trim();

      // Check if YouTube link
      const videoId = extractYouTubeVideoId(cleanUrl);
      if (videoId) {
        let videoTitle = `YouTube Video (${videoId})`;
        // Attempt to fetch actual YouTube title via oEmbed
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
            signal: AbortSignal.timeout(4000)
          });
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            if (oembedData.title) {
              videoTitle = oembedData.title;
            }
          }
        } catch {
          // ignore oembed failure
        }

        // Fetch transcript
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
          if (transcriptItems && transcriptItems.length > 0) {
            const transcriptText = transcriptItems.map(item => item.text).join(' ');
            return NextResponse.json({
              title: videoTitle,
              text: transcriptText.slice(0, 50000),
              type: 'youtube'
            });
          }
        } catch (ytErr) {
          console.warn('Youtube transcript fetch error:', ytErr);
          return NextResponse.json({
            error: 'Could not fetch transcripts for this YouTube video. Captions or subtitles might be disabled for this video.'
          }, { status: 422 });
        }
      }

      // Check if Web URL
      const validWebUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') 
        ? cleanUrl 
        : `https://${cleanUrl}`;

      try {
        const webRes = await fetch(validWebUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(10000)
        });

        if (!webRes.ok) {
          return NextResponse.json({
            error: `Failed to fetch web page (HTTP ${webRes.status})`
          }, { status: 422 });
        }

        const html = await webRes.text();
        const { title, text } = cleanHtmlText(html);

        if (!text || text.length < 50) {
          return NextResponse.json({
            error: 'Web page contains insufficient text content.'
          }, { status: 422 });
        }

        return NextResponse.json({
          title,
          text,
          type: 'web'
        });
      } catch (webErr: unknown) {
        const msg = webErr instanceof Error ? webErr.message : String(webErr);
        return NextResponse.json({
          error: `Error accessing URL: ${msg}`
        }, { status: 422 });
      }
    }

    return NextResponse.json({ error: 'No valid file or URL provided' }, { status: 400 });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Extraction error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
