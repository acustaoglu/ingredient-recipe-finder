const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'REPLACE_THIS_WITH_A_LONG_RANDOM_STRING';
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // Check if user exists
    const checkUserQuery = `SELECT * FROM users WHERE username = ?`;
    db.get(checkUserQuery, [username], async (err, row) => {
      if (err) {
        console.error('Error checking user:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Insert user
      const insertUserQuery = `INSERT INTO users (username, passwordHash) VALUES (?, ?)`;
      db.run(insertUserQuery, [username, passwordHash], function (insertErr) {
        if (insertErr) {
          console.error('Error inserting user:', insertErr.message);
          return res.status(500).json({ error: 'Database error' });
        }
        return res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const query = `SELECT * FROM users WHERE username = ?`;
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ message: 'Login successful', token, userId: user.id  });
  });
});

module.exports = router;
