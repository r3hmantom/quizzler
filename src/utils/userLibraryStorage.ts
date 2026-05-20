import { QuizQuestion } from '../types';

export interface UserSubject {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: number;
}

export interface UserQuiz {
  id: string;
  subjectId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
  updatedAt: number;
}

const SUBJECTS_KEY = 'quizzler-user-subjects';
const QUIZZES_KEY = 'quizzler-user-quizzes';
const LEGACY_QUIZZES_KEY = 'quizzler-saved-quizzes';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readSubjects(): UserSubject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubjects(subjects: UserSubject[]): void {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
}

function readQuizzes(): UserQuiz[] {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQuizzes(quizzes: UserQuiz[]): void {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}

export function migrateLegacyQuizzes(): void {
  const legacy = localStorage.getItem(LEGACY_QUIZZES_KEY);
  if (!legacy) return;

  try {
    const parsed = JSON.parse(legacy) as { name: string; questions: QuizQuestion[] }[];
    if (!Array.isArray(parsed) || parsed.length === 0) return;

    const subjects = readSubjects();
    let defaultSubject = subjects.find((s) => s.name === 'My Quizzes');

    if (!defaultSubject) {
      defaultSubject = {
        id: generateId(),
        name: 'My Quizzes',
        color: '#ffde59',
        description: 'Migrated saved quizzes',
        createdAt: Date.now(),
      };
      subjects.push(defaultSubject);
      writeSubjects(subjects);
    }

    const quizzes = readQuizzes();
    for (const item of parsed) {
      if (!item.name || !Array.isArray(item.questions)) continue;
      quizzes.push({
        id: generateId(),
        subjectId: defaultSubject.id,
        title: item.name,
        questions: item.questions,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    writeQuizzes(quizzes);
    localStorage.removeItem(LEGACY_QUIZZES_KEY);
  } catch {
    // ignore migration errors
  }
}

export function getUserSubjects(): UserSubject[] {
  return readSubjects();
}

export function createUserSubject(
  name: string,
  color: string,
  description?: string
): UserSubject {
  const subjects = readSubjects();
  const subject: UserSubject = {
    id: generateId(),
    name: name.trim(),
    color,
    description: description?.trim(),
    createdAt: Date.now(),
  };
  subjects.push(subject);
  writeSubjects(subjects);
  return subject;
}

export function updateUserSubject(
  id: string,
  updates: Partial<Pick<UserSubject, 'name' | 'color' | 'description'>>
): UserSubject | null {
  const subjects = readSubjects();
  const index = subjects.findIndex((s) => s.id === id);
  if (index < 0) return null;

  subjects[index] = {
    ...subjects[index],
    ...updates,
    name: updates.name?.trim() ?? subjects[index].name,
    description: updates.description?.trim() ?? subjects[index].description,
  };
  writeSubjects(subjects);
  return subjects[index];
}

export function deleteUserSubject(id: string): void {
  writeSubjects(readSubjects().filter((s) => s.id !== id));
  writeQuizzes(readQuizzes().filter((q) => q.subjectId !== id));
}

export function getUserQuizzesBySubject(subjectId: string): UserQuiz[] {
  return readQuizzes().filter((q) => q.subjectId === subjectId);
}

export function getAllUserQuizzes(): UserQuiz[] {
  return readQuizzes();
}

export function getUserQuiz(id: string): UserQuiz | undefined {
  return readQuizzes().find((q) => q.id === id);
}

export function createUserQuiz(
  subjectId: string,
  title: string,
  questions: QuizQuestion[]
): UserQuiz {
  const quizzes = readQuizzes();
  const quiz: UserQuiz = {
    id: generateId(),
    subjectId,
    title: title.trim(),
    questions,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  quizzes.push(quiz);
  writeQuizzes(quizzes);
  return quiz;
}

export function updateUserQuiz(
  id: string,
  updates: Partial<Pick<UserQuiz, 'title' | 'questions' | 'subjectId'>>
): UserQuiz | null {
  const quizzes = readQuizzes();
  const index = quizzes.findIndex((q) => q.id === id);
  if (index < 0) return null;

  quizzes[index] = {
    ...quizzes[index],
    ...updates,
    title: updates.title?.trim() ?? quizzes[index].title,
    updatedAt: Date.now(),
  };
  writeQuizzes(quizzes);
  return quizzes[index];
}

export function deleteUserQuiz(id: string): void {
  writeQuizzes(readQuizzes().filter((q) => q.id !== id));
}

export function exportQuizQuestionsJson(questions: QuizQuestion[]): string {
  return JSON.stringify(questions, null, 2);
}

export function downloadQuizJson(title: string, questions: QuizQuestion[]): void {
  const blob = new Blob([exportQuizQuestionsJson(questions)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${title.replace(/[^a-z0-9-_]/gi, '_') || 'quiz'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function userSubjectToInfo(subject: UserSubject) {
  return {
    name: subject.name,
    path: `user-${subject.id}`,
    color: subject.color,
    description: subject.description,
    isUserCreated: true as const,
    id: subject.id,
  };
}
