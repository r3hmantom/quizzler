import { useState } from 'react';
import { motion } from 'framer-motion';

interface ResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onSaveQuiz: (name: string) => void;
}

export default function Results({ score, totalQuestions, onRestart, onSaveQuiz }: ResultsProps) {
  const [quizName, setQuizName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Calculate percentage score
  const percentage = Math.round((score / totalQuestions) * 100);
  
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
        <p className="mb-4" style={{ fontSize: '1.2rem' }}>
          {getMessage()}
        </p>
      </div>
      
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
                Save Quiz
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