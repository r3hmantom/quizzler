import { QuizQuestion } from "../types";
// Import slides data directly
import slides1 from "../data/slides_1.json";
import slides2 from "../data/slides_2.json";
import slides3 from "../data/slides_3.json";
import slides4 from "../data/slides_4.json";

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

// Get all available subjects from the data directory
export async function getSubjects(): Promise<SubjectInfo[]> {
  try {
    // We're providing static subject data
    return [{ name: "Leadership", path: "leadership" }];
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

    // Hardcoded quiz info based on imported data files
    if (formattedSubject === "Leadership") {
      quizzes.push(
        {
          title: "Contingency Models 1",
          path: "slides_1",
          fileName: "slides_1.json",
          subject: "Leadership",
        },
        {
          title: "Contingency Models 2",
          path: "slides_2",
          fileName: "slides_2.json",
          subject: "Leadership",
        },
        {
          title: "Leadership as an Individual Fundamentals",
          path: "slides_3",
          fileName: "slides_3.json",
          subject: "Leadership",
        },
        {
          title: "Powers in Leadership",
          path: "slides_4",
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

// Load quiz questions based on the path identifier
export async function loadQuizQuestions(path: string): Promise<QuizQuestion[]> {
  try {
    // Map the path to the appropriate imported JSON data
    let questions: QuizQuestion[] = [];
    
    switch (path) {
      case "slides_1":
        questions = slides1 as QuizQuestion[];
        break;
      case "slides_2":
        questions = slides2 as QuizQuestion[];
        break;
      case "slides_3":
        questions = slides3 as QuizQuestion[];
        break;
      case "slides_4":
        questions = slides4 as QuizQuestion[];
        break;
      default:
        throw new Error(`No quiz data found for path: ${path}`);
    }
    
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
