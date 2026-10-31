const mongoose = require('mongoose');

const fertilizerRecommendationSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    soilContext: {
      type: String,
      default: 'General soil type',
    },
    region: {
      type: String,
      default: 'All Regions',
    },
    season: {
      type: String,
      default: 'Meher',
    },
    dapQuintalsPerHa: {
      type: Number,
      required: true,
      min: 0,
    },
    ureaQuintalsPerHa: {
      type: Number,
      required: true,
      min: 0,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructionsEn: {
      type: String,
      default: 'Apply DAP entirely during sowing. Split Urea into two applications (30 days and 60 days after emergence).',
    },
    instructionsAm: {
      type: String,
      default: 'ዳፕን በሙሉ በዘር ወቅት ይጨምሩ። ዩሪያን ለሁለት ከፍለው (ከተበቀለ ከ30 እና ከ60 ቀናት በኋላ) ይጠቀሙ።',
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

module.exports = mongoose.model('FertilizerRecommendation', fertilizerRecommendationSchema);
