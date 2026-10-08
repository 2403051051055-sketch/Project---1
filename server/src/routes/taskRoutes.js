const express = require('express');
const router = express.Router();
const {
  parseTask,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  testReminder,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All task routes require JWT protection
router.use(protect);

router.post('/parse', parseTask);
router.post('/test-reminder', testReminder);
router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/status', toggleTaskStatus);

module.exports = router;
