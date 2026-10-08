const Task = require('../models/Task');
const { parseTaskText } = require('../services/geminiService');

// @desc    Parse raw text with Gemini AI to generate task preview
// @route   POST /api/tasks/parse
// @access  Private
const parseTask = async (req, res, next) => {
  try {
    const { text, timeZone, clientNow } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400);
      throw new Error('Please provide natural language text to parse');
    }

    const userTimeZone = timeZone || req.user.timeZone || 'UTC';
    const parsedResult = await parseTaskText(text, userTimeZone, clientNow);

    res.json({
      success: true,
      data: parsedResult,
      originalText: text,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, labels, originalText, assignee, subject } = req.body;

    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      labels: Array.isArray(labels) ? [...new Set(labels.map(l => String(l).toLowerCase().trim()).filter(Boolean))] : [],
      status: 'pending',
      originalText: originalText || '',
      assignee: assignee || '',
      subject: subject || '',
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for current user with search, filter, and sort
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, label, search, sortBy } = req.query;

    const filter = { userId: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (label) {
      filter.labels = label.toLowerCase().trim();
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1, createdAt: -1 };
    } else if (sortBy === 'priority') {
      // Custom priority order handled in client or secondary sort
      sortOptions = { priority: 1, dueDate: 1 };
    } else if (sortBy === 'createdAtAsc') {
      sortOptions = { createdAt: 1 };
    }

    const tasks = await Task.find(filter).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, labels, assignee, subject } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) task.priority = priority;
    if (labels !== undefined) task.labels = Array.isArray(labels) ? [...new Set(labels.map(l => String(l).toLowerCase().trim()).filter(Boolean))] : [];
    if (assignee !== undefined) task.assignee = assignee;
    if (subject !== undefined) task.subject = subject;

    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task status (pending <-> completed)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const toggleTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.status === 'completed') {
      task.status = 'pending';
    } else {
      task.status = 'completed';
    }
    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or unauthorized');
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger test email reminder to authenticated user
// @route   POST /api/tasks/test-reminder
// @access  Private
const testReminder = async (req, res, next) => {
  try {
    const { sendTaskReminderEmail } = require('../services/emailService');
    const dummyTask = {
      title: 'Sample Test Task (Upcoming Due Date)',
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      priority: 'high',
    };

    const sent = await sendTaskReminderEmail(req.user.email, dummyTask);
    if (!sent) {
      return res.status(400).json({
        success: false,
        message: 'Email not sent. Ensure SMTP_USER and SMTP_PASS are configured in server/.env',
      });
    }

    res.json({
      success: true,
      message: `Test reminder email successfully sent to ${req.user.email}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  parseTask,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  testReminder,
};
