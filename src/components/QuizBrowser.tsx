import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SubjectInfo, QuizInfo, loadQuizQuestions } from '../utils/quizDataUtils';
import SubjectList from './SubjectList';
import QuizList from './QuizList';
import SubjectManager from './SubjectManager';
import QuizEditor from './QuizEditor';
import { QuizQuestion, QuizSessionMeta } from '../types';
import {
  UserSubject,
  createUserSubject,
  updateUserSubject,
  deleteUserSubject,
  createUserQuiz,
  updateUserQuiz,
  getUserSubjects,
  getUserQuiz,
  migrateLegacyQuizzes,
} from '../utils/userLibraryStorage';

interface QuizBrowserProps {
  onStartQuiz: (questions: QuizQuestion[], meta: QuizSessionMeta) => void;
  onResumeQuiz?: () => void;
  hasPausedQuiz?: boolean;
  pausedSubjectName?: string;
  pausedQuizTitle?: string;
  pausedProgress?: string;
}

type View = 'subjects' | 'quizzes' | 'manage-subjects' | 'quiz-editor';

export default function QuizBrowser({
  onStartQuiz,
  onResumeQuiz,
  hasPausedQuiz,
  pausedSubjectName,
  pausedQuizTitle,
  pausedProgress,
}: QuizBrowserProps) {
  const [view, setView] = useState<View>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingQuizId, setEditingQuizId] = useState<string | undefined>();
  const [editorSubjectId, setEditorSubjectId] = useState<string | undefined>();

  const refreshLibrary = () => {
    migrateLegacyQuizzes();
    setUserSubjects(getUserSubjects());
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    refreshLibrary();
  }, []);

  const handleSelectSubject = (subject: SubjectInfo) => {
    setSelectedSubject(subject);
    setView('quizzes');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setView('subjects');
    refreshLibrary();
  };

  const handleSelectQuiz = async (quiz: QuizInfo) => {
    try {
      setLoading(true);
      setError(null);
      const questions = await loadQuizQuestions(quiz.path);

      if (questions.length === 0) {
        setError(`No questions found in quiz "${quiz.title}".`);
        return;
      }

      if (!selectedSubject) return;

      onStartQuiz(questions, {
        subjectName: selectedSubject.name,
        quizTitle: quiz.title,
        quizPath: quiz.path,
      });
    } catch (err) {
      console.error(`Error loading quiz ${quiz.title}:`, err);
      setError(`Failed to load quiz "${quiz.title}". Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = (subjectId: string, title: string, questions: QuizQuestion[]) => {
    if (editingQuizId) {
      updateUserQuiz(editingQuizId, { title, questions, subjectId });
    } else {
      createUserQuiz(subjectId, title, questions);
    }
    setEditingQuizId(undefined);
    setEditorSubjectId(undefined);
    refreshLibrary();
    if (selectedSubject?.isUserCreated) {
      setView('quizzes');
    } else {
      setView('subjects');
      setSelectedSubject(null);
    }
  };

  const openEditor = (subjectId: string, quizId?: string) => {
    setEditorSubjectId(subjectId);
    setEditingQuizId(quizId);
    setView('quiz-editor');
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
        <button className="neu-button" onClick={() => setError(null)}>
          Back
        </button>
      </div>
    );
  }

  if (view === 'manage-subjects') {
    return (
      <SubjectManager
        subjects={userSubjects}
        onCreate={(name, color, description) => {
          createUserSubject(name, color, description);
          refreshLibrary();
        }}
        onUpdate={(id, name, color, description) => {
          updateUserSubject(id, { name, color, description });
          refreshLibrary();
        }}
        onDelete={(id) => {
          deleteUserSubject(id);
          refreshLibrary();
        }}
        onClose={() => {
          setView('subjects');
          refreshLibrary();
        }}
      />
    );
  }

  if (view === 'quiz-editor') {
    const editing = editingQuizId ? getUserQuiz(editingQuizId) : undefined;
    return (
      <QuizEditor
        subjects={userSubjects}
        defaultSubjectId={editorSubjectId}
        initialTitle={editing?.title}
        initialQuestions={editing?.questions}
        editingQuizId={editingQuizId}
        onSave={handleSaveQuiz}
        onSaveAndStart={(subjectId, title, questions) => {
          let quizId = editingQuizId;
          if (editingQuizId) {
            updateUserQuiz(editingQuizId, { title, questions, subjectId });
          } else {
            const created = createUserQuiz(subjectId, title, questions);
            quizId = created.id;
          }
          setEditingQuizId(undefined);
          const subject = getUserSubjects().find((s) => s.id === subjectId);
          onStartQuiz(questions, {
            subjectName: subject?.name ?? 'My subject',
            quizTitle: title,
            quizPath: quizId ? `user-quiz-${quizId}` : undefined,
          });
        }}
        onCancel={() => {
          setEditingQuizId(undefined);
          if (selectedSubject?.isUserCreated) {
            setView('quizzes');
          } else {
            setView('subjects');
          }
        }}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'quizzes' && selectedSubject ? (
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
            onAddQuiz={(subjectId) => openEditor(subjectId)}
            onEditQuiz={(quizId) => {
              const quiz = getUserQuiz(quizId);
              if (quiz) openEditor(quiz.subjectId, quizId);
            }}
            refreshKey={refreshKey}
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
          {hasPausedQuiz && onResumeQuiz && (
            <div className="resume-banner neu-container mb-3">
              <p className="resume-banner-label">Continue where you left off</p>
              {pausedSubjectName && pausedQuizTitle ? (
                <div className="resume-banner-details">
                  <div className="resume-banner-row">
                    <span className="resume-banner-key">Subject</span>
                    <span className="resume-banner-value">{pausedSubjectName}</span>
                  </div>
                  <div className="resume-banner-row">
                    <span className="resume-banner-key">Quiz</span>
                    <span className="resume-banner-value">{pausedQuizTitle}</span>
                  </div>
                </div>
              ) : (
                <p className="resume-banner-fallback">Quiz in progress</p>
              )}
              {pausedProgress && (
                <p className="resume-banner-progress">{pausedProgress}</p>
              )}
              <button className="neu-button accent resume-banner-btn" onClick={onResumeQuiz}>
                Resume {pausedQuizTitle ? `"${pausedQuizTitle}"` : 'quiz'}
              </button>
            </div>
          )}
          <SubjectList
            onSelectSubject={handleSelectSubject}
            onManageSubjects={() => {
              refreshLibrary();
              setView('manage-subjects');
            }}
            refreshKey={refreshKey}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
