export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag?: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LectureData {
  id: string;
  title: string;
  subject: string;
  folder?: string;
  duration?: string;
  date: string;
  summary: string;
  markdownNotes: string;
  mindmapMarkdown: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: string[];
}

export interface StudyFolder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
}
