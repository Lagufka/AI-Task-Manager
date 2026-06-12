const TOKEN_LIFETIME_HOURS = process.env.TOKEN_LIFETIME_HOURS || 24;
const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key';
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  TOKEN_LIFETIME_HOURS,
  JWT_SECRET,
  NODE_ENV
};
