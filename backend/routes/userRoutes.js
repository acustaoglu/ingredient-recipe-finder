// Updated userRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * POST /api/users/:userId/favorites
 * Body: { recipeId, recipeName }
 */
router.post('/:userId/favorites', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { userId: tokenUserId } = req.user;

  // Ensure IDs match
  if (Number(userId) !== tokenUserId) {
    return res.status(403).json({ error: 'Cannot access favorites of another user' });
  }

  const { recipeId, recipeName } = req.body;
  if (!recipeId || !recipeName) {
    return res.status(400).json({ error: 'recipeId and recipeName are required' });
  }

  const query = `INSERT INTO favorites (userId, recipeId, recipeName) VALUES (?, ?, ?)`;
  db.run(query, [userId, recipeId, recipeName], function (err) {
    if (err) {
      console.error('Error inserting favorite:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.status(201).json({
      message: 'Favorite recipe added successfully',
      favoriteId: this.lastID,
    });
  });
});

/**
 * GET /api/users/:userId/favorites
 */
// router.get('/:userId/favorites', authenticateToken, (req, res) => {
//   const { userId } = req.params;
//   const { userId: tokenUserId } = req.user;

//   if (Number(userId) !== tokenUserId) {
//     return res.status(403).json({ error: 'Cannot view favorites of another user' });
//   }

//   const query = `SELECT * FROM favorites WHERE userId = ?`;
//   db.all(query, [userId], (err, rows) => {
//     if (err) {
//       console.error('Error fetching favorites:', err.message);
//       return res.status(500).json({ error: 'Database error' });
//     }
//     return res.json(rows);
//   });
// });

router.get('/:userId/favorites', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { userId: tokenUserId } = req.user;

  if (Number(userId) !== tokenUserId) {
    return res.status(403).json({ error: 'Cannot view favorites of another user' });
  }

  const query = `SELECT * FROM favorites WHERE userId = ?`;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching favorites:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    return res.json(rows);
  });
});

/**
 * DELETE /api/users/:userId/favorites/:favoriteId
 */
router.delete('/:userId/favorites/:favoriteId', authenticateToken, (req, res) => {
  const { userId, favoriteId } = req.params;
  const { userId: tokenUserId } = req.user;

  if (Number(userId) !== tokenUserId) {
    return res.status(403).json({ error: 'Cannot delete favorites of another user' });
  }

  const query = `DELETE FROM favorites WHERE id = ? AND userId = ?`;
  db.run(query, [favoriteId, userId], function (err) {
    if (err) {
      console.error('Error deleting favorite:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    return res.status(200).json({ message: 'Favorite deleted successfully' });
  });
});

module.exports = router;
