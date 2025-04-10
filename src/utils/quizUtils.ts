import { QuizQuestion, QuizState } from '../types';

const STORAGE_KEY = 'quizzler-state';

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