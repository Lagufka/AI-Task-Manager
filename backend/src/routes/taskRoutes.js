const express = require('express');
const { authenticateToken } = require('../middleware/middleware');
const { getTasks, createTask, updateTask, deleteTask } = require('../services/data');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const tasks = getTasks(req.user.userId);

  res.status(200).json(tasks);
});

router.post('/', authenticateToken, (req, res) => {
  const { title, category, priority } = req.body;

  const newTask = createTask({
    userId: req.user.userId,
    title,
    category,
    priority
  });

  res.status(201).json(newTask);
});

router.delete('/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const deleted = deleteTask(taskId, req.user.userId);

  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});

router.put('/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const allowedUpdates = ['title', 'category', 'priority', 'status'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedTask = updateTask(taskId, req.user.userId, updates);

  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(updatedTask);
});

module.exports = router;
