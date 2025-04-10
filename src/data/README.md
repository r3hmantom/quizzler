# Quizzler - Adding New Quizzes

This document explains how to add new quizzes to the Quizzler application.

## Adding a New Quiz

Adding a new quiz is now simplified to these easy steps:

1. **Prepare your quiz JSON file** with this structure:
   ```json
   [
     {
       "question": "Your question text",
       "a": "Option A",
       "b": "Option B",
       "c": "Option C",
       "d": "Option D",
       "correctAnswer": "a"
     },
     {
       "question": "Another question",
       "a": "Option A",
       "b": "Option B",
       "c": "Option C",
       "d": "Option D",
       "correctAnswer": "c"
     }
   ]
   ```

2. **Add the quiz file to the appropriate subject folder**:
   - Place the file in `src/data/[subject-path]/your_quiz_name.json`
   - Example: `src/data/leadership/team_leadership.json`

3. **The file will be automatically loaded** - no code changes needed!

## Adding a New Subject

To add a new subject:

1. **Edit the configuration file** at `src/data/config.ts`
2. **Add your subject to the subjects array**:
   ```typescript
   {
     name: "Your Subject Name",
     path: "your_subject_path",
     color: "#hexcolor", // Choose a color
     description: "Optional description text"
   }
   ```
3. **Create the subject directory**:
   ```
   mkdir -p src/data/your_subject_path
   ```
4. **Add quiz files** to your new subject directory

## Filename Conventions

- Use snake_case for filenames: `your_quiz_name.json`
- The filename will be converted to title case for display (e.g., "Your Quiz Name")

## Technical Notes

- Quiz files are loaded directly from the source directory using Vite's import.meta.glob
- No need to copy files to the public directory
- All quizzes in a subject folder are automatically discovered and added to the UI

That's it! The system will automatically load your quizzes and display them in the UI. 