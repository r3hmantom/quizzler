import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SubjectInfo, QuizInfo, getQuizzesBySubject, getSubjectColor } from '../utils/quizDataUtils';

interface QuizListProps {
  subject: SubjectInfo;
  onBack: () => void;
  onSelectQuiz: (quiz: QuizInfo) => void;
}

export default function QuizList({ subject, onBack, onSelectQuiz }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzesBySubject(subject.name);
        setQuizzes(data);
        setError(null);
      } catch (err) {
        setError(`Failed to load quizzes for ${subject.name}. Please try again later.`);
        console.error(`Error loading quizzes for ${subject.name}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [subject]);

  if (loading) {
    return (
      <div className="neu-container text-center">
        <h2 className="mb-3">Loading Quizzes...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neu-container">
        <h2 className="mb-3">Error</h2>
        <p style={{ color: 'var(--incorrect)' }}>{error}</p>
        <button className="neu-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="neu-container">
      <div className="quiz-list-header">
        <button 
          className="neu-button secondary"
          onClick={onBack}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          ← Back to Subjects
        </button>
        <h1 className="text-center">{subject.name} Quizzes</h1>
      </div>
      
      {quizzes.length === 0 ? (
        <div className="text-center mt-4">
          <p>No quizzes available for this subject yet.</p>
        </div>
      ) : (
        <div className="quizzes-grid mt-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.fileName}
              className="quiz-card"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectQuiz(quiz)}
            >
              <div className="neu-container" style={{ 
                padding: '1.5rem',
                cursor: 'pointer',
                backgroundColor: getSubjectColor(subject.name)
              }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{quiz.title}</h3>
                <p>Start this quiz</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 