const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/todoApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const taskSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  task: String,
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User exists.' });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({ success: true, userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/users/:userId/tasks', async (req, res) => {
  const { userId } = req.params;
  const { task } = req.body;
  try {
    const newTask = new Task({ userId, task });
    await newTask.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/users/:userId/tasks', async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/users/:userId/tasks/:taskId', async (req, res) => {
  const { userId, taskId } = req.params;
  const { task } = req.body;
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { task },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/users/:userId/tasks/:taskId', async (req, res) => {
  const { userId, taskId } = req.params;
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
