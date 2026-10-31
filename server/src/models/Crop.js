const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    nameEn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameAm: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ['Cereal', 'Pulse', 'Oilseed', 'Vegetable', 'Other'],
      default: 'Cereal',
    },
    defaultDapRatePerHa: {
      type: Number,
      required: true, // in quintals (e.g. 1.0 quintal/ha = 100kg/ha)
      default: 1.0,
    },
    defaultUreaRatePerHa: {
      type: Number,
      required: true, // in quintals (e.g. 1.0 quintal/ha)
      default: 1.0,
    },
    descriptionEn: String,
    descriptionAm: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
