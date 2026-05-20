import React from 'react';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onTaskUpdated }) {
  const columns = [
    { title: 'Planned', key: 'Planned', class: 'col-planned' },
    { title: 'In Progress', key: 'In Progress', class: 'col-progress' },
    { title: 'Complete', key: 'Complete', class: 'col-complete' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="task-board">
      {columns.map(col => {
        const colTasks = getTasksByStatus(col.key);
        return (
          <div key={col.key} className={`task-column ${col.class}`}>
            <div className="column-header">
              <h3>{col.title}</h3>
              <span className="task-count">{colTasks.length}</span>
            </div>
            <div className="column-body">
              {colTasks.length === 0 ? (
                <div className="empty-column-placeholder">
                  No tasks here
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onTaskUpdated={onTaskUpdated} 
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
