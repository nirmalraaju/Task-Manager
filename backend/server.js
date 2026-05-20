const express = require('express');
const cors = require('cors');
require('dotenv').config();

const verifyToken = require('./middleware/authMiddleware');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5005;

// Enable CORS so the React client can talk to the backend
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://task-manager-frontend-nine-alpha.vercel.app' // Vercel Deployed Frontend
  ],
  credentials: true
}));

// Parse standard JSON request bodies
app.use(express.json());

// Request logger for visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Basic check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Register tasks router under the verifyToken middleware
app.use('/api/tasks', verifyToken, tasksRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Express server successfully initialized on port ${PORT}`);
  console.log(`Vite development proxy targets http://localhost:${PORT}`);
});
