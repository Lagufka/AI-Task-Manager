const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserByEmail, getUserByCredentials, createUser } = require('../services/data');
const { JWT_SECRET, TOKEN_LIFETIME_HOURS, NODE_ENV } = require('../services/config');
const { validateEmail, validatePassword } = require('../utils/validators');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailErrors = validateEmail(email);
    if (emailErrors.length > 0) {
      return res.status(400).json({ error: emailErrors[0] });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ error: passwordErrors[0] });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await createUser({ email, password });

    const token = jwt.sign(
      { user_id: newUser.id, email: newUser.email },
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
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
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
