const mongoose = require('mongoose');

const fertilizerProductSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      enum: ['DAP', 'UREA', 'NPS', 'NPSB'],
    },
    nameEn: {
      type: String,
      required: true,
    },
    nameAm: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      default: 'Quintal (100 kg)',
    },
    bagSizeKg: {
      type: Number,
      default: 50, // 2 bags = 1 quintal
    },
    currentStockQuintals: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reservedQuintals: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Reserved stock cannot be negative'],
    },
    minimumAlertThreshold: {
      type: Number,
      default: 50, // alert when below 50 quintals
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

fertilizerProductSchema.virtual('availableStockQuintals').get(function () {
  return Math.max(0, this.currentStockQuintals - this.reservedQuintals);
});

module.exports = mongoose.model('FertilizerProduct', fertilizerProductSchema);
