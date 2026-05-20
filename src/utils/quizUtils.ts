import { QuizQuestion, QuizState, QuizSessionMeta } from '../types';
import { getUserQuiz, getUserSubjects } from './userLibraryStorage';
import { subjects } from '../data/config';
import { guessQuizMetaFromQuestions } from './quizDataUtils';

const STORAGE_KEY = 'quizzler-state';
const SESSION_INFO_KEY = 'quizzler-session-info';
const LAST_QUIZ_KEY = 'quizzler-last-quiz';

// Save quiz state to local storage
export const saveQuizState = (state: QuizState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Load quiz state from local storage
export const loadQuizState = (): QuizState | null => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (savedState) {
    try {
      return JSON.parse(savedState) as QuizState;
    } catch (e) {
      console.error('Failed to parse saved quiz state', e);
      return null;
    }
  }
  return null;
};

// Clear saved quiz state
export const clearQuizState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

function resolveQuizTitle(path?: string, savedTitle?: string): string | undefined {
  if (savedTitle) return savedTitle;
  if (!path) return undefined;
  if (path.startsWith('user-quiz-')) {
    const id = path.replace('user-quiz-', '');
    if (id === 'pending') return undefined;
    return getUserQuiz(id)?.title;
  }
  const segment = path.split('/').pop() ?? path;
  return segment.replace(/_/g, ' ').replace(/\.json$/i, '');
}

function resolveSubjectName(path?: string, savedName?: string): string | undefined {
  if (savedName) return savedName;
  if (!path) return undefined;
  if (path.startsWith('user-quiz-')) {
    const id = path.replace('user-quiz-', '');
    if (id === 'pending') return undefined;
    const quiz = getUserQuiz(id);
    if (!quiz) return undefined;
    return getUserSubjects().find((s) => s.id === quiz.subjectId)?.name;
  }
  const subjectPath = path.split('/')[0];
  return subjects.find((s) => s.path === subjectPath)?.name;
}

export const saveLastSelectedQuiz = (meta: QuizSessionMeta): void => {
  sessionStorage.setItem(LAST_QUIZ_KEY, JSON.stringify(meta));
};

export const loadLastSelectedQuiz = (): QuizSessionMeta | null => {
  const raw = sessionStorage.getItem(LAST_QUIZ_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizSessionMeta;
  } catch {
    return null;
  }
};

export const clearLastSelectedQuiz = (): void => {
  sessionStorage.removeItem(LAST_QUIZ_KEY);
};

export const saveSessionInfo = (meta: QuizSessionMeta): void => {
  localStorage.setItem(SESSION_INFO_KEY, JSON.stringify(meta));
};

export const loadSessionInfo = (): QuizSessionMeta | null => {
  const raw = localStorage.getItem(SESSION_INFO_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuizSessionMeta;
    if (parsed.subjectName || parsed.quizTitle || parsed.quizPath) return parsed;
    return null;
  } catch {
    return null;
  }
};

export const clearSessionInfo = (): void => {
  localStorage.removeItem(SESSION_INFO_KEY);
};

export function getPausedSessionDisplay(): {
  subjectName?: string;
  quizTitle?: string;
  progress: string;
} | null {
  const saved = loadQuizState();
  if (!saved?.hasStarted || saved.isComplete) return null;

  const info = loadSessionInfo();
  const lastQuiz = loadLastSelectedQuiz();
  const quizPath = saved.quizPath ?? info?.quizPath ?? lastQuiz?.quizPath;
  const subjectName = resolveSubjectName(
    quizPath,
    saved.subjectName ?? info?.subjectName ?? lastQuiz?.subjectName
  );
  let quizTitle = resolveQuizTitle(
    quizPath,
    saved.quizTitle ?? info?.quizTitle ?? lastQuiz?.quizTitle
  );

  let resolvedSubject = subjectName;
  if (!resolvedSubject || !quizTitle) {
    const guessed = guessQuizMetaFromQuestions(saved.questions);
    if (guessed) {
      resolvedSubject = resolvedSubject ?? guessed.subjectName;
      quizTitle = quizTitle ?? guessed.quizTitle;
      saveSessionInfo(guessed);
      saveLastSelectedQuiz(guessed);
      saveQuizState({
        ...saved,
        subjectName: guessed.subjectName,
        quizTitle: guessed.quizTitle,
        quizPath: guessed.quizPath,
      });
    }
  }

  return {
    subjectName: resolvedSubject,
    quizTitle,
    progress: `Question ${Math.min(saved.currentQuestionIndex + 1, saved.questions.length)} of ${saved.questions.length} · Score ${saved.score}/${saved.totalQuestions}`,
  };
}

// Shuffle an array using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Validate quiz questions JSON
export const validateQuizQuestions = (questions: unknown): QuizQuestion[] | null => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return null;
  }

  for (const question of questions) {
    if (
      typeof question !== 'object' || 
      question === null || 
      typeof question.question !== 'string' ||
      typeof question.a !== 'string' ||
      typeof question.b !== 'string' ||
      typeof question.c !== 'string' ||
      typeof question.d !== 'string' ||
      !['a', 'b', 'c', 'd'].includes(question.correctAnswer)
    ) {
      return null;
    }
  }

  return questions as QuizQuestion[];
}; 