import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function Dashboard() {
  const { currentUser, logout, fetchWithAuth, isSandbox } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks (either from backend API or from localStorage if in sandbox)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      if (isSandbox) {
        // Retrieve from local storage
        const localTasks = localStorage.getItem('focusflow_tasks');
        if (localTasks) {
          setTasks(JSON.parse(localTasks));
        } else {
          // Put in some beautiful mock defaults
          const defaultTasks = [
            {
              id: "mock-1",
              title: "Explore FocusFlow features",
              description: "Create a new task, move it from Planned to In Progress, and complete it!",
              status: "Planned",
              createdAt: new Date().toISOString()
            },
            {
              id: "mock-2",
              title: "Setup Firebase Authentication & Firestore",
              description: "Follow the walkthrough.md guides to configure client-side and server-side configurations.",
              status: "In Progress",
              createdAt: new Date().toISOString()
            }
          ];
          setTasks(defaultTasks);
          localStorage.setItem('focusflow_tasks', JSON.stringify(defaultTasks));
        }
      } else {
        // Query backend server
        const response = await fetchWithAuth('/api/tasks');
        if (!response.ok) {
          let errorMsg = 'Failed to retrieve tasks from server.';
          try {
            const errData = await response.json();
            if (errData && errData.error) {
              errorMsg = errData.error;
            }
          } catch (e) {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not connect to backend server to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [isSandbox]);

  const handleTaskCreated = (newTask) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    if (isSandbox) {
      localStorage.setItem('focusflow_tasks', JSON.stringify(updated));
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
    if (isSandbox) {
      localStorage.setItem('focusflow_tasks', JSON.stringify(updated));
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-brand">
          <div className="logo-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2>FocusFlow</h2>
          {isSandbox && (
            <span style={{
              marginLeft: '12px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              color: '#f59e0b'
            }}>
              Sandbox Mode
            </span>
          )}
        </div>
        <div className="user-profile">
          <div className="user-info">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName} className="avatar" />
            ) : (
              <div className="avatar default-avatar">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
            )}
            <span className="username">{currentUser.displayName || currentUser.email}</span>
          </div>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="task-form-wrapper">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </section>

        {error && <div className="form-error">{error}</div>}

        <section className="board-section">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading your workspace...
            </div>
          ) : (
            <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
          )}
        </section>
      </main>
    </>
  );
}

function MainApp() {
  const { currentUser } = useAuth();
  return currentUser ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
