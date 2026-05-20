import { QuizQuestion } from "../types";
import { subjects, SubjectConfig } from "../data/config";
import {
  getUserSubjects,
  getUserQuizzesBySubject,
  getUserQuiz,
  getAllUserQuizzes,
  userSubjectToInfo,
} from "./userLibraryStorage";
import { QuizSessionMeta } from "../types";

export interface SubjectInfo {
  name: string;
  path: string;
  color: string;
  description?: string;
  isUserCreated?: boolean;
  id?: string;
}

export interface QuizInfo {
  title: string;
  path: string;
  fileName: string;
  subject: string;
  isUserCreated?: boolean;
  userQuizId?: string;
}

// Get all available subjects (built-in + user-created from local storage)
export async function getSubjects(): Promise<SubjectInfo[]> {
  try {
    const builtIn: SubjectInfo[] = subjects.map((s) => ({
      name: s.name,
      path: s.path,
      color: s.color,
      description: s.description,
      isUserCreated: false,
    }));
    const userSubjects = getUserSubjects().map(userSubjectToInfo);
    return [...builtIn, ...userSubjects];
  } catch (error) {
    console.error("Error getting subjects:", error);
    return [];
  }
}

// Get subject by name
export function getSubjectByName(name: string): SubjectConfig | undefined {
  return subjects.find(subject => subject.name === name);
}

// Get all quizzes for a specific subject
export async function getQuizzesBySubject(
  subject: string,
  subjectInfoOverride?: SubjectInfo
): Promise<QuizInfo[]> {
  try {
    const allSubjects = await getSubjects();
    const subjectInfo =
      subjectInfoOverride ??
      allSubjects.find((s) => s.name === subject);

    if (!subjectInfo) {
      throw new Error(`Subject "${subject}" not found`);
    }

    if (subjectInfo.isUserCreated && subjectInfo.id) {
      return getUserQuizzesBySubject(subjectInfo.id).map((quiz) => ({
        title: quiz.title,
        path: `user-quiz-${quiz.id}`,
        fileName: `${quiz.id}.json`,
        subject: subjectInfo.name,
        isUserCreated: true,
        userQuizId: quiz.id,
      }));
    }

    const configSubject = getSubjectByName(subject);
    if (!configSubject) {
      return [];
    }

    const formattedSubject = configSubject.path.toLowerCase();
    const quizzes: QuizInfo[] = [];
    
    // Dynamically import all files from the subject directory
    const context = import.meta.glob("../data/**/*.json", { eager: true });
    
    // Debug which files were found
    console.log("Found files:", Object.keys(context));
    
    // Filter files that match the subject path
    for (const fullPath of Object.keys(context)) {
      // Make sure this is a file in the correct subject directory
      if (fullPath.includes(`/${formattedSubject}/`)) {
        // Extract filename from the path
        const pathParts = fullPath.split("/");
        const fileName = pathParts[pathParts.length - 1];
        const title = formatTitle(fileName);
        
        // The path we want is the part after ../data/ but without the .json extension
        const relativePath = fullPath
          .substring(fullPath.indexOf("../data/") + "../data/".length)
          .replace(/\.json$/, "");
        
        console.log(`Adding quiz: "${title}" with path: "${relativePath}" from full path: "${fullPath}"`);
        
        quizzes.push({
          title,
          path: relativePath,
          fileName,
          subject: configSubject.name,
        });
      }
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
    if (path.startsWith("user-quiz-")) {
      const quizId = path.replace("user-quiz-", "");
      const quiz = getUserQuiz(quizId);
      return quiz?.questions ?? [];
    }

    console.log(`Attempting to load quiz from path: ${path}`);
    
    // Use dynamic import with the full path
    const modules = import.meta.glob("../data/**/*.json", { eager: true });
    
    // Construct multiple possible paths to try
    const possiblePaths = [
      `../data/${path}.json`,         // Direct path
      `../data/leadership/${path}.json`,  // Try with leadership prefix
      Object.keys(modules).find(key => key.endsWith(`/${path}.json`)) // Find by filename
    ].filter(Boolean); // Remove any undefined entries
    
    console.log("Trying paths:", possiblePaths);
    
    // Try each path
    let module: any = null;
    let usedPath: string | null = null;
    
    for (const tryPath of possiblePaths) {
      if (tryPath && tryPath in modules) {
        module = modules[tryPath];
        usedPath = tryPath;
        break;
      }
    }
    
    if (!module) {
      console.error(`No module found for quiz: ${path}`);
      console.error("Available modules:", Object.keys(modules));
      return [];
    }
    
    console.log(`Found module at: ${usedPath}`);
    
    // Handle both default exports and direct exports
    const questions = module.default || module as unknown as QuizQuestion[];
    
    console.log(`Loaded data type:`, typeof questions, Array.isArray(questions), 
                `Length: ${Array.isArray(questions) ? questions.length : 'not an array'}`);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error(`No valid questions array found in ${path}. Data:`, questions);
      return [];
    }
    
    return questions as QuizQuestion[];
  } catch (error) {
    console.error(`Error loading quiz from ${path}:`, error);
    console.trace();
    return [];
  }
}

// Format title from filename (replace underscores with spaces)
export function formatTitle(fileName: string): string {
  // Remove .json extension and replace underscores with spaces
  return fileName.replace(".json", "").replace(/_/g, " ");
}

/** Match paused questions to a known quiz (built-in or user library). */
export function guessQuizMetaFromQuestions(
  questions: QuizQuestion[]
): QuizSessionMeta | null {
  if (!questions.length) return null;

  const modules = import.meta.glob("../data/**/*.json", { eager: true });

  for (const fullPath of Object.keys(modules)) {
    const module = modules[fullPath] as { default?: QuizQuestion[] };
    const qs = (module.default || module) as QuizQuestion[];
    if (!Array.isArray(qs) || qs.length !== questions.length) continue;
    if (qs[0]?.question !== questions[0]?.question) continue;

    const relativePath = fullPath
      .substring(fullPath.indexOf("../data/") + "../data/".length)
      .replace(/\.json$/, "");
    const subjectPath = relativePath.split("/")[0];
    const subject = subjects.find((s) => s.path === subjectPath);
    const fileSegment = relativePath.split("/").pop() ?? "";
    const title = fileSegment.replace(/_/g, " ");

    return {
      subjectName: subject?.name ?? subjectPath,
      quizTitle: title,
      quizPath: relativePath,
    };
  }

  for (const quiz of getAllUserQuizzes()) {
    if (quiz.questions.length !== questions.length) continue;
    if (quiz.questions[0]?.question !== questions[0]?.question) continue;
    const subject = getUserSubjects().find((s) => s.id === quiz.subjectId);
    return {
      subjectName: subject?.name ?? "My subject",
      quizTitle: quiz.title,
      quizPath: `user-quiz-${quiz.id}`,
    };
  }

  return null;
}

// Get color for a subject
export function getSubjectColor(subjectName: string): string {
  const configSubject = getSubjectByName(subjectName);
  if (configSubject) return configSubject.color;
  const userSubject = getUserSubjects().find((s) => s.name === subjectName);
  return userSubject?.color || "white";
}
