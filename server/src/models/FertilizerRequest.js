const mongoose = require('mongoose');

const requestHistoryItemSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  previousStatus: { type: String },
  newStatus: { type: String },
});

const fertilizerRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
    },
    plot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmPlot',
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    cultivatedArea: {
      type: Number,
      required: true,
      min: 0.05,
    },
    requestedDap: {
      type: Number,
      required: true,
      min: 0,
    },
    requestedUrea: {
      type: Number,
      required: true,
      min: 0,
    },
    approvedDap: {
      type: Number,
      default: 0,
    },
    approvedUrea: {
      type: Number,
      default: 0,
    },
    // Snapshot pricing at approval/payment time
    dapPricePerQuintal: {
      type: Number,
      default: 0,
    },
    ureaPricePerQuintal: {
      type: Number,
      default: 0,
    },
    totalAmountDue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_agricultural_review',
        'changes_requested',
        'approved',
        'rejected',
        'awaiting_payment',
        'payment_under_verification',
        'payment_verified',
        'ready_for_distribution',
        'partially_distributed',
        'completed',
      ],
      default: 'draft',
    },
    reviewedByExpert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expertNotes: {
      type: String,
      default: '',
    },
    expertDecisionDate: Date,
    isAdditionalRequest: {
      type: Boolean,
      default: false,
    },
    originalRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FertilizerRequest',
    },
    history: [requestHistoryItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FertilizerRequest', fertilizerRequestSchema);
