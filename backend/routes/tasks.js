const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');

// 1. GET: Fetch all tasks for the logged-in user
router.get('/', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database service unavailable. Configure environment variable keys.' });
  }

  try {
    const snapshot = await db.collection('tasks')
      .where('userId', '==', req.user.uid)
      .get();
      
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort client-side by creation time (descending)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// 2. POST: Create a new task
router.post('/', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database service unavailable. Configure environment variable keys.' });
  }

  const { title, description, status } = req.body;
  if (!title || !status) {
    return res.status(400).json({ error: 'Title and Status are required.' });
  }

  try {
    const newTask = {
      title,
      description: description || '',
      status, // 'Planned', 'In Progress', or 'Complete'
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('tasks').add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// 3. PUT: Update an existing task's status
router.put('/:id', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database service unavailable. Configure environment variable keys.' });
  }

  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const taskRef = db.collection('tasks').doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Security check: Verify task owner
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this task.' });
    }

    const updates = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    await taskRef.update(updates);
    res.status(200).json({ id, ...doc.data(), ...updates });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

module.exports = router;
