const Notification = require('../models/Notification');

class NotificationService {
  static async send({
    recipient,
    titleEn,
    titleAm,
    messageEn,
    messageAm,
    type = 'system_announcement',
    actionUrl = '',
  }) {
    try {
      const notification = await Notification.create({
        recipient,
        titleEn,
        titleAm,
        messageEn,
        messageAm,
        type,
        actionUrl,
      });
      return notification;
    } catch (error) {
      console.error('[NotificationService Error]', error.message);
      return null;
    }
  }

  static async broadcastToRole(role, { titleEn, titleAm, messageEn, messageAm, type = 'system_announcement', actionUrl = '' }) {
    try {
      const User = require('../models/User');
      const users = await User.find({ role, status: 'active' }).select('_id');
      const notifications = users.map((u) => ({
        recipient: u._id,
        titleEn,
        titleAm,
        messageEn,
        messageAm,
        type,
        actionUrl,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
      return notifications.length;
    } catch (error) {
      console.error('[NotificationService Broadcast Error]', error.message);
      return 0;
    }
  }
}

module.exports = NotificationService;
