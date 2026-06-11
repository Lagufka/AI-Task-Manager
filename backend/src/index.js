const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();




const TOKEN_LIFETIME_HOURS = 24;
const PORT = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
  console.warn('Warning: Running in development mode. Make sure to set JWT_SECRET and NODE_ENV=production in production environments.');
}

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using default development secret key.');
}


// ======= Middleware =======

app.set('trust proxy', 1);

if (NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}

app.use(express.json());
app.use(cookieParser());

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


// ======= Database =======

const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }
];

const mockUserTasks = [
  { id: 1, userId: 1, title: 'Sample task 1', category: 'other', priority: 'medium', status: 'in_progress', created_at: '2024-06-01T10:00:00Z' },
  { id: 2, userId: 1, title: 'Sample task 2', category: 'other', priority: 'high', status: 'new', created_at: '2024-06-01T10:00:00Z' },
  { id: 3, userId: 1, title: 'Sample task 3', category: 'other', priority: 'low', status: 'done', created_at: '2024-06-01T10:00:00Z' },
  { id: 4, userId: 1, title: 'Sample task 4', category: 'other', priority: 'medium', status: 'in_progress', created_at: '2024-06-01T10:00:00Z' },
];

let nextTaskId = 5;

const getUserByEmail = (email) => mockUsers.find((user) => user.email === email);

const getUserByCredentials = (email, password) =>
  mockUsers.find((user) => user.email === email && user.password === password);

const createUser = ({ email, password, name }) => {
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    name
  };

  mockUsers.push(newUser);
  return newUser;
};

const getTasks = (userId = null) => {
  if (userId == null) {
    return mockUserTasks;
  }

  return mockUserTasks.filter((task) => task.userId === userId);
};

const getTaskByIdAndUser = (taskId, userId) =>
  mockUserTasks.find((task) => task.id === taskId && task.userId === userId);

const createTask = ({ userId, title, category, priority }) => {
  const task = {
    id: nextTaskId++,
    userId,
    title,
    category,
    priority,
    status: 'new',
    created_at: new Date().toISOString()
  };

  mockUserTasks.push(task);
  return task;
};

const updateTask = (taskId, userId, updates) => {
  const taskIndex = mockUserTasks.findIndex(
    (task) => task.id === taskId && task.userId === userId
  );

  if (taskIndex === -1) {
    return null;
  }

  mockUserTasks[taskIndex] = { ...mockUserTasks[taskIndex], ...updates };
  return mockUserTasks[taskIndex];
};

const deleteTask = (taskId, userId) => {
  const taskIndex = mockUserTasks.findIndex(
    (task) => task.id === taskId && task.userId === userId
  );

  if (taskIndex === -1) {
    return false;
  }

  mockUserTasks.splice(taskIndex, 1);
  return true;
};


// ======= Auth API Endpoints =======

app.post('/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = createUser({ email, password, name });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: `${ TOKEN_LIFETIME_HOURS }h` }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_LIFETIME_HOURS * 60 * 60 * 1000
  });

  res.status(201).send();
});


app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByCredentials(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: `${ TOKEN_LIFETIME_HOURS }h` }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_LIFETIME_HOURS * 60 * 60 * 1000
  });

  res.status(200).send();
});


app.post('/auth/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0)
  });

  res.status(200).json({ message: 'Logged out successfully' });
});



// ======= CRUD API Endpoints =======

app.get('/tasks', authenticateToken, (req, res) => {
  const tasks = getTasks(req.user.userId);

  res.status(200).json({
    ...tasks
  });
});


app.post('/tasks', authenticateToken, (req, res) => {
  const { title, category, priority } = req.body;

  const newTask = createTask({
    userId: req.user.userId,
    title,
    category,
    priority
  });

  res.status(201).send();
});


app.delete('/tasks/:id', authenticateToken, (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const deleted = deleteTask(taskId, req.user.userId);

  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});


app.put('/tasks/:id', authenticateToken, (req, res) => {
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

  res.status(200).send();
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${ PORT }`);
});