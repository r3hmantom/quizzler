export interface QuizQuestion {
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

export interface QuizSessionMeta {
  subjectName: string;
  quizTitle: string;
  quizPath?: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  incorrectQuestions: QuizQuestion[];
  problematicQuestions: { question: QuizQuestion; incorrectCount: number }[];
  score: number;
  totalQuestions: number;
  isComplete: boolean;
  hasStarted: boolean;
  subjectName?: string;
  quizTitle?: string;
  quizPath?: string;
}

export type AnswerOption = 'a' | 'b' | 'c' | 'd'; 