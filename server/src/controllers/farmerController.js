const FarmerProfile = require('../models/FarmerProfile');
const FarmPlot = require('../models/FarmPlot');
const Crop = require('../models/Crop');

// @desc Get farmer profile
// @route GET /api/v1/farmers/me
const getMyFarmerProfile = async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id }).populate('user');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc Update farmer profile
// @route PATCH /api/v1/farmers/me
const updateMyFarmerProfile = async (req, res, next) => {
  try {
    const { region, zone, woreda, kebele, village, nationalId, cooperativeName } = req.body;
    let profile = await FarmerProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new FarmerProfile({
        user: req.user._id,
        farmerId: `ETH-FARM-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    if (region) profile.region = region;
    if (zone) profile.zone = zone;
    if (woreda) profile.woreda = woreda;
    if (kebele) profile.kebele = kebele;
    if (village !== undefined) profile.village = village;
    if (nationalId !== undefined) profile.nationalId = nationalId;
    if (cooperativeName !== undefined) profile.cooperativeName = cooperativeName;

    await profile.save();
    res.status(200).json({ success: true, message: 'Farmer profile updated.', profile });
  } catch (error) {
    next(error);
  }
};

// @desc Get farm plots of logged in farmer
// @route GET /api/v1/plots
const getPlots = async (req, res, next) => {
  try {
    const query = req.user.role === 'farmer' ? { farmer: req.user._id, active: true } : { active: true };
    const plots = await FarmPlot.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: plots.length, plots });
  } catch (error) {
    next(error);
  }
};

// @desc Register a new farm plot
// @route POST /api/v1/plots
const createPlot = async (req, res, next) => {
  try {
    const { plotIdentifier, areaInHectares, soilType, locationDescription, season, year } = req.body;

    if (!plotIdentifier || !areaInHectares) {
      return res.status(400).json({ success: false, message: 'Plot name/identifier and area in hectares are required.' });
    }

    const plot = await FarmPlot.create({
      farmer: req.user._id,
      plotIdentifier,
      areaInHectares: Number(areaInHectares),
      soilType: soilType || 'Vertisol (Walka / Black soil)',
      locationDescription: locationDescription || '',
      season: season || 'Meher (Main season)',
      year: year || 2026,
    });

    // Update total cultivated hectares on farmer profile
    const plots = await FarmPlot.find({ farmer: req.user._id, active: true });
    const totalArea = plots.reduce((acc, curr) => acc + (curr.areaInHectares || 0), 0);
    await FarmerProfile.updateOne({ user: req.user._id }, { totalCultivatedHectares: totalArea });

    res.status(201).json({ success: true, message: 'Farm plot registered successfully.', plot });
  } catch (error) {
    next(error);
  }
};

// @desc Update an existing plot
// @route PATCH /api/v1/plots/:id
const updatePlot = async (req, res, next) => {
  try {
    const plot = await FarmPlot.findById(req.params.id);
    if (!plot) {
      return res.status(404).json({ success: false, message: 'Farm plot not found.' });
    }

    // Ensure farmer owns the plot
    if (req.user.role === 'farmer' && plot.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this plot.' });
    }

    const { plotIdentifier, areaInHectares, soilType, locationDescription, season, year, active } = req.body;
    if (plotIdentifier) plot.plotIdentifier = plotIdentifier;
    if (areaInHectares) plot.areaInHectares = Number(areaInHectares);
    if (soilType) plot.soilType = soilType;
    if (locationDescription !== undefined) plot.locationDescription = locationDescription;
    if (season) plot.season = season;
    if (year) plot.year = year;
    if (active !== undefined) plot.active = active;

    await plot.save();

    // Recalculate total cultivated hectares
    const plots = await FarmPlot.find({ farmer: plot.farmer, active: true });
    const totalArea = plots.reduce((acc, curr) => acc + (curr.areaInHectares || 0), 0);
    await FarmerProfile.updateOne({ user: plot.farmer }, { totalCultivatedHectares: totalArea });

    res.status(200).json({ success: true, message: 'Plot updated successfully.', plot });
  } catch (error) {
    next(error);
  }
};

// @desc Get all supported crops
// @route GET /api/v1/crops
const getCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find({ active: true }).sort({ nameEn: 1 });
    res.status(200).json({ success: true, crops });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFarmerProfile,
  updateMyFarmerProfile,
  getPlots,
  createPlot,
  updatePlot,
  getCrops,
};
