const TOKEN_LIFETIME_HOURS = process.env.TOKEN_LIFETIME_HOURS || 24;
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';
const NODE_ENV = process.env.NODE_ENV || 'development';

const POSTGRES_HOST = process.env.PG_HOST || 'localhost';
const POSTGRES_PORT = process.env.PG_PORT || 5432;
const POSTGRES_DATABASE = process.env.PG_DATABASE || 'appdb';
const POSTGRES_USER = process.env.PG_USER || 'appuser';
const POSTGRES_PASSWORD = process.env.PG_PASSWORD || 'secret';

const TASK_ANALYZER_URL = process.env.TASK_ANALYZER_URL || 'http://localhost:8000';

module.exports = {
  TOKEN_LIFETIME_HOURS,
  JWT_SECRET,
  NODE_ENV,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  TASK_ANALYZER_URL
};
