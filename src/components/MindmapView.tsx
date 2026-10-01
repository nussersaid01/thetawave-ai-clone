'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Code, 
  Eye,
  AlertCircle
} from 'lucide-react';

interface MindmapViewProps {
  markdown: string;
  title: string;
}

const transformer = new Transformer();

export const MindmapView: React.FC<MindmapViewProps> = ({ markdown, title }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let animId: number;
    let timeoutId: NodeJS.Timeout;

    const renderMindmap = () => {
      if (!svgRef.current || !isMounted) return;

      try {
        const { root } = transformer.transform(markdown);
        
        // Ensure SVG has viewBox so D3 zoom uses viewBox.baseVal rather than relative width/height
        if (svgRef.current && !svgRef.current.hasAttribute('viewBox')) {
          svgRef.current.setAttribute('viewBox', '0 0 1200 800');
        }

        if (!markmapRef.current && svgRef.current) {
          markmapRef.current = Markmap.create(
            svgRef.current,
            {
              autoFit: true,
              duration: 200,
              color: (node) => {
                const depth = node.state?.depth || 0;
                const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'];
                return colors[depth % colors.length];
              },
            },
            root
          );
        } else if (markmapRef.current) {
          markmapRef.current.setData(root);
          markmapRef.current.fit();
        }
        setHasError(false);
      } catch (err) {
        console.warn('Safe handled Markmap render warning:', err);
        setHasError(true);
      }
    };

    // Ensure layout measurement is settled
    animId = requestAnimationFrame(() => {
      timeoutId = setTimeout(renderMindmap, 60);
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
      if (markmapRef.current) {
        try {
          markmapRef.current.destroy();
        } catch (e) {
          // ignore cleanup errors
        }
        markmapRef.current = null;
      }
    };
  }, [markdown]);

  const handleZoomIn = () => {
    try {
      if (markmapRef.current) {
        markmapRef.current.rescale(1.25);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleZoomOut = () => {
    try {
      if (markmapRef.current) {
        markmapRef.current.rescale(0.8);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleFit = () => {
    try {
      if (markmapRef.current) {
        markmapRef.current.fit();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_mindmap.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Download SVG failed:', e);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-50/50 dark:bg-zinc-950">
      
      {/* Floating Control Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/90 p-1.5 shadow-md backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
        <button
          onClick={handleDownloadSVG}
          title="Export as SVG"
          className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowCode(!showCode)}
          title="Toggle Markdown Outline"
          className={`rounded-lg p-1.5 transition-colors ${
            showCode 
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' 
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400'
          }`}
        >
          {showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
        </button>
      </div>

      {/* Floating Instructions */}
      <div className="absolute bottom-4 left-4 z-20 hidden rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-[11px] text-zinc-500 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:block">
        💡 Drag to pan · Scroll to zoom · Click nodes to expand/collapse
      </div>

      {/* Code / Markdown Drawer if toggled */}
      {showCode && (
        <div className="absolute top-16 right-4 z-20 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Mindmap Markdown</h4>
          <pre className="text-xs text-zinc-800 dark:text-zinc-200 font-mono whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      )}

      {/* Fallback Display if Markmap SVG fails */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
          <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Outline View Active
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">
            Viewing structured mindmap outline. You can explore the full hierarchical tree below:
          </p>
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900 max-h-96 overflow-y-auto">
            <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {markdown}
            </pre>
          </div>
        </div>
      ) : (
        /* Interactive SVG Canvas */
        <div className="h-full w-full overflow-hidden">
          <svg 
            ref={svgRef} 
            viewBox="0 0 1200 800"
            className="h-full w-full cursor-grab active:cursor-grabbing select-none"
            style={{ width: '100%', height: '100%', display: 'block', minHeight: '500px' }}
          />
        </div>
      )}

    </div>
  );
};
