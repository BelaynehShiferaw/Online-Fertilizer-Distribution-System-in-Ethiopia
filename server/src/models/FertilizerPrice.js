const mongoose = require('mongoose');

const fertilizerPriceSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FertilizerProduct',
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      enum: ['DAP', 'UREA', 'NPS', 'NPSB'],
    },
    pricePerQuintal: {
      type: Number,
      required: [true, 'Please provide price per quintal in ETB'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'ETB',
    },
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    setBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: Date,
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FertilizerPrice', fertilizerPriceSchema);
