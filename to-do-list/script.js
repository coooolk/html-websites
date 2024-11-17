const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const completedTaskList = document.getElementById("completedTaskList");
const clearTasksButton = document.getElementById("clearTasksButton");
const clearCompletedButton = document.getElementById("clearCompletedButton");
const clearUncompletedButton = document.getElementById("clearUncompletedButton");
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeIcon = document.getElementById("darkModeIcon");
const showAuthButton = document.getElementById("showAuthButton");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutButton = document.getElementById("logoutButton");
const authSection = document.getElementById("authSection");
const taskSection = document.getElementById("taskSection");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackMessage = document.getElementById("feedbackMessage");

const API_URL = 'http://192.168.0.136:3000';
let token = localStorage.getItem('token');
const socket = io(API_URL, {
  withCredentials: true,
  transportOptions: {
    polling: {
      extraHeaders: {
        'Authorization': `Bearer ${token}`
      }
    }
  }
});

// Function to show feedback modal
function showFeedback(message) {
    feedbackMessage.textContent = message;
    feedbackModal.style.display = "block";
}

// Close modal when clicking on <span> (x)
document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.onclick = function() {
        authModal.style.display = "none";
        feedbackModal.style.display = "none";
    }
});

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == authModal) {
        authModal.style.display = "none";
    }
    if (event.target == feedbackModal) {
        feedbackModal.style.display = "none";
    }
}

// Show auth modal
showAuthButton.onclick = function() {
    authModal.style.display = "block";
}

// Function to render tasks
async function renderTasks() {
    const response = await fetch(`${API_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const tasks = await response.json();

    taskList.innerHTML = "";
    completedTaskList.innerHTML = "";

    tasks.forEach((task) => {
        const li = createTaskElement(task);
        if (task.completed) {
            completedTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    });
}

// Function to create a task element
function createTaskElement(task) {
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");
    li.setAttribute("data-id", task._id);
    li.classList.add("task-item");

    li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""} />
        <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
        <button class="delete-button"><i class="fas fa-trash"></i></button>
    `;

    // Checkbox event
    li.querySelector(".task-check").addEventListener("change", async (event) => {
        await updateTask(task._id, { completed: event.target.checked });
    });

    // Delete button event
    li.querySelector(".delete-button").addEventListener("click", async () => {
        li.classList.add("fade-out");
        setTimeout(async () => {
            await deleteTask(task._id);
        }, 300);
    });

    // Drag events
    li.addEventListener("dragstart", dragStart);
    li.addEventListener("dragend", dragEnd);

    return li;
}

// Function to add a task
async function addTask() {
    if (taskInput.value.trim() === "") return;
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: taskInput.value.trim() })
    });
    const newTask = await response.json();
    taskInput.value = "";
    renderTasks();
}

// Function to update a task
async function updateTask(id, updates) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });
    renderTasks();
}

// Function to delete a task
async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    renderTasks();
}

// Function to clear all tasks
async function clearTasks() {
    const tasks = await fetch(`${API_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json());

    for (const task of tasks) {
        await deleteTask(task._id);
    }
    renderTasks();
}

// Function to clear completed tasks
async function clearCompletedTasks() {
    const tasks = await fetch(`${API_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json());

    for (const task of tasks) {
        if (task.completed) {
            await deleteTask(task._id);
        }
    }
    renderTasks();
}

// Function to clear uncompleted tasks
async function clearUncompletedTasks() {
    const tasks = await fetch(`${API_URL}/tasks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(res => res.json());

    for (const task of tasks) {
        if (!task.completed) {
            await deleteTask(task._id);
        }
    }
    renderTasks();
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.accessToken;
            localStorage.setItem('token', token);
            showFeedback("Logged in successfully!");
            authModal.style.display = "none";
            showTaskSection();
            renderTasks();
        } else {
            showFeedback(data.message || "Error logging in");
        }
    } catch (error) {
        showFeedback("Error logging in");
    }
}

// Register function
async function register(username, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            showFeedback("Registered successfully! Please log in.");
            document.getElementById("loginUsername").value = username;
            document.getElementById("loginPassword").value = password;
        } else {
            showFeedback(data.message || "Error registering user");
        }
    } catch (error) {
        showFeedback("Error registering user");
    }
}

// Logout function
function logout() {
    token = null;
    localStorage.removeItem('token');
    showAuthSection();
    taskList.innerHTML = "";
    completedTaskList.innerHTML = "";
}

// Function to show task section and hide auth section
function showTaskSection() {
    authSection.style.display = "none";
    taskSection.style.display = "block";
}

// Function to show auth section and hide task section
function showAuthSection() {
    authSection.style.display = "block";
    taskSection.style.display = "none";
}

// Event listeners
addTaskButton.addEventListener("click", addTask);
clearTasksButton.addEventListener("click", clearTasks);
clearCompletedButton.addEventListener("click", clearCompletedTasks);
clearUncompletedButton.addEventListener("click", clearUncompletedTasks);
taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

document.getElementById("loginButton").addEventListener("click", () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    login(username, password);
});

document.getElementById("registerButton").addEventListener("click", () => {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;
    register(username, password);
});

logoutButton.addEventListener("click", logout);

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeIcon.classList.toggle("fa-sun");
    darkModeIcon.classList.toggle("fa-moon");
});

// Socket.IO event listeners
socket.on('taskAdded', (task) => {
    renderTasks();
});

socket.on('taskUpdated', (task) => {
    renderTasks();
});

socket.on('taskDeleted', (taskId) => {
    renderTasks();
});

// Drag and drop functionality
let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        this.classList.add("dragging");
    }, 0);
}

function dragEnd() {
    setTimeout(() => {
        this.classList.remove("dragging");
        draggedItem = null;
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(this, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (afterElement == null) {
        this.appendChild(draggable);
    } else {
        this.insertBefore(draggable, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task-item:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function dragEnter() {
    this.classList.add("drag-over");
}

function dragLeave() {
    this.classList.remove("drag-over");
}

async function drop() {
    this.classList.remove("drag-over");
    const fromList = draggedItem.parentNode.id;
    const toList = this.id;

    const taskId = draggedItem.getAttribute("data-id");
    const completed = toList === "completedTaskList";

    await updateTask(taskId, { completed: completed });

    const afterElement = getDragAfterElement(this, event.clientY);
    if (afterElement == null) {
        this.appendChild(draggedItem);
    } else {
        this.insertBefore(draggedItem, afterElement);
    }

    renderTasks();
}

// Add event listeners for drag and drop
[taskList, completedTaskList].forEach(list => {
    list.addEventListener('dragover', dragOver);
    list.addEventListener('dragenter', dragEnter);
    list.addEventListener('dragleave', dragLeave);
    list.addEventListener('drop', drop);
});

// Initialize the app
function initApp() {
    if (token) {
        showTaskSection();
        renderTasks();
    } else {
        showAuthSection();
    }
}

// Set default mode to dark
document.body.classList.add("dark-mode");
darkModeIcon.classList.add("fa-sun");

initApp();