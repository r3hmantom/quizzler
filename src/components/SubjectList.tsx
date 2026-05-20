import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SubjectInfo, getSubjects, getSubjectColor } from '../utils/quizDataUtils';

interface SubjectListProps {
  onSelectSubject: (subject: SubjectInfo) => void;
  onManageSubjects: () => void;
  refreshKey?: number;
}

export default function SubjectList({
  onSelectSubject,
  onManageSubjects,
  refreshKey = 0,
}: SubjectListProps) {
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const data = await getSubjects();
        setSubjects(data);
        setError(null);
      } catch (err) {
        setError('Failed to load subjects. Please try again later.');
        console.error('Error loading subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="neu-container text-center">
        <h2 className="mb-3">Loading Subjects...</h2>
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

  const builtIn = subjects.filter((s) => !s.isUserCreated);
  const userCreated = subjects.filter((s) => s.isUserCreated);

  const renderSubjectCard = (subject: SubjectInfo, index: number) => (
    <motion.div
      key={subject.path}
      className="subject-card"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelectSubject(subject)}
    >
      <div
        className="neu-container"
        style={{
          padding: '1.5rem',
          cursor: 'pointer',
          backgroundColor: getSubjectColor(subject.name),
        }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>{subject.name}</h2>
        <p>{subject.description || `Explore ${subject.name.toLowerCase()} quizzes`}</p>
        {subject.isUserCreated && (
          <span className="badge-user">Your subject</span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="neu-container">
      <h1 className="text-center mb-4">Select a Subject</h1>

      <div className="text-center mb-4">
        <button className="neu-button accent" onClick={onManageSubjects}>
          + Create / Manage Subjects
        </button>
      </div>

      {builtIn.length > 0 && (
        <>
          <h2 className="section-label mb-2">Built-in</h2>
          <div className="subjects-grid mb-4">
            {builtIn.map((subject, index) => renderSubjectCard(subject, index))}
          </div>
        </>
      )}

      {userCreated.length > 0 && (
        <>
          <h2 className="section-label mb-2">Your library</h2>
          <div className="subjects-grid">
            {userCreated.map((subject, index) =>
              renderSubjectCard(subject, builtIn.length + index)
            )}
          </div>
        </>
      )}

      {subjects.length === 0 && (
        <p className="text-center">No subjects yet. Create your first subject above.</p>
      )}
    </div>
  );
}
