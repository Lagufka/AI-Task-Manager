const express = require('express');
const { authenticateToken } = require('../middleware/middleware');
const { getTasks, createTask, updateTask, deleteTask } = require('../services/data');
const { TASK_ANALYZER_URL } = require('../services/config');

const router = express.Router();

async function guessMissingTaskFields(title, description, category, priority) {
  if (category && priority) {
    return { category, priority };
  }

  try {
    const response = await fetch(`${ TASK_ANALYZER_URL }/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `Заголовок: ${ title }, Описание: ${ description }` })
    });

    if (!response.ok) {
      return { category: category || 'other', priority: priority || 'medium' };
    }

    const data = await response.json();
    return {
      category: category || data.category || 'other',
      priority: priority || data.priority || 'medium'
    };
  } catch (fetchError) {
    console.error('Analysis service error:', fetchError.message);
    return { category: category || 'other', priority: priority || 'medium' };
  }
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await getTasks(req.user.user_id);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description = '', category, priority } = req.body;
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const guessedFields = await guessMissingTaskFields(trimmedTitle, description, category, priority);

    const newTask = await createTask({
      user_id: req.user.user_id,
      title: trimmedTitle,
      description,
      category: guessedFields.category,
      priority: guessedFields.priority
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const deleted = await deleteTask(taskId, req.user.user_id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const allowedUpdates = ['title', 'description', 'category', 'priority', 'status'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedTask = await updateTask(taskId, req.user.user_id, updates);

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
