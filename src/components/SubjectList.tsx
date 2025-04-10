import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SubjectInfo, getSubjects } from '../utils/quizDataUtils';

interface SubjectListProps {
  onSelectSubject: (subject: SubjectInfo) => void;
}

export default function SubjectList({ onSelectSubject }: SubjectListProps) {
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
  }, []);

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

  return (
    <div className="neu-container">
      <h1 className="text-center mb-4">Select a Subject</h1>
      
      <div className="subjects-grid">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.name}
            className="subject-card"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectSubject(subject)}
          >
            <div className="neu-container" style={{ 
              padding: '1.5rem',
              cursor: 'pointer',
              backgroundColor: getSubjectColor(subject.name)
            }}>
              <h2 style={{ marginBottom: '0.5rem' }}>{subject.name}</h2>
              <p>Explore {subject.name.toLowerCase()} quizzes</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Function to get a color based on subject name
function getSubjectColor(subjectName: string): string {
  switch (subjectName) {
    case 'Mathematics':
      return '#ffde59'; // Yellow
    case 'Science':
      return '#64c2a6'; // Teal
    case 'History':
      return '#ff914d'; // Orange
    default:
      return 'white';
  }
} 