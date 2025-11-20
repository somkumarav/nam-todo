# Todo App

A full-stack todo application with complete CRUD (Create, Read, Update, Delete) functionality built with HTML, CSS, Vanilla JavaScript, Node.js, and Express.

## Features

- ✅ Create new todos with title
- 📋 View all todos in a beautiful, modern interface
- ✏️ Edit existing todos
- 🗑️ Delete todos
- ✅ Mark todos as completed/incomplete
- 🔍 Filter todos (All, Active, Completed)
- 📱 Responsive design for mobile and desktop
- 🎨 Modern, gradient-based UI
- 💾 Persistent storage with PostgreSQL database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- PostgreSQL database (hosted externally)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database connection:
   - Create a `.env` file in the root directory (optional, you can also set it directly)
   - Add your PostgreSQL connection URL:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```
   - Or set it as an environment variable:
   ```bash
   export DATABASE_URL=postgresql://username:password@host:port/database
   ```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

**Note**: The database table will be created automatically on first run if it doesn't exist.

## Project Structure

```
todo/
├── server.js          # Express backend server
├── package.json       # Node.js dependencies
├── public/            # Frontend files
│   ├── index.html     # Main HTML file
│   ├── styles.css     # CSS styling
│   └── app.js         # Frontend JavaScript
└── README.md          # This file
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (external hosted database)

## Database Schema

The `todos` table has the following structure:
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255) NOT NULL)
- `completed` (BOOLEAN DEFAULT FALSE)
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updatedAt` (TIMESTAMP, nullable)

## Notes

- The app uses PostgreSQL database for persistent storage
- The database connection URL should be provided via the `DATABASE_URL` environment variable
- The table is created automatically on first run if it doesn't exist
- SSL connection is enabled by default for external databases

