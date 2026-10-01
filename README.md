# ThetaWave AI Clone — AI Lecture Note Taker & Study Copilot

A high-performance clone of [ThetaWave AI](https://thetawave.ai) built with Next.js 15, React 19, Tailwind CSS, Markmap SVG, KaTeX mathematics, and Google Gemini multimodal AI integration.

---

## 🚀 Key Features

1. **📝 Rich Notes View with KaTeX Math**:
   - Executive TL;DR summary card.
   - Clean Markdown with full support for mathematical & scientific formulas ($E=mc^2$, matrices, integral equations).
   - Parameter comparison tables.
   - One-click copy and Markdown export.

2. **🧠 Interactive SVG Mind Maps (Markmap)**:
   - Dynamic hierarchical knowledge trees rendered using D3/Markmap.
   - Zoom in/out, pan, fit to screen, and collapsible/expandable nodes.
   - One-click SVG vector export and raw outline toggle.

3. **🗂️ Interactive 3D Flashcards Deck**:
   - Flip card 3D animations with keyboard navigation (Space to flip, Arrow keys to navigate).
   - Card counters, progress bars, and shuffle mode.
   - Confetti celebration upon deck mastery.

4. **🎯 Predictive Exam Quizzes**:
   - Interactive multiple-choice testing with instant scoring.
   - Green/red visual feedback and detailed answer explanations.
   - Score percentages, mastery badges, and retake modes.

5. **⏱️ GoFocus Mode**:
   - Pomodoro study timer (25-min focus sessions / 5-min recharge breaks).
   - Circular countdown visualizer, ambient sound toggle, and study science guidance.

6. **🎙️ Live Audio Recording & File Upload**:
   - HTML5 Web Audio API microphone recorder with animated live frequency waveform bars.
   - Drag-and-drop modal for PDF slides, Word documents, audio files (.mp3/.wav), and YouTube links.

7. **🤖 Study Buddy AI (Course-Grounded RAG Chat)**:
   - Slide-out assistant grounded directly in the current lecture notes.
   - One-click suggested questions and citation references.

---

## 🏗️ Architecture & Hybrid Storage Strategy

To solve Google Drive's virtual file system limitations (which rejects symlinks and chokes on `node_modules`):

- **Local Working Repository**: `C:\Users\nusse\projects\thetawave-ai-clone` (Fast SSD compilation, zero latency).
- **Google Drive Cloud Mirror**: `G:\My Drive\00 AI Integration\02 ThetaWave AI Clone` (Pure source code, configurations, notes, and documentation).
- **Automated Sync**: Run `sync_to_gdrive.ps1` or `sync_to_gdrive.bat` to mirror changes to Google Drive with strict exclusion of `node_modules` and `.next`.

---

## ⚡ Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. (Optional) Configure Gemini API
Copy `.env.example` to `.env.local` and add your Google Gemini API key:
```bash
GEMINI_API_KEY=your_key_here
```
*Note: If no API key is provided, ThetaWave AI automatically uses its built-in high-fidelity synthesis engine with zero downtime or setup required.*

### 3. Sync to Google Drive
```powershell
.\sync_to_gdrive.ps1
```
Or in Command Prompt:
```cmd
sync_to_gdrive.bat
```

---

## 📦 Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS, Lucide Icons
- **Math Rendering**: KaTeX
- **Mind Map Visualization**: Markmap (markmap-view, markmap-lib, D3)
- **Delight & Animations**: Canvas Confetti
- **AI Processing**: Google Gemini 2.5 Flash / Groq Whisper
