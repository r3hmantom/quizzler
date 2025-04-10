// Configuration file for quizzes and subjects

export interface SubjectConfig {
  name: string;
  path: string;
  color: string;
  description?: string;
}

// Define all subjects and their properties here
export const subjects: SubjectConfig[] = [
  {
    name: "Leadership",
    path: "leadership",
    color: "#64c2a6", // Teal
    description: "Explore leadership quizzes"
  },
  // Add more subjects here as needed
  // Example:
  // {
  //   name: "Mathematics",
  //   path: "mathematics",
  //   color: "#ffde59", // Yellow
  //   description: "Explore mathematics quizzes"
  // },
]; 