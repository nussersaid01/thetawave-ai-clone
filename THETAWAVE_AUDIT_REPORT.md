# 🔬 ThetaWave AI Official Platform: Comprehensive Reverse-Engineering & Architectural Audit Report
`[Audit Timestamp: 2026-10-02 13:14]` | `Auditor: Principal Agentic AI Engineer` | `Account: Nusser (nusser.said01@gmail.com)`

---

## 1. Executive Summary & Verification Context
Under explicit `/goal` directive, an end-to-end live testing session was conducted directly on the official production platform of **ThetaWave AI** ([https://thetawave.ai](https://thetawave.ai)) authenticated under the user's account (`Nusser`).

- **Tested Document**: `G:\My Drive\Sains-Tingkatan-1.pdf` (87.6 MB Malaysian Form 1 Science Textbook, 288 Pages).
- **Execution Proof**: Note created with ID `cmuqhp2nq00u8nf06dgs4aa86` and processed via ThetaWave's live server pipeline into two automatically structured parts:
  - Part 1: `🧪 과학적 탐구와 측정 기술 – 밀도부터 생식까지 (Part 1)`
  - Part 2: `⚖️ 혼합물과 화합물의 차이점 (Part 2)`
- **Key Findings**: ThetaWave operates a sophisticated **tRPC v2** API backend with Next.js App Router, Radix UI primitives, Markmap SVG interactive graphs, Amazon S3 audio synthesis, and a cross-document Retrieval-Augmented Generation (RAG) system with clickable citation chips.

---

## 2. Platform Architecture & API Data Contract

### 2.1 API Infrastructure (tRPC v2 Architecture)
ThetaWave uses batched tRPC calls (`/api/v2.<router>.<procedure>?batch=1`).

```
                              [ Client / Frontend (Next.js) ]
                                            │
                                ┌───────────┴───────────┐
                                │   tRPC v2 Batching    │
                                └───────────┬───────────┘
                                            │
       ┌────────────────────┬───────────────┼───────────────┬────────────────────┐
       ▼                    ▼               ▼               ▼                    ▼
[v2.uploads]          [v2.note]         [v2.quiz]      [v2.flashcard]       [v2.ai.podcast]
S3 Signed URL      Progressive Note     MCQ Engine      Spaced Repetition    Audio Generation
```

#### Key Identified tRPC Procedures:
1. `v2.uploads.getSignedUrl`: Direct-to-S3 multi-part pre-signed URL generator for documents up to 500MB.
2. `v2.note.createRawNote`: Registers initial note entry with sources, learning goals, and course links.
3. `v2.note.startProgressiveGenerationV2`: Triggers backend asynchronous synthesis pipeline.
4. `v2.note.getRawNote`: Returns synthesized markdown notes, extracted text, and model metadata.
5. `v2.note.getContentBlocks`: Returns progressive generation status (`GENERATING` -> `COMPLETED`).
6. `v2.note.getFlashcardsForNote`: Retrieves the 18+ flashcard set.
7. `v2.quiz.getQuiz`: Returns 6+ MCQ questions with in-depth pedagogical explanations.
8. `v2.ai.getPodcast`: Streams pre-rendered AWS S3 dual-voice academic discussion audio.
9. `v2.chat.getChatHistory`: Persisted session history for the "Ask Theta" assistant.
10. `v2.courses.listCourses` & `v2.folders.listFolders`: Organizational hierarchy.
11. `v2.focus.getFocusProfile` & `v2.focus.getCurrentFocusState`: Collaborative Pomodoro state.

### 2.2 Progressive Note Generation Pipeline
When an 87.6MB PDF is processed, ThetaWave visualizes a 4-step progressive stepper:
1. **Step 1: Parsed content text & structures**: Extracts multi-page text and images.
2. **Step 2: Extracted key entities & concepts**: Classifies topics, formulas, and terminology.
3. **Step 3: Built logical hierarchies**: Constructs chapter groupings and divides oversized documents into manageable chunks (e.g. Part 1 & Part 2).
4. **Step 4: Synthesized final structured notes**: Generates rich Markdown (~99,700 characters) containing definition callouts, structured comparison tables, and emoji-decorated section headers.

---

## 3. Exhaustive Feature & UI/UX Teardown

### 3.1 Top Navigation & Study Room Tabs (`/app/note/[id]`)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Hide TOC]  [Note] [Mindmap] [Infographic] [Quiz] [Flashcards] [Podcast]   [Share] [⋮]│
├─────────────────────┬──────────────────────────────────────────┬───────────────────────┤
│                     │                                          │                       │
│ Table of Contents   │           Active Tab Viewport            │      Ask Theta        │
│ (Sticky Scrollspy)  │   (Note / Mindmap / Quiz / Cards / etc)  │  (Slide-Out AI RAG)   │
│                     │                                          │                       │
└─────────────────────┴──────────────────────────────────────────┴───────────────────────┘
```

#### 1. Note View (Core Synthesis)
- **Sticky Table of Contents**: Left sidebar displaying interactive anchor links with chapter hierarchy and active scrollspy indicator.
- **Rich Markdown Formatting**:
  - Headings with contextual emojis (`## 📚`, `## ⚗️`, `## 📈`, `## ⚖️`).
  - Blockquotes for high-yield definitions (`> **Term** is defined as...`).
  - Comparison Tables with explicit headers and alternate row shading.
  - Inline image snapshots extracted directly from the uploaded PDF.
- **Top Utility Actions**: `Hide/Show TOC`, `Share note`, `Export (PDF / Docx / Markdown)`, `Add to folder`, `Add to course`.

#### 2. Mindmap View
- **Engine**: Rendered via SVG utilizing `markmap-view` (`class="markmap"`).
- **Interactions**:
  - Node expansion / collapse on click.
  - Mouse-drag panning and scroll-wheel zoom.
- **Floating Controls (Bottom-Right)**:
  - `放大` (Zoom In)
  - `缩小` (Zoom Out)
  - `Fit to Screen` (Auto-recenter graph)
  - `Fullscreen Toggle`
  - `下载` (Export as SVG or PNG)
  - `Feedback` (Like / Dislike thumbs)

#### 3. Infographic View
- Generates 3 full-width visual slides summarizing core concepts.
- Pagination: `Page 1 of 3` with Prev/Next controls.
- Actions: `Regenerate` and `Download Slide`.

#### 4. Quiz View (Pedagogical Engine)
- **Top Header**: Stepper bar with real-time completion percentage (`0%` -> `17%` -> `100%`), plus `Previous` and `Next` navigation.
- **Question Layout**:
  - Badge: `Question N` & `Single choice` / `Multiple choice`.
  - Full question prompt.
  - 4 Selectable option buttons (Labeled `A`, `B`, `C`, `D`).
- **Instant Answer Feedback**:
  - Correct answer highlighted in emerald green with checkmark icon.
  - Incorrect selection highlighted in crimson red.
  - **"👇 Explanation" Accordion**:
    - Detailed explanation of why the correct option is right.
    - Explicit breakdown of why each distracter option (1, 2, 3) is incorrect.
    - Feedback widget: *"Was this explanation clear?"* with Like/Dislike thumbs.
  - `Report question` link.

#### 5. Flashcards View (Spaced Repetition)
- **Top Header**: `Card X of 18`.
- **Top Card Actions**:
  - `Improve`: AI prompt to rewrite, simplify, or provide mnemonics.
  - `Flip`: 3D card perspective flip between Front and Back.
- **Card Body**: Large typography concept title on front; comprehensive explanation on back.
- **Bottom Navigation**:
  - `Prev` / `Next` buttons.
  - `All Flashcards` button: Opens modal grid view with search, card editing, deletion, and `+ Add New Flashcard` inputs.
  - `Regenerate`: Rebuilds the entire deck with fresh angles.

#### 6. Podcast View (Audio Synthesis)
- **Audio Engine**: Pre-rendered AWS S3 MP3 stream with dual AI speakers discussing the lesson.
- **Player Interface**:
  - Language indicator (`EN English`).
  - Scrubber / Progress slider with current time and duration (`00:00 / 11:25`).
  - Play / Pause button.
  - Speed selector: `0.75x`, `1x`, `1.25x`, `1.5x`, `2x`.

#### 7. Ask Theta (Slide-Out Study Buddy)
- **Quick Action Chips**:
  - `Summarize my notes`
  - `Help me explain this concept`
  - `Generate a study plan`
  - `Find related resources`
  - `Generate a mind map`
  - `Analyze key points`
- **Grounded Cross-Note Citations**: Displays exact source badges (e.g. `⚖️ 혼합물과 화합물의 차이점 (Part 2)`).
- **Message Response Actions**: `Retry`, `Copy`, `Like`, `Dislike`, and interactive follow-up suggestion chips (`💭 Still confused?`).
- **Input Controls**: Text input, `Attach file`, `Current Note` badge, `Search` mode, and `Standard` model tier.

---

### 3.2 Platform-Wide Views & Global Systems

#### 1. Home Dashboard (`/app/dashboard`)
- Hero Greeting: `"Hello [Name] - How can Theta help you learn?"` + Quick Theme Switcher.
- 3 Primary Entry Cards:
  1. `Upload Sources`: Files, audio, YouTube, web, text.
  2. `Real-time Transcript`: Live recording from microphone with auto-summarization.
  3. `Write by Myself`: Blank rich-text note editor.
- Secondary Widgets:
  - `Dig into My Notes`: Global omnibar searching across all notes.
  - `Recent Notes`: Horizontal list of recently opened notes with covers and timestamps.
  - `App Download QR Banner`: Links to Google Play and Apple App Store.

#### 2. Upload Sources Modal (`dialog "Upload Source"`)
- **Drag & Drop Zone**: Supports PDF, DOCX, PPTX, TXT, MD, MP3, M4A, WAV, MP4, and images.
- **Omni Link/Text Input**: Auto-detects YouTube URLs, Web URLs, or raw pasted lecture text.
- **Learning Goals Selector**: Preset buttons (`Prepare for an exam`, `Review before a quiz`, `Finish homework`, `Understand this lecture`, `Make study notes`, `Generate questions`, `Make flashcards`, `Other`).
- **Course Assignment**: Combobox to link source to an existing Course or check *"This is not for a specific course"*.
- **Language Selector**: Supports 14 languages including `🌐 Auto`, `MS Bahasa Melayu`, `EN English`, `ZH 中文`, `JA 日本語`, `KO 한국어`, `ES Español`, `FR Français`, `DE Deutsch`.

#### 3. All Notes (`/app/notes`)
- Search bar with instant debounced filtering.
- Filter dropdowns: `All Courses`, `Sort by Date / Title`, `Ascending / Descending`.
- Batch `Select` mode for bulk export, folder assignment, or deletion.
- Note Cards: Emoji icon, Title, Creation Date, `Add to folder`, `Add to Course`, and overflow menu.

#### 4. Learn Feed (`/app/feed`)
- Duolingo-style gamified learning roadmap:
  - Concept broken down into sequential daily levels.
  - Daily quiz challenges with XP and streak tracking.

#### 5. Sources Library (`/app/sources`)
- Central asset manager categorizing all student files into tabs:
  - `Document (N)`
  - `Audio (N)`
  - `Youtube (N)`
  - `Web (N)`
  - `Image (N)`
- Shows parent note links for every uploaded asset.

#### 6. Focus Room (`/focus`)
- Virtual ambient study rooms with real-time synchronized timer.
- **Live Atmosphere**: Real-time counter of active global students (`97,269 online`) with live quotes rolling across the screen.
- **Study Scenes**:
  - `Hunter's Cabin` (Cozy fire-lit forest cabin with acoustic guitar radio)
  - `Vinyl Bookstore` (Jazz & vintage bookstore ambiance)
  - `Dopamine Library` (Bright & focused academic study hall)
  - `Blues Café` (Rainy city coffee shop)
  - `Onsen Retreat` (Japanese hot spring & mountain stream)
- **Collaborative Study Groups**: Multi-student rooms with group chat and shared study objectives.

#### 7. Pro Tier & Monetization (`/app/settings/team/billing`)
- Free Quota: 3 notes limit with progress bar (`N/3 notes created`).
- Pro Pricing Modal:
  - `Annually: $118.80/yr ($0.33/day)` (Best Value)
  - `Quarterly: $47.70/qtr ($0.53/day)` (Most Popular with 3-day trial)
  - `Weekly: $19.90/wk ($2.84/day)`
- Feature Gates: 500MB file uploads, unlimited note generation, podcast generation, and high-fidelity chat models.

---

## 4. Gap Analysis: ThetaWave Official vs Our Current Clone

| Feature / Subsystem | Official ThetaWave Platform | Our Clone (Current State) | Alignment Plan |
| :--- | :--- | :--- | :--- |
| **Progressive Synthesis UI** | 4-step real-time stepper (`Parsing` -> `Entities` -> `Hierarchies` -> `Notes`) | Single spinner with basic stage text | Replicate exact 4-step progressive stepper card with animated icons |
| **Document Auto-Chunking** | Automatically splits >50MB / multi-chapter documents into Part 1, Part 2 | Extracts whole text as single lecture | Add automatic chapter / page-count threshold splitting into multi-part folders |
| **Table of Contents** | Sticky left navigation with active scrollspy on headings | Inline markdown without TOC navigation | Implement sticky left `TableOfContents` component with smooth scrollspy |
| **Mindmap Controls** | Markmap SVG with floating toolbar (Zoom +/-, Fit, Fullscreen, Download PNG/SVG) | Markmap SVG with basic zoom buttons | Add floating control dock with PNG/SVG export and fullscreen support |
| **Quiz Explanations** | Detailed breakdown of correct answer + why each wrong option failed + feedback | Basic correct/incorrect feedback with brief hint | Upgrade `/api/generate` prompt schema to return comprehensive distracter explanations |
| **All Flashcards Manager** | Modal table allowing direct editing, deleting, and custom card creation | Interactive card slider only | Add `All Flashcards` modal dialog with editable Front/Back cards and add/delete actions |
| **Sources Library View** | Dedicated `/app/sources` tab categorizing files by Document, Audio, YouTube, Web | Embedded inside modal upload list | Build dedicated `SourcesView.tsx` with file type filters and parent note references |
| **Focus Room Scenes** | 5 aesthetic scenes (Cabin, Library, Café, Onsen) with audio beds & live counters | Single-room timer with Web Audio noise presets | Add scene switcher with rich photographic backgrounds and ambient soundscapes |
| **Ask Theta RAG Drawer** | Slide-out right drawer with grounded citation chips and prompt buttons | Floating chat widget with standard chat bubbles | Refactor into full right-hand drawer with citation chips linking to note sections |

---

## 5. Architectural Upgrade Roadmap (Phase 1 to Phase 3)

1. **Phase 1: Study Room Layout & Navigation Parity**:
   - Re-architect `NotesView.tsx` to mirror the official 3-column layout: Sticky TOC on left, active study tab in center, and collapsible `Ask Theta` drawer on right.
   - Wire top tab triggers: `Note`, `Mindmap`, `Quiz`, `Flashcards`, `Podcast`.
2. **Phase 2: Pedagogical & Synthesis Engine Enhancement**:
   - Update `/api/generate` to return complete explanation breakdowns for quizzes (including distracter analysis).
   - Implement the `All Flashcards` management modal with card-level editing and addition.
   - Refactor Mindmap with the floating bottom-right dock (`Zoom In`, `Zoom Out`, `Fit`, `Export PNG/SVG`).
3. **Phase 3: Platform Views & Polish**:
   - Build `SourcesView.tsx` at `/app/sources` categorized by media type.
   - Enhance `GoFocusView.tsx` to support scene browsing (`Dopamine Library`, `Hunter's Cabin`, `Onsen Retreat`) with ambient nature sound beds.
   - Add the 4-step progressive generation stepper on source upload.

---
`End of Architectural Audit Report`
