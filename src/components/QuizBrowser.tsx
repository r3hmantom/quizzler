import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SubjectInfo, QuizInfo, loadQuizQuestions } from '../utils/quizDataUtils';
import SubjectList from './SubjectList';
import QuizList from './QuizList';
import { QuizQuestion } from '../types';

interface QuizBrowserProps {
  onStartQuiz: (questions: QuizQuestion[]) => void;
}

export default function QuizBrowser({ onStartQuiz }: QuizBrowserProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSubject = (subject: SubjectInfo) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  const handleSelectQuiz = async (quiz: QuizInfo) => {
    try {
      setLoading(true);
      
      // Load the quiz questions
      const questions = await loadQuizQuestions(quiz.path);
      
      if (questions.length === 0) {
        setError(`No questions found in quiz "${quiz.title}".`);
        return;
      }
      
      // Start the quiz
      onStartQuiz(questions);
      
    } catch (err) {
      setError(`Failed to load quiz "${quiz.title}". Please try again.`);
      console.error(`Error loading quiz ${quiz.title}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="neu-container text-center">
        <h2 className="mb-3">Loading Quiz...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neu-container">
        <h2 className="mb-3">Error</h2>
        <p style={{ color: 'var(--incorrect)' }}>{error}</p>
        <button 
          className="neu-button" 
          onClick={() => {
            setError(null);
          }}
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {selectedSubject ? (
        <motion.div
          key="quiz-list"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <QuizList
            subject={selectedSubject}
            onBack={handleBackToSubjects}
            onSelectQuiz={handleSelectQuiz}
          />
        </motion.div>
      ) : (
        <motion.div
          key="subject-list"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          <SubjectList onSelectSubject={handleSelectSubject} />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 