const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const folderPath = path.join(__dirname, 'db');
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}

const dbPath = path.resolve(__dirname, 'db', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the local SQLite database.');
  }
});

// Favorites table
const createFavoritesTable = `
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    recipeId TEXT NOT NULL,
    recipeName TEXT NOT NULL
  )
`;
db.run(createFavoritesTable, (err) => {
  if (err) {
    console.error('Error creating favorites table:', err.message);
  }
});

// Users table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  )
`;
db.run(createUsersTable, (err) => {
  if (err) {
    console.error('Error creating users table:', err.message);
  }
});

module.exports = db;
