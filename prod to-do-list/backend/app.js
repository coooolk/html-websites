const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: ["https://to-do.techtronics.top"], // Replace with your frontend URL
  //default: "https://to-do.techtronics.top",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://192.168.0.115:27017/todo_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const User = mongoose.model('User', {
  username: { type: String, unique: true },
  password: String,
});

// Task model
const Task = mongoose.model('Task', {
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  completed: Boolean,
  important: Boolean,
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    return res.status(400).json({ message: 'Cannot find user' });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ id: user._id }, 'your_jwt_secret');
      res.json({ accessToken: accessToken });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const maxOrderTask = await Task.findOne({ userId: req.user.id }).sort('-order');
    const newOrder = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = new Task({
      userId: req.user.id,
      text: req.body.text,
      completed: false,
      important: false,
      order: newOrder
    });

    const newTask = await task.save();
    io.emit('taskAdded', newTask);
    res.status(201).json(newTask);
  } catch {
    res.status(400).json({ message: 'Error adding task' });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (task == null) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.text = req.body.text || task.text;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
    task.important = req.body.important !== undefined ? req.body.important : task.important;
    const updatedTask = await task.save();
    io.emit('taskUpdated', updatedTask);
    res.json(updatedTask);
  } catch {
    res.status(400).json({ message: 'Error updating task' });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (task == null) {
      return res.status(404).json({ message: 'Task not found' });
    }
    io.emit('taskDeleted', req.params.id);
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Add this new route for reordering tasks
app.put('/tasks/reorder', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    for (const task of tasks) {
      await Task.findOneAndUpdate(
        { _id: task.id, userId: req.user.id },
        { $set: { order: task.order } }
      );
    }
    res.json({ message: 'Task order updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating task order' });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));