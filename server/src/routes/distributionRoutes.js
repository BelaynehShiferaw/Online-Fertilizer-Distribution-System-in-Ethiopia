const express = require('express');
const router = express.Router();
const {
  createDistributionOrder,
  getDistributionOrders,
  completeDistribution,
} = require('../controllers/distributionController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/', requireRole('office_manager', 'manager'), createDistributionOrder);
router.get('/', getDistributionOrders);
router.post('/:id/complete', requireRole('laborer', 'office_manager'), completeDistribution);

module.exports = router;
