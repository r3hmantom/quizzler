import { QuizQuestion } from '../types';

export interface SubjectInfo {
  name: string;
  path: string;
}

export interface QuizInfo {
  title: string;
  path: string;
  fileName: string;
  subject: string;
}

// Get all available subjects from the quizzesData directory
export async function getSubjects(): Promise<SubjectInfo[]> {
  try {
    const response = await fetch('/quizzesData/');
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    
    // We're simulating a directory listing here
    // In a real app with a server, you'd get this from an API endpoint
    return [
      { name: 'Mathematics', path: '/quizzesData/Mathematics/' },
      { name: 'Science', path: '/quizzesData/Science/' },
      { name: 'History', path: '/quizzesData/History/' }
    ];
  } catch (error) {
    console.error('Error getting subjects:', error);
    return [];
  }
}

// Get all quizzes for a specific subject
export async function getQuizzesBySubject(subject: string): Promise<QuizInfo[]> {
  try {
    // Format subject name for path
    const formattedSubject = subject.replace(/\s+/g, '_');
    
    const quizzes: QuizInfo[] = [];
    
    // Hardcoded quiz info for each subject
    // In a real app, this would be fetched from the server
    if (formattedSubject === 'Mathematics') {
      quizzes.push(
        { 
          title: 'Algebra Basics', 
          path: `/quizzesData/Mathematics/Algebra_Basics.json`,
          fileName: 'Algebra_Basics.json',
          subject: 'Mathematics'
        },
        { 
          title: 'Geometry Fundamentals', 
          path: `/quizzesData/Mathematics/Geometry_Fundamentals.json`,
          fileName: 'Geometry_Fundamentals.json',
          subject: 'Mathematics'
        }
      );
    } else if (formattedSubject === 'Science') {
      quizzes.push(
        { 
          title: 'Biology: Cells', 
          path: `/quizzesData/Science/Biology_Cells.json`,
          fileName: 'Biology_Cells.json',
          subject: 'Science'
        },
        { 
          title: 'Chemistry: Elements', 
          path: `/quizzesData/Science/Chemistry_Elements.json`,
          fileName: 'Chemistry_Elements.json',
          subject: 'Science'
        }
      );
    } else if (formattedSubject === 'History') {
      quizzes.push(
        { 
          title: 'Ancient Civilizations', 
          path: `/quizzesData/History/Ancient_Civilizations.json`,
          fileName: 'Ancient_Civilizations.json',
          subject: 'History'
        },
        { 
          title: 'World Wars', 
          path: `/quizzesData/History/World_Wars.json`,
          fileName: 'World_Wars.json',
          subject: 'History'
        }
      );
    }
    
    return quizzes;
  } catch (error) {
    console.error(`Error getting quizzes for subject ${subject}:`, error);
    return [];
  }
}

// Load quiz questions from a specific path
export async function loadQuizQuestions(path: string): Promise<QuizQuestion[]> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz at ${path}`);
    }
    
    const questions: QuizQuestion[] = await response.json();
    return questions;
  } catch (error) {
    console.error(`Error loading quiz from ${path}:`, error);
    return [];
  }
}

// Format title from filename (replace underscores with spaces)
export function formatTitle(fileName: string): string {
  // Remove .json extension and replace underscores with spaces
  return fileName.replace('.json', '').replace(/_/g, ' ');
} 