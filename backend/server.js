require('dotenv').config();
const express = require('express');
const cors = require('cors');  // Allow cross-origin requests
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all requests (or configure specific origins)
app.use(cors());

// Parse JSON in request bodies
app.use(express.json());

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Ingredient Recipe Finder API!');
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
