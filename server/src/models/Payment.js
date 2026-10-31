const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentReference: {
      type: String,
      required: [true, 'Payment reference or slip number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FertilizerRequest',
      required: true,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Please enter the amount paid in ETB'],
      min: [1, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'ETB',
    },
    paymentMethod: {
      type: String,
      enum: [
        'commercial_bank_of_ethiopia',
        'telebirr',
        'cbe_birr',
        'coop_bank_of_oromia',
        'amhara_bank',
        'dashen_bank',
        'other_bank',
      ],
      default: 'commercial_bank_of_ethiopia',
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
      required: [true, 'Payment receipt document or photo is required'],
    },
    receiptOriginalName: String,
    receiptMimeType: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    rejectionReason: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
