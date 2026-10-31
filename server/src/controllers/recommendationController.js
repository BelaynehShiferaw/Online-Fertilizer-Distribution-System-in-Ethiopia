const FertilizerRecommendation = require('../models/FertilizerRecommendation');
const Crop = require('../models/Crop');

// @desc Get fertilizer recommendations
// @route GET /api/v1/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const { crop, region } = req.query;
    const query = { active: true };
    if (crop) query.crop = crop;
    if (region) query.region = region;

    const recommendations = await FertilizerRecommendation.find(query)
      .populate('crop')
      .populate('expert', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: recommendations.length, recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new fertilizer recommendation (Agricultural Expert)
// @route POST /api/v1/recommendations
const createRecommendation = async (req, res, next) => {
  try {
    const { cropId, soilContext, region, season, dapQuintalsPerHa, ureaQuintalsPerHa, instructionsEn, instructionsAm } = req.body;

    if (!cropId || dapQuintalsPerHa === undefined || ureaQuintalsPerHa === undefined) {
      return res.status(400).json({ success: false, message: 'Crop, DAP rate, and Urea rate are required.' });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(400).json({ success: false, message: 'Crop not found.' });

    const rec = await FertilizerRecommendation.create({
      crop: crop._id,
      soilContext: soilContext || 'General soil context',
      region: region || 'National / All Regions',
      season: season || 'Meher',
      dapQuintalsPerHa: Number(dapQuintalsPerHa),
      ureaQuintalsPerHa: Number(ureaQuintalsPerHa),
      expert: req.user._id,
      instructionsEn: instructionsEn || 'Apply DAP basal at planting; apply Urea top-dressing.',
      instructionsAm: instructionsAm || 'ዳፕን በዘር ወቅት፣ ዩሪያን አፈር ከለበሰ በኋላ ይጠቀሙ።',
    });

    res.status(201).json({ success: true, message: 'Fertilizer recommendation published.', recommendation: rec });
  } catch (error) {
    next(error);
  }
};

// @desc Update fertilizer recommendation
// @route PATCH /api/v1/recommendations/:id
const updateRecommendation = async (req, res, next) => {
  try {
    const rec = await FertilizerRecommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ success: false, message: 'Recommendation not found.' });

    const { soilContext, region, season, dapQuintalsPerHa, ureaQuintalsPerHa, instructionsEn, instructionsAm, active } = req.body;
    if (soilContext) rec.soilContext = soilContext;
    if (region) rec.region = region;
    if (season) rec.season = season;
    if (dapQuintalsPerHa !== undefined) rec.dapQuintalsPerHa = Number(dapQuintalsPerHa);
    if (ureaQuintalsPerHa !== undefined) rec.ureaQuintalsPerHa = Number(ureaQuintalsPerHa);
    if (instructionsEn) rec.instructionsEn = instructionsEn;
    if (instructionsAm) rec.instructionsAm = instructionsAm;
    if (active !== undefined) rec.active = active;

    await rec.save();
    res.status(200).json({ success: true, message: 'Recommendation updated.', recommendation: rec });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
};
