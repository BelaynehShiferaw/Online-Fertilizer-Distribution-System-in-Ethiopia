const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    farmerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      default: 'Oromia', // e.g. Oromia, Amhara, Sidama, Tigray, SNNPR
    },
    zone: {
      type: String,
      required: true,
      default: 'East Shewa',
    },
    woreda: {
      type: String,
      required: true,
      default: 'Ada\'a',
    },
    kebele: {
      type: String,
      required: true,
      default: 'Denkaka',
    },
    village: {
      type: String,
      default: '',
    },
    nationalId: {
      type: String,
      default: '',
    },
    cooperativeName: {
      type: String,
      default: 'Ada\'a Farmers Cooperative Union',
    },
    totalCultivatedHectares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
