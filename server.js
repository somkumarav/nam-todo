require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL to your PostgreSQL connection string');
  console.error('Example: DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

// PostgreSQL database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Initialize database table
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP
      )
    `);
    console.log('Todos table ready');
  } catch (err) {
    console.error('Error creating table:', err.message);
  }
}

// Initialize on startup
initializeDatabase();

// GET /api/todos - Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/todos/:id - Get a single todo
app.get('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos - Create a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, completed } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title.trim(), completed || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;
    
    // First, get the existing todo
    const existingResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const existingTodo = existingResult.rows[0];
    
    // Update with new values or keep existing ones
    const updatedTitle = title !== undefined ? title.trim() : existingTodo.title;
    const updatedCompleted = completed !== undefined ? completed : existingTodo.completed;
    
    const result = await pool.query(
      'UPDATE todos SET title = $1, completed = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [updatedTitle, updatedCompleted, id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database connection closed');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
