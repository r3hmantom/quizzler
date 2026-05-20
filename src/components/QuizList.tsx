import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  SubjectInfo,
  QuizInfo,
  getQuizzesBySubject,
  getSubjectColor,
  loadQuizQuestions,
} from '../utils/quizDataUtils';
import {
  deleteUserQuiz,
  downloadQuizJson,
  getUserQuiz,
} from '../utils/userLibraryStorage';

interface QuizListProps {
  subject: SubjectInfo;
  onBack: () => void;
  onSelectQuiz: (quiz: QuizInfo) => void;
  onAddQuiz: (subjectId: string) => void;
  onEditQuiz: (quizId: string) => void;
  refreshKey?: number;
}

export default function QuizList({
  subject,
  onBack,
  onSelectQuiz,
  onAddQuiz,
  onEditQuiz,
  refreshKey = 0,
}: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzesBySubject(subject.name, subject);
      setQuizzes(data);
      setError(null);
    } catch (err) {
      setError(`Failed to load quizzes for ${subject.name}. Please try again later.`);
      console.error(`Error loading quizzes for ${subject.name}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, [subject, refreshKey]);

  const handleExport = async (quiz: QuizInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const questions =
      quiz.isUserCreated && quiz.userQuizId
        ? getUserQuiz(quiz.userQuizId)?.questions
        : await loadQuizQuestions(quiz.path);
    if (!questions?.length) return;
    downloadQuizJson(quiz.title, questions);
    setExportMsg(`Exported "${quiz.title}"`);
    setTimeout(() => setExportMsg(null), 2500);
  };

  const handleDelete = (quiz: QuizInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quiz.userQuizId) return;
    if (confirm(`Delete quiz "${quiz.title}"?`)) {
      deleteUserQuiz(quiz.userQuizId);
      loadQuizzes();
    }
  };

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
        <button className="neu-button" onClick={loadQuizzes}>
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

      {subject.isUserCreated && subject.id && (
        <div className="text-center mb-3">
          <button className="neu-button accent" onClick={() => onAddQuiz(subject.id!)}>
            + Add Quiz to Subject
          </button>
        </div>
      )}

      {exportMsg && (
        <p className="text-center mb-2" style={{ color: 'var(--correct)', fontWeight: 500 }}>
          {exportMsg}
        </p>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center mt-4">
          <p>No quizzes in this subject yet.</p>
          {subject.isUserCreated && subject.id && (
            <button className="neu-button mt-2" onClick={() => onAddQuiz(subject.id!)}>
              Create your first quiz
            </button>
          )}
        </div>
      ) : (
        <div className="quizzes-grid mt-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.userQuizId || quiz.fileName}
              className="quiz-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className="neu-container quiz-card-inner"
                style={{
                  padding: '1.5rem',
                  backgroundColor: getSubjectColor(subject.name),
                }}
              >
                <h3 style={{ marginBottom: '0.5rem' }}>{quiz.title}</h3>
                <div className="quiz-card-actions">
                  <button className="neu-button" onClick={() => onSelectQuiz(quiz)}>
                    Start
                  </button>
                  <button
                    className="neu-button secondary"
                    onClick={(e) => handleExport(quiz, e)}
                    style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
                  >
                    Export JSON
                  </button>
                  {quiz.isUserCreated && quiz.userQuizId && (
                    <>
                      <button
                        className="neu-button secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditQuiz(quiz.userQuizId!);
                        }}
                        style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
                      >
                        Edit
                      </button>
                      <button
                        className="neu-button secondary"
                        onClick={(e) => handleDelete(quiz, e)}
                        style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
