const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserByEmail, getUserByCredentials, createUser } = require('../services/data');
const { JWT_SECRET, TOKEN_LIFETIME_HOURS, NODE_ENV } = require('../services/config');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = createUser({ email, password, name });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    JWT_SECRET,
    { expiresIn: `${TOKEN_LIFETIME_HOURS}h` }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_LIFETIME_HOURS * 60 * 60 * 1000
  });

  res.status(201).send();
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = getUserByCredentials(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: `${TOKEN_LIFETIME_HOURS}h` }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_LIFETIME_HOURS * 60 * 60 * 1000
  });

  res.status(200).send();
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0)
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
