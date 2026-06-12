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
  { id: 4, userId: 1, title: 'Sample task 4', category: 'other', priority: 'medium', status: 'in_progress', created_at: '2024-06-01T10:00:00Z' }
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

module.exports = {
  getUserByEmail,
  getUserByCredentials,
  createUser,
  getTasks,
  getTaskByIdAndUser,
  createTask,
  updateTask,
  deleteTask
};
