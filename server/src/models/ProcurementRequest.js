const mongoose = require('mongoose');

const procurementRequestSchema = new mongoose.Schema(
  {
    procurementNumber: {
      type: String,
      required: true,
      unique: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dapQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    ureaQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },
    justification: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    managerNotes: {
      type: String,
      default: '',
    },
    decisionDate: Date,
    includedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FertilizerRequest',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ProcurementRequest', procurementRequestSchema);
