'use client';

import React, { useState, useEffect } from 'react';
import { sampleLectures, sampleLecturesMalay, defaultFolders } from '@/lib/sampleData';
import { LectureData, StudyFolder } from '@/types';
import { Sidebar, ViewMode } from '@/components/Sidebar';
import { HomeDashboard } from '@/components/HomeDashboard';
import { Navbar } from '@/components/Navbar';
import { NotesView } from '@/components/NotesView';
import { MindmapView } from '@/components/MindmapView';
import { FlashcardsView } from '@/components/FlashcardsView';
import { QuizView } from '@/components/QuizView';
import { GoFocusView } from '@/components/GoFocusView';
import { UploadSourceModal } from '@/components/UploadSourceModal';
import { AudioRecorderModal } from '@/components/AudioRecorderModal';
import { ChatDrawer } from '@/components/ChatDrawer';
import { UpgradeModal } from '@/components/UpgradeModal';
import { SettingsModal } from '@/components/SettingsModal';

// Dedicated views for full sidebar navigation
import { AllNotesView } from '@/components/views/AllNotesView';
import { LearnHubView } from '@/components/views/LearnHubView';
import { FullChatView } from '@/components/views/FullChatView';
import { SourcesView } from '@/components/views/SourcesView';
import { FoldersView } from '@/components/views/FoldersView';
import { Home as HomeIcon, FileText, Timer, Folder, Settings } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [lectures, setLectures] = useState<LectureData[]>(sampleLectures);
  const [folders, setFolders] = useState<StudyFolder[]>(defaultFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'mindmap' | 'flashcards' | 'quiz' | 'focus'>('notes');
  const [notesFilter, setNotesFilter] = useState<string>('All');
  
  // Theme & Pro States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Modals & Drawers
  const [isUploadSourceModalOpen, setIsUploadSourceModalOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Synchronize Dark Mode on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedPro = localStorage.getItem('thetawave_pro');
    if (savedPro === 'true') {
      setIsPro(true);
    }

    const savedLang = localStorage.getItem('thetawave_language');
    if (savedLang === 'Bahasa Melayu') {
      setLectures(sampleLecturesMalay);
    }
  }, []);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === 'Bahasa Melayu') {
      setLectures(prev => {
        const userAdded = prev.filter(l => 
          !sampleLectures.some(s => s.id === l.id) && 
          !sampleLecturesMalay.some(s => s.id === l.id)
        );
        return [...sampleLecturesMalay, ...userAdded];
      });
    } else {
      setLectures(prev => {
        const userAdded = prev.filter(l => 
          !sampleLectures.some(s => s.id === l.id) && 
          !sampleLecturesMalay.some(s => s.id === l.id)
        );
        return [...sampleLectures, ...userAdded];
      });
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  const handleUpgradeSuccess = () => {
    setIsPro(true);
    localStorage.setItem('thetawave_pro', 'true');
  };

  const currentLecture = lectures[currentLectureIndex] || sampleLectures[0];

  const handleOpenNote = (note: LectureData) => {
    const idx = lectures.findIndex(l => l.id === note.id);
    if (idx !== -1) {
      setCurrentLectureIndex(idx);
    }
    setCurrentView('workspace');
    setActiveTab('notes');
  };

  const handleLectureCreated = (newLecture: LectureData) => {
    setLectures((prev) => [newLecture, ...prev]);
    setCurrentLectureIndex(0);
    setCurrentView('workspace');
    setActiveTab('notes');
  };

  const handleDeleteNote = (id: string) => {
    setLectures((prev) => {
      const filtered = prev.filter(l => l.id !== id);
      return filtered.length > 0 ? filtered : sampleLectures;
    });
  };

  const handleNewEmptyNote = (targetFolder?: string) => {
    const emptyLecture: LectureData = {
      id: `manual-${Date.now()}`,
      title: 'New Study Note',
      subject: 'Self Study',
      folder: targetFolder || 'Semester 1 Core',
      date: new Date().toISOString().split('T')[0],
      summary: 'Newly created personal study note.',
      markdownNotes: `# New Study Note\n\n## 1. Core Principles\nWrite your thoughts, formulas, and concepts here.\n\n$$E = mc^2$$\n`,
      mindmapMarkdown: `# New Study Note\n## 1. Principles\n## 2. Applications\n`,
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          front: 'Sample Question',
          back: 'Sample Answer',
          tag: 'Concept'
        }
      ],
      quiz: [
        {
          id: `qz-${Date.now()}-1`,
          question: 'Sample review question?',
          options: ['Option A', 'Option B', 'Option C'],
          correctIndex: 0,
          explanation: 'Option A is the correct answer.'
        }
      ]
    };

    setLectures((prev) => [emptyLecture, ...prev]);
    setCurrentLectureIndex(0);
    setCurrentView('workspace');
    setActiveTab('notes');
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFld: StudyFolder = {
      id: `fld-${Date.now()}`,
      name,
      color,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFolders(prev => [...prev, newFld]);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  };

  const handleNavigateFolders = (folderNameOrId?: string | null) => {
    setSelectedFolderId(folderNameOrId || null);
    setCurrentView('folders');
  };

  const handleSwitchSample = () => {
    setCurrentLectureIndex((prev) => (prev + 1) % lectures.length);
  };

  const uniqueSubjects = Array.from(new Set(lectures.map(l => l.subject)));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-200">
      
      {/* 1. Left Navigation Sidebar (Persistent across all views) */}
      <Sidebar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
        onNavigateAllNotes={(filter) => {
          setNotesFilter(filter || 'All');
          setCurrentView('all-notes');
        }}
        onNavigateLearn={() => setCurrentView('learn')}
        onNavigateChat={() => setCurrentView('chat')}
        onNavigateSources={() => setCurrentView('sources')}
        onNavigateFocus={() => setCurrentView('focus')}
        onNavigateFolders={handleNavigateFolders}
        notesCount={lectures.length}
        subjects={uniqueSubjects}
        folders={folders}
        notes={lectures}
        isPro={isPro}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 pb-16 md:pb-0">
        
        {/* VIEW 1: Home Dashboard (Matching media_1790828094632.png) */}
        {currentView === 'home' && (
          <HomeDashboard
            onOpenUpload={() => setIsUploadSourceModalOpen(true)}
            onOpenNote={handleOpenNote}
            recentNotes={lectures}
            onNewEmptyNote={() => handleNewEmptyNote()}
            onNavigateFocus={() => setCurrentView('focus')}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {/* VIEW 2: All Notes Library View */}
        {currentView === 'all-notes' && (
          <AllNotesView
            notes={lectures}
            onOpenNote={handleOpenNote}
            onNewNote={() => handleNewEmptyNote()}
            onDeleteNote={handleDeleteNote}
            activeFilter={notesFilter}
          />
        )}

        {/* VIEW 3: Study Folders View */}
        {currentView === 'folders' && (
          <FoldersView
            folders={folders}
            notes={lectures}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onOpenNote={handleOpenNote}
            onNewNoteInFolder={(fldName) => handleNewEmptyNote(fldName)}
          />
        )}

        {/* VIEW 4: Learn Hub (Flashcards, Quizzes, Spaced Repetition) */}
        {currentView === 'learn' && (
          <LearnHubView notes={lectures} />
        )}

        {/* VIEW 5: Full Chat Copilot (Multi-lecture synthesis) */}
        {currentView === 'chat' && (
          <FullChatView notes={lectures} />
        )}

        {/* VIEW 6: Ingested Sources & Media Management */}
        {currentView === 'sources' && (
          <SourcesView
            notes={lectures}
            onOpenUpload={() => setIsUploadSourceModalOpen(true)}
            onOpenNote={handleOpenNote}
          />
        )}

        {/* VIEW 7: Standalone Focus Room */}
        {currentView === 'focus' && (
          <div className="flex-1 overflow-y-auto">
            <GoFocusView onBackToDashboard={() => setCurrentView('home')} />
          </div>
        )}

        {/* VIEW 8: Note Workspace (Notes, Mindmap, Flashcards, Quiz, Focus) */}
        {currentView === 'workspace' && (
          <>
            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentLecture={currentLecture}
              onOpenRecorder={() => setIsRecorderOpen(true)}
              onOpenFileUpload={() => setIsUploadSourceModalOpen(true)}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              isChatOpen={isChatOpen}
              onBackToDashboard={() => setCurrentView('home')}
              onSwitchSample={handleSwitchSample}
              isDarkMode={isDarkMode}
              onToggleTheme={handleToggleTheme}
            />

            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {activeTab === 'notes' && (
                <NotesView lecture={currentLecture} />
              )}

              {activeTab === 'mindmap' && (
                <MindmapView 
                  markdown={currentLecture.mindmapMarkdown} 
                  title={currentLecture.title} 
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardsView cards={currentLecture.flashcards} />
              )}

              {activeTab === 'quiz' && (
                <QuizView 
                  questions={currentLecture.quiz} 
                  lectureTitle={currentLecture.title} 
                />
              )}

              {activeTab === 'focus' && (
                <GoFocusView onBackToDashboard={() => setCurrentView('home')} />
              )}
            </main>
          </>
        )}

      </div>

      {/* 3. Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200/90 bg-white/95 backdrop-blur-md px-2 dark:border-zinc-800 dark:bg-zinc-950/95 shadow-lg select-none">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            currentView === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
          }`}
        >
          <HomeIcon className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setNotesFilter('All');
            setCurrentView('all-notes');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            currentView === 'all-notes'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Notes</span>
        </button>

        <button
          onClick={() => setCurrentView('focus')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            currentView === 'focus'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span>Go Focus</span>
        </button>

        <button
          onClick={() => setCurrentView('folders')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
            currentView === 'folders'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>Folders</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Upload Source Modal (Dropzone, Youtube/Web/Text, Language selector) */}
      <UploadSourceModal
        isOpen={isUploadSourceModalOpen}
        onClose={() => setIsUploadSourceModalOpen(false)}
        onLectureCreated={handleLectureCreated}
      />

      {/* Live Audio Recorder Modal */}
      <AudioRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onLectureCreated={handleLectureCreated}
      />

      {/* Study Buddy AI Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        lecture={currentLecture}
      />

      {/* Upgrade Pro Modal with Checkout Simulation & Confetti */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        isPro={isPro}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      {/* Workspace Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLanguageChange={handleLanguageChange}
      />

    </div>
  );
}
