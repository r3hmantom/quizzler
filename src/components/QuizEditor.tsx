import { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { validateQuizQuestions } from '../utils/quizUtils';
import { motion } from 'framer-motion';
import { UserSubject } from '../utils/userLibraryStorage';

interface QuizEditorProps {
  subjects: UserSubject[];
  initialTitle?: string;
  initialQuestions?: QuizQuestion[];
  editingQuizId?: string;
  defaultSubjectId?: string;
  onSave: (subjectId: string, title: string, questions: QuizQuestion[]) => void;
  onSaveAndStart: (subjectId: string, title: string, questions: QuizQuestion[]) => void;
  onCancel: () => void;
}

const sampleJson = [
  {
    question: 'What is the capital of France?',
    a: 'London',
    b: 'Berlin',
    c: 'Paris',
    d: 'Madrid',
    correctAnswer: 'c',
  },
];

export default function QuizEditor({
  subjects,
  initialTitle = '',
  initialQuestions,
  editingQuizId,
  defaultSubjectId,
  onSave,
  onSaveAndStart,
  onCancel,
}: QuizEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [subjectId, setSubjectId] = useState(
    defaultSubjectId || subjects[0]?.id || ''
  );
  const [jsonInput, setJsonInput] = useState(
    initialQuestions ? JSON.stringify(initialQuestions, null, 2) : ''
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultSubjectId) setSubjectId(defaultSubjectId);
  }, [defaultSubjectId]);

  useEffect(() => {
    if (initialQuestions) {
      setJsonInput(JSON.stringify(initialQuestions, null, 2));
    }
    if (initialTitle) setTitle(initialTitle);
  }, [initialQuestions, initialTitle]);

  const parseQuestions = (): QuizQuestion[] | null => {
    try {
      const parsed = JSON.parse(jsonInput);
      const validated = validateQuizQuestions(parsed);
      if (!validated || validated.length === 0) {
        setError('Invalid quiz format or no questions found.');
        return null;
      }
      setError(null);
      return validated;
    } catch {
      setError('Invalid JSON format. Please check your input.');
      return null;
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    const questions = parseQuestions();
    if (!questions) return;
    onSave(subjectId, title.trim(), questions);
  };

  const handleSaveAndStart = () => {
    if (!title.trim()) {
      setError('Please enter a quiz title.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    const questions = parseQuestions();
    if (!questions) return;
    onSaveAndStart(subjectId, title.trim(), questions);
  };

  return (
    <motion.div
      className="neu-container fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-center mb-3">
        {editingQuizId ? 'Edit Quiz' : 'Create Quiz'}
      </h1>

      {subjects.length === 0 ? (
        <p className="mb-3 text-center" style={{ color: 'var(--incorrect)' }}>
          Create a subject first before adding a quiz.
        </p>
      ) : (
        <>
          <label className="form-label">Quiz title</label>
          <input
            type="text"
            className="neu-input mb-2"
            placeholder="e.g. Chapter 1 Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="form-label">Subject</label>
          <select
            className="neu-input mb-2"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="form-label">Questions (JSON)</label>
          <textarea
            className="neu-input neu-textarea mb-2"
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setError(null);
            }}
            placeholder={JSON.stringify(sampleJson, null, 2)}
            rows={14}
          />
        </>
      )}

      {error && (
        <div className="mb-2" style={{ color: 'var(--incorrect)', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div className="editor-actions">
        <button className="neu-button secondary" onClick={onCancel}>
          Cancel
        </button>
        {subjects.length > 0 && (
          <>
            <button
              className="neu-button"
              onClick={handleSave}
              disabled={!jsonInput.trim() || !title.trim()}
            >
              Save Quiz
            </button>
            <button
              className="neu-button accent"
              onClick={handleSaveAndStart}
              disabled={!jsonInput.trim() || !title.trim()}
            >
              Save & Start
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
