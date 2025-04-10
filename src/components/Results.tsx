import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '../types';

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onSaveQuiz: (name: string) => void;
  problematicQuestions: { question: QuizQuestion; incorrectCount: number }[];
}

export default function Results({ score, totalQuestions, onRestart, onSaveQuiz, problematicQuestions }: ResultsProps) {
  const [quizName, setQuizName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showProblematicQuestions, setShowProblematicQuestions] = useState(false);
  
  // Calculate percentage score - based on total unique questions
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Calculate correct and wrong answers
  const correctAnswers = score;
  const wrongAnswers = totalQuestions - score;

  // Sort problematic questions by incorrect count (most incorrect first)
  const sortedProblematicQuestions = [...(problematicQuestions || [])].sort(
    (a, b) => b.incorrectCount - a.incorrectCount
  );
  
  // Function to get message based on score percentage
  const getMessage = () => {
    if (percentage === 100) {
      return "Perfect! You got all questions right!";
    } else if (percentage >= 80) {
      return "Great job! You're doing amazing!";
    } else if (percentage >= 60) {
      return "Good work! Keep practicing!";
    } else if (percentage >= 40) {
      return "Not bad, but there's room for improvement.";
    } else {
      return "Keep practicing, you'll get better!";
    }
  };
  
  // Function to get confetti emoji based on score
  const getEmojis = () => {
    if (percentage === 100) {
      return "🎉 🏆 🎊";
    } else if (percentage >= 80) {
      return "🎉 👏";
    } else if (percentage >= 60) {
      return "👍 😊";
    } else if (percentage >= 40) {
      return "👍";
    } else {
      return "💪";
    }
  };

  const handleSaveQuiz = () => {
    if (quizName.trim()) {
      onSaveQuiz(quizName.trim());
      setIsSaved(true);
      setShowSaveForm(false);
    }
  };

  return (
    <motion.div 
      className="neu-container text-center" 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="mb-2">Quiz Completed!</h1>
      
      <div className="mb-4">
        <p style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {getEmojis()}
        </p>
        <p className="mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Your Score: {score}/{totalQuestions} ({percentage}%)
        </p>
        <div className="mb-4" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--correct)', fontWeight: 500 }}>
            Correct: {correctAnswers}
          </p>
          <p style={{ fontSize: '1.1rem', color: 'var(--incorrect)', fontWeight: 500 }}>
            Wrong: {wrongAnswers}
          </p>
        </div>
        <p className="mb-4" style={{ fontSize: '1.2rem' }}>
          {getMessage()}
        </p>
      </div>
      
      {/* Problematic Questions Section */}
      {sortedProblematicQuestions.length > 0 && (
        <div className="mb-4">
          <button 
            className="neu-button secondary mb-2"
            onClick={() => setShowProblematicQuestions(!showProblematicQuestions)}
          >
            {showProblematicQuestions ? 'Hide Challenging Questions' : 'Show Challenging Questions'}
          </button>
          
          {showProblematicQuestions && (
            <motion.div 
              className="neu-container-inner"
              style={{ textAlign: 'left', padding: '1rem', marginTop: '1rem' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Questions You Found Challenging
              </h3>
              
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {sortedProblematicQuestions.map((item, index) => (
                  <li key={index} className="mb-3" style={{ 
                    padding: '1rem', 
                    border: '2px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-light)',
                    boxShadow: '3px 3px 0 var(--shadow-color)'
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      Q: {item.question.question}
                    </p>
                    <p style={{ color: 'var(--incorrect)', marginBottom: '0.5rem' }}>
                      Answered incorrectly {item.incorrectCount} times
                    </p>
                    <p style={{ color: 'var(--correct)' }}>
                      Correct answer: {item.question.correctAnswer.toUpperCase()} - {item.question[item.question.correctAnswer]}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}
      
      <div className="mb-4">
        {showSaveForm ? (
          <div className="save-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              className="neu-input mb-2"
              placeholder="Enter a name for this quiz"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="neu-button secondary"
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </button>
              <button 
                className="neu-button"
                onClick={handleSaveQuiz}
                disabled={!quizName.trim()}
              >
                Save Problematic Questions
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="neu-button"
              onClick={onRestart}
            >
              Try Again
            </button>
            
            {!isSaved && (
              <button 
                className="neu-button secondary"
                onClick={() => setShowSaveForm(true)}
              >
                Save Quiz
              </button>
            )}
          </div>
        )}
      </div>
      
      {isSaved && (
        <motion.p 
          className="mb-2" 
          style={{ color: 'var(--correct)', fontWeight: 500 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Quiz saved successfully!
        </motion.p>
      )}
      
      <p style={{ fontSize: '0.9rem', marginTop: '2rem', opacity: 0.8 }}>
        Thank you for using Quizzler!
      </p>
    </motion.div>
  );
} 