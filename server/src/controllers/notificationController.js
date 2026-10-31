const Notification = require('../models/Notification');
const NotificationService = require('../services/notificationService');

// @desc Get user notifications
// @route GET /api/v1/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification as read
// @route PATCH /api/v1/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc Mark all as read
// @route PATCH /api/v1/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// @desc Send bilingual system announcement (Office Manager or Manager)
// @route POST /api/v1/notifications/announcement
const broadcastAnnouncement = async (req, res, next) => {
  try {
    const { targetRole, titleEn, titleAm, messageEn, messageAm } = req.body;

    if (!titleEn || !titleAm || !messageEn || !messageAm) {
      return res.status(400).json({ success: false, message: 'Bilingual titles and messages in both English and Amharic are required.' });
    }

    const count = await NotificationService.broadcastToRole(targetRole || 'farmer', {
      titleEn,
      titleAm,
      messageEn,
      messageAm,
      type: 'system_announcement',
    });

    res.status(200).json({ success: true, message: `Announcement broadcast to ${count} ${targetRole || 'farmer'} users.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  broadcastAnnouncement,
};
