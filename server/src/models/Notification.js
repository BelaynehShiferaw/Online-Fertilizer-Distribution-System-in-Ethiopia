const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    titleAm: {
      type: String,
      required: true,
    },
    messageEn: {
      type: String,
      required: true,
    },
    messageAm: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'agricultural_review',
        'price_update',
        'payment_status',
        'distribution_schedule',
        'distribution_complete',
        'system_announcement',
        'procurement_update',
      ],
      default: 'system_announcement',
    },
    actionUrl: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
