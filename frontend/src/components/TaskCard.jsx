import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TaskCard({ task, onTaskUpdated }) {
  const { fetchWithAuth, isSandbox } = useAuth();
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;

    try {
      setUpdating(true);
      
      if (isSandbox) {
        const mockUpdated = {
          ...task,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        // Simulated latency
        await new Promise((resolve) => setTimeout(resolve, 200));
        onTaskUpdated(mockUpdated);
        return;
      }

      const response = await fetchWithAuth(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
    } catch (err) {
      console.error(err);
      alert('Failed to update task status.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Planned': return 'status-planned';
      case 'In Progress': return 'status-progress';
      case 'Complete': return 'status-complete';
      default: return '';
    }
  };

  return (
    <div className={`task-card ${updating ? 'updating' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`status-badge ${getStatusClass(task.status)}`}>
          {task.status}
        </span>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-actions">
        <label htmlFor={`status-select-${task.id}`} className="sr-only">Update Status</label>
        <select
          id={`status-select-${task.id}`}
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="status-selector"
        >
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Complete">Complete</option>
        </select>
      </div>
    </div>
  );
}
