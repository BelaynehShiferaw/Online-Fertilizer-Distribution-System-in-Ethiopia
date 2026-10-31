const mongoose = require('mongoose');

const distributionOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FertilizerRequest',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedLaborer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorizedDap: {
      type: Number,
      required: true,
      default: 0,
    },
    authorizedUrea: {
      type: Number,
      required: true,
      default: 0,
    },
    distributedDap: {
      type: Number,
      default: 0,
    },
    distributedUrea: {
      type: Number,
      default: 0,
    },
    distributionLocation: {
      type: String,
      required: true,
      default: 'Woreda Central Distribution Depot',
    },
    scheduledDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'partially_fulfilled', 'completed', 'cancelled'],
      default: 'pending',
    },
    farmerAcknowledgmentSigned: {
      type: Boolean,
      default: false,
    },
    farmerSignatureName: {
      type: String,
      default: '',
    },
    distributionDate: Date,
    stockDeducted: {
      type: Boolean,
      default: false,
    },
    damagedBagsReported: {
      type: Number,
      default: 0,
    },
    laborerNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DistributionOrder', distributionOrderSchema);
