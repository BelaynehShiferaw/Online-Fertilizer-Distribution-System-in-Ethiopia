const mongoose = require('mongoose');

const farmPlotSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plotIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    areaInHectares: {
      type: Number,
      required: [true, 'Please specify plot area in hectares'],
      min: [0.05, 'Area must be at least 0.05 hectares'],
    },
    soilType: {
      type: String,
      enum: ['Vertisol (Walka / Black soil)', 'Nitisol (Key / Red soil)', 'Cambisol (Brown soil)', 'Sandy loam', 'Other'],
      default: 'Vertisol (Walka / Black soil)',
    },
    locationDescription: {
      type: String,
      default: '',
    },
    season: {
      type: String,
      enum: ['Meher (Main season)', 'Belg (Short rainy season)', 'Irrigation'],
      default: 'Meher (Main season)',
    },
    year: {
      type: Number,
      default: 2026,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FarmPlot', farmPlotSchema);
