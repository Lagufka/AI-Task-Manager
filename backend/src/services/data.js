const { Pool } = require('pg');
const { POSTGRES_USER, POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_PASSWORD, POSTGRES_PORT } = require('../services/config');

const requiredEnvVars = ['POSTGRES_USER', 'POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_PASSWORD', 'POSTGRES_PORT'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`Warning: Environment variable ${ varName } is not set. Using default value.`);
  }
});

const pgPool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DATABASE,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT,
});

pgPool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('Connected to PostgreSQL');
    release();
  }
});

const getUserByEmail = async (email) => {
  const query = 'SELECT id, email FROM users WHERE email = $1 LIMIT 1';
  const { rows } = await pgPool.query(query, [email]);
  return rows[0] || null;
};

const getUserByCredentials = async (email, password) => {
  const query = 'SELECT id, email FROM users WHERE email = $1 AND password_hash = $2 LIMIT 1';
  const { rows } = await pgPool.query(query, [email, password]); // HASH PASSWORD!
  return rows[0] || null;
};

const createUser = async ({ email, password, name }) => {
  const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email';
  const { rows } = await pgPool.query(query, [email, password]); // HASH PASSWORD!
  return rows[0];
};

const getTasks = async (user_id = null) => {
  if (user_id == null) { return [] }

  const { rows } = await pgPool.query(
    'SELECT id, user_id, title, description, category, priority, status, created_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [user_id]
  );

  return rows;
};

const getTaskByIdAndUser = async (taskId, user_id) => {
  const query = 'SELECT id, user_id, title, description, category, priority, status, created_at FROM tasks WHERE id = $1 AND user_id = $2 LIMIT 1';
  const { rows } = await pgPool.query(query, [taskId, user_id]);
  return rows[0] || null;
};

const createTask = async ({ user_id, title, description, category, priority }) => {
  const query = `INSERT INTO tasks (user_id, title, description, category, priority, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, title, description, category, priority, status, created_at`;
  const values = [user_id, title, description, category, priority, 'new', new Date()];
  const { rows } = await pgPool.query(query, values);
  return rows[0];
};

const updateTask = async (taskId, user_id, updates) => {
  const fields = Object.keys(updates);

  if (fields.length === 0) {
    return getTaskByIdAndUser(taskId, user_id);
  }

  const setClauses = fields.map((field, index) => `${ field } = $${ index + 1 }`);
  const values = fields.map((field) => updates[field]);
  values.push(taskId, user_id);

  const query = `UPDATE tasks SET ${ setClauses.join(', ') } WHERE id = $${ values.length - 1 } AND user_id = $${ values.length } RETURNING id, user_id, title, description, category, priority, status, created_at`;
  const { rows } = await pgPool.query(query, values);

  return rows[0] || null;
};

const deleteTask = async (taskId, user_id) => {
  const query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id';
  const { rows } = await pgPool.query(query, [taskId, user_id]);
  return rows.length > 0;
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
