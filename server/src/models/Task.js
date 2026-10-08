const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    labels: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'completed', 'reopened'],
      default: 'pending',
      index: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    originalText: {
      type: String,
      default: '',
    },
    assignee: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal search and filtering
taskSchema.index({ userId: 1, status: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
