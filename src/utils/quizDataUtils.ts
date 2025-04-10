import { QuizQuestion } from "../types";

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
    const response = await fetch("/quizzesData/");
    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }

    // We're simulating a directory listing here
    // In a real app with a server, you'd get this from an API endpoint
    return [{ name: "Leadership", path: "/quizzesData/Leadership/" }];
  } catch (error) {
    console.error("Error getting subjects:", error);
    return [];
  }
}

// Get all quizzes for a specific subject
export async function getQuizzesBySubject(
  subject: string
): Promise<QuizInfo[]> {
  try {
    // Format subject name for path
    const formattedSubject = subject.replace(/\s+/g, "_");

    const quizzes: QuizInfo[] = [];

    // Hardcoded quiz info for each subject
    // In a real app, this would be fetched from the server
    if (formattedSubject === "Leadership") {
      quizzes.push(
        {
          title: "Contingency Models 1",
          path: `/quizzesData/Leadership/slides_1.json`,
          fileName: "slides_1.json",
          subject: "Leadership",
        },
        {
          title: "Contingency Models 2",
          path: `/quizzesData/Leadership/slides_2.json`,
          fileName: "slides_2.json",
          subject: "Leadership",
        },
        {
          title: "Leadership as an Individual Fundamentals",
          path: `/quizzesData/Leadership/slides_3.json`,
          fileName: "slides_3.json",
          subject: "Leadership",
        },
        {
          title: "Powers in Leadership",
          path: `/quizzesData/Leadership/slides_4.json`,
          fileName: "slides_4.json",
          subject: "Leadership",
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
export async function   loadQuizQuestions(path: string): Promise<QuizQuestion[]> {
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
  return fileName.replace(".json", "").replace(/_/g, " ");
}
