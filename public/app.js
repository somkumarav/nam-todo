// API Base URL
const API_URL = '/api/todos';

// State
let todos = [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const cancelEditBtn = document.getElementById('cancelEdit');
const closeModal = document.querySelector('.close');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Form submission
    todoForm.addEventListener('submit', handleCreateTodo);
    
    // Edit form submission
    editForm.addEventListener('submit', handleUpdateTodo);
    
    // Modal close
    closeModal.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
}

// API Functions
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        return await response.json();
    } catch (error) {
        console.error('Error fetching todos:', error);
        showError('Failed to load todos. Please refresh the page.');
        return [];
    }
}

async function createTodo(todoData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData),
        });
        if (!response.ok) throw new Error('Failed to create todo');
        return await response.json();
    } catch (error) {
        console.error('Error creating todo:', error);
        showError('Failed to create todo. Please try again.');
        throw error;
    }
}

async function updateTodo(id, todoData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData),
        });
        if (!response.ok) throw new Error('Failed to update todo');
        return await response.json();
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
        throw error;
    }
}

async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete todo');
        return true;
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
        throw error;
    }
}

// Load and render todos
async function loadTodos() {
    todos = await fetchTodos();
    renderTodos();
}

function renderTodos() {
    // Filter todos based on current filter
    const filteredTodos = getFilteredTodos();
    
    // Clear the list
    todoList.innerHTML = '';
    
    // Show/hide empty state
    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.textContent = currentFilter === 'all' 
            ? 'No todos yet. Add one above to get started!'
            : currentFilter === 'active'
            ? 'No active todos. Great job!'
            : 'No completed todos yet.';
    } else {
        emptyState.classList.add('hidden');
    }
    
    // Render each todo
    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function createTodoElement(todo) {
    const todoDiv = document.createElement('div');
    todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    todoDiv.dataset.id = todo.id;
    
    const date = new Date(todo.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    todoDiv.innerHTML = `
        <div class="todo-header">
            <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
        </div>
        <div class="todo-footer">
            <div class="todo-actions">
                <button class="btn btn-edit" onclick="openEditModal(${todo.id})">Edit</button>
                <button class="btn btn-danger" onclick="handleDeleteTodo(${todo.id})">Delete</button>
            </div>
            <div>
                <label class="checkbox-label">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="handleToggleComplete(${todo.id}, this.checked)">
                    <span>Completed</span>
                </label>
            </div>
            <span class="todo-date">Created: ${date}</span>
        </div>
    `;
    
    return todoDiv;
}

// Form Handlers
async function handleCreateTodo(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('title');
    
    const todoData = {
        title: titleInput.value,
        completed: false
    };
    
    try {
        const newTodo = await createTodo(todoData);
        todos.push(newTodo);
        renderTodos();
        
        // Reset form
        todoForm.reset();
        titleInput.focus();
    } catch (error) {
        // Error already handled in createTodo
    }
}

async function handleUpdateTodo(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editId').value);
    const title = document.getElementById('editTitle').value;
    const completed = document.getElementById('editCompleted').checked;
    
    const todoData = {
        title,
        completed
    };
    
    try {
        const updatedTodo = await updateTodo(id, todoData);
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
        }
        renderTodos();
        closeEditModal();
    } catch (error) {
        // Error already handled in updateTodo
    }
}

async function handleDeleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }
    
    try {
        await deleteTodo(id);
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    } catch (error) {
        // Error already handled in deleteTodo
    }
}

async function handleToggleComplete(id, completed) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const updatedTodo = await updateTodo(id, {
            title: todo.title,
            completed
        });
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = updatedTodo;
        }
        renderTodos();
    } catch (error) {
        // Error already handled in updateTodo
        // Revert checkbox state
        const todoElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        if (todoElement) {
            const checkbox = todoElement.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !completed;
            }
        }
    }
}

// Modal Functions
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    document.getElementById('editId').value = todo.id;
    document.getElementById('editTitle').value = todo.title;
    document.getElementById('editCompleted').checked = todo.completed || false;
    
    editModal.style.display = 'block';
    document.getElementById('editTitle').focus();
}

function closeEditModal() {
    editModal.style.display = 'none';
    editForm.reset();
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple error notification (you could enhance this with a toast library)
    alert(message);
}

