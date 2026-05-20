import { useState } from 'react';
import { QuizQuestion } from '../types';
import { validateQuizQuestions } from '../utils/quizUtils';
import { motion, AnimatePresence } from 'framer-motion';
import PromptHelper from './PromptHelper';

interface JsonInputProps {
  onStart: (questions: QuizQuestion[]) => void;
  savedQuizzes: { name: string, questions: QuizQuestion[] }[];
  onLoadSavedQuiz: (index: number) => void;
  onDeleteSavedQuiz: (index: number) => void;
  showSavedQuizzes: boolean;
  setShowSavedQuizzes: (show: boolean) => void;
}

export default function JsonInput({ 
  onStart, 
  savedQuizzes, 
  onLoadSavedQuiz, 
  onDeleteSavedQuiz,
  showSavedQuizzes,
  setShowSavedQuizzes
}: JsonInputProps) {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showPromptHelper, setShowPromptHelper] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setError(null);
  };

  const handleSubmit = () => {
    try {
      // Parse JSON
      const parsedJson = JSON.parse(jsonInput);
      
      // Validate format
      const validatedQuestions = validateQuizQuestions(parsedJson);
      
      if (!validatedQuestions) {
        setError('Invalid quiz format. Please ensure your JSON follows the required structure.');
        return;
      }
      
      if (validatedQuestions.length === 0) {
        setError('No questions found. Please add at least one question.');
        return;
      }
      
      // Start the quiz
      onStart(validatedQuestions);
      
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const copyQuizPrompt = () => {
    const quizGeneratorPrompt = `Analyze the provided content and create a comprehensive concept-based multiple-choice quiz in valid JSON format.

IMPORTANT:
- Do NOT focus on memorizing names, dates, locations, people, organizations, or case-study-specific details unless they are essential to understanding the concept.
- Extract the GENERAL concepts, principles, theories, relationships, methods, and applications from the content.
- Treat examples, stories, and case studies only as tools for teaching broader concepts.

The quiz should test:
- conceptual understanding
- application of ideas
- reasoning and analysis
- cause/effect relationships
- comparisons and differences
- problem-solving ability
- practical understanding
- theoretical understanding

Avoid:
- rote memorization questions
- trivial details
- direct copy-paste lines from the material
- overly obvious options
- ambiguous wording
- trick questions

Requirements:
- Cover ALL important concepts from the content
- Generate as many MCQs as needed for full conceptual coverage
- Each question must have exactly ONE clearly correct answer
- Incorrect options should be plausible but clearly incorrect
- Questions should resemble university or competitive exam conceptual MCQs
- Include a balanced mix of easy, medium, and difficult questions

Return ONLY valid JSON in this exact format:

[
  {
    "question": "Question text",
    "a": "Option A",
    "b": "Option B",
    "c": "Option C",
    "d": "Option D",
    "correctAnswer": "a"
  }
]`;

    navigator.clipboard.writeText(quizGeneratorPrompt)
      .then(() => {
        setShowCopySuccess(true);
        setShowPromptHelper(true);
        setTimeout(() => setShowCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Sample JSON to show in placeholder
  const sampleJson = [
    {
      question: "What is the capital of France?",
      a: "London",
      b: "Berlin",
      c: "Paris",
      d: "Madrid",
      correctAnswer: "c"
    },
    {
      question: "Which planet is known as the Red Planet?",
      a: "Venus",
      b: "Mars",
      c: "Jupiter",
      d: "Saturn",
      correctAnswer: "b"
    }
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {showSavedQuizzes ? (
          <motion.div 
            className="neu-container fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-center mb-3">Your Saved Quizzes</h1>
            
            {savedQuizzes.length === 0 ? (
              <div className="text-center mb-4">
                <p>You don't have any saved quizzes yet.</p>
              </div>
            ) : (
              <div className="saved-quizzes-list mb-4">
                {savedQuizzes.map((quiz, index) => (
                  <div key={index} className="saved-quiz-item neu-container" style={{ padding: '1rem', marginBottom: '1rem' }}>
                    <div className="saved-quiz-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{quiz.name}</h3>
                      <div>
                        <span style={{ marginRight: '0.5rem', fontSize: '0.9rem' }}>
                          {quiz.questions.length} questions
                        </span>
                        <button 
                          className="neu-button"
                          onClick={() => onLoadSavedQuiz(index)}
                          style={{ marginRight: '0.5rem', fontSize: '0.85rem', padding: '0.5em 1em' }}
                        >
                          Start
                        </button>
                        <button 
                          className="neu-button secondary"
                          onClick={() => onDeleteSavedQuiz(index)}
                          style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center">
              <button 
                className="neu-button secondary"
                onClick={() => setShowSavedQuizzes(false)}
              >
                Back to Create Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="neu-container fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-center mb-3">Quizzler</h1>
            
            <div className="text-center mb-3">
              {savedQuizzes.length > 0 && (
                <button 
                  className="neu-button secondary"
                  onClick={() => setShowSavedQuizzes(true)}
                  style={{ marginRight: '1rem' }}
                >
                  View Saved Quizzes
                </button>
              )}
              
              <button 
                className="neu-button primary"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-subjects'))}
                style={{ marginRight: '1rem' }}
              >
                Browse Subjects
              </button>
              
              <button 
                className="neu-button accent"
                onClick={copyQuizPrompt}
              >
                Copy Quiz Generator Prompt
              </button>
              
              {showCopySuccess && (
                <motion.p 
                  className="mt-2" 
                  style={{ color: 'var(--correct)', fontWeight: 500 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Prompt copied to clipboard!
                </motion.p>
              )}
            </div>
            
            <p className="mb-2">
              Enter your quiz questions in JSON format below:
            </p>
            
            <textarea 
              className="neu-input neu-textarea mb-2"
              value={jsonInput}
              onChange={handleInputChange}
              placeholder={JSON.stringify(sampleJson, null, 2)}
              rows={15}
            />
            
            {error && (
              <div className="mb-2" style={{ color: 'var(--incorrect)', fontWeight: 500 }}>
                {error}
              </div>
            )}
            
            <button 
              className="neu-button"
              onClick={handleSubmit}
              disabled={!jsonInput.trim()}
            >
              Start Quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <PromptHelper 
        isOpen={showPromptHelper} 
        onClose={() => setShowPromptHelper(false)} 
      />
    </>
  );
} 