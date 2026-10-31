const express = require('express');
const router = express.Router();
const {
  getMyFarmerProfile,
  updateMyFarmerProfile,
  getPlots,
  createPlot,
  updatePlot,
  getCrops,
} = require('../controllers/farmerController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/me', getMyFarmerProfile);
router.patch('/me', updateMyFarmerProfile);

router.get('/plots', getPlots);
router.post('/plots', requireRole('farmer'), createPlot);
router.patch('/plots/:id', requireRole('farmer'), updatePlot);

router.get('/crops', getCrops);

module.exports = router;
