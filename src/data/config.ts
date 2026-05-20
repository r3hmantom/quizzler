// Configuration file for quizzes and subjects

export interface SubjectConfig {
  name: string;
  path: string;
  color: string;
  description?: string;
}

// Optional overrides for folders under src/data (subjects are auto-discovered from JSON files).
// Match "path" to the folder name, e.g. src/data/leadership → path: "leadership"
export const subjects: SubjectConfig[] = [
  {
    name: "Leadership",
    path: "leadership",
    color: "#64c2a6",
    description: "Explore leadership quizzes",
  },
  // Example override for src/data/ppit:
  // {
  //   name: "PPIT",
  //   path: "ppit",
  //   color: "#ffde59",
  //   description: "Explore PPIT quizzes",
  // },
]; 