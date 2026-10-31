const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllRead,
  broadcastAnnouncement,
} = require('../controllers/notificationController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);
router.post('/announcement', requireRole('office_manager', 'manager'), broadcastAnnouncement);

module.exports = router;
