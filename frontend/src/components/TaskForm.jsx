import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TaskForm({ onTaskCreated }) {
  const { fetchWithAuth, isSandbox } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      
      if (isSandbox) {
        // Create mock local task
        const mockTask = {
          id: 'mock-' + Date.now(),
          title,
          description: description || '',
          status: 'Planned',
          createdAt: new Date().toISOString()
        };
        // Simulated latency
        await new Promise((resolve) => setTimeout(resolve, 300));
        onTaskCreated(mockTask);
        setTitle('');
        setDescription('');
        return;
      }

      const response = await fetchWithAuth('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          status: 'Planned' // Default status when created
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      onTaskCreated(newTask);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Could not create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Create New Task</h2>
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="task-title">Task Title</label>
        <input
          id="task-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-desc">Description (Optional)</label>
        <textarea
          id="task-desc"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={submitting}
        />
      </div>

      <button type="submit" className="submit-btn" disabled={submitting || !title.trim()}>
        {submitting ? 'Creating...' : 'Add Task'}
      </button>
    </form>
  );
}
