import { QuizQuestion } from "../types";
import { subjects, SubjectConfig } from "../data/config";

export interface SubjectInfo {
  name: string;
  path: string;
  color: string;
  description?: string;
}

export interface QuizInfo {
  title: string;
  path: string;
  fileName: string;
  subject: string;
}

// Get all available subjects from the configuration
export async function getSubjects(): Promise<SubjectInfo[]> {
  try {
    return subjects;
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
export async function getQuizzesBySubject(subject: string): Promise<QuizInfo[]> {
  try {
    // Format subject name for path if needed
    const subjectInfo = getSubjectByName(subject);
    if (!subjectInfo) {
      throw new Error(`Subject "${subject}" not found`);
    }
    
    const formattedSubject = subjectInfo.path.toLowerCase();
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
          subject: subjectInfo.name
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

// Get color for a subject
export function getSubjectColor(subjectName: string): string {
  const subject = getSubjectByName(subjectName);
  return subject?.color || "white";
}
