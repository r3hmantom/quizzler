import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserSubject } from '../utils/userLibraryStorage';

const PRESET_COLORS = ['#64c2a6', '#ffde59', '#ff6b6b', '#6bcbff', '#c9a0ff', '#ffb347'];

interface SubjectManagerProps {
  subjects: UserSubject[];
  onCreate: (name: string, color: string, description?: string) => void;
  onUpdate: (id: string, name: string, color: string, description?: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function SubjectManager({
  subjects,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}: SubjectManagerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color, description.trim() || undefined);
    setName('');
    setDescription('');
  };

  const startEdit = (subject: UserSubject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditDescription(subject.description || '');
    setEditColor(subject.color);
  };

  const handleUpdate = () => {
    if (!editingId || !editName.trim()) return;
    onUpdate(editingId, editName.trim(), editColor, editDescription.trim() || undefined);
    setEditingId(null);
  };

  return (
    <motion.div
      className="neu-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="quiz-list-header mb-3">
        <button className="neu-button secondary" onClick={onClose} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          ← Back
        </button>
        <h1 className="text-center">Manage Subjects</h1>
      </div>

      <div className="neu-container-inner mb-4" style={{ padding: '1rem', textAlign: 'left' }}>
        <h3 className="mb-2">Create new subject</h3>
        <input
          className="neu-input mb-2"
          placeholder="Subject name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="neu-input mb-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="color-picker mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <button className="neu-button" onClick={handleCreate} disabled={!name.trim()}>
          Create Subject
        </button>
      </div>

      <h3 className="mb-2">Your subjects</h3>
      {subjects.length === 0 ? (
        <p className="text-center mb-3">No custom subjects yet. Create one above.</p>
      ) : (
        <ul className="library-list">
          {subjects.map((subject) => (
            <li key={subject.id} className="library-item neu-container" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              {editingId === subject.id ? (
                <div>
                  <input className="neu-input mb-2" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input
                    className="neu-input mb-2"
                    placeholder="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <div className="color-picker mb-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`color-swatch ${editColor === c ? 'selected' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setEditColor(c)}
                      />
                    ))}
                  </div>
                  <div className="item-actions">
                    <button className="neu-button" onClick={handleUpdate}>Save</button>
                    <button className="neu-button secondary" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="item-row">
                  <div>
                    <span className="subject-dot" style={{ backgroundColor: subject.color }} />
                    <strong>{subject.name}</strong>
                    {subject.description && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', opacity: 0.85 }}>
                        {subject.description}
                      </p>
                    )}
                  </div>
                  <div className="item-actions">
                    <button className="neu-button secondary" onClick={() => startEdit(subject)} style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}>
                      Edit
                    </button>
                    <button
                      className="neu-button secondary"
                      onClick={() => {
                        if (confirm(`Delete "${subject.name}" and all its quizzes?`)) {
                          onDelete(subject.id);
                        }
                      }}
                      style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
