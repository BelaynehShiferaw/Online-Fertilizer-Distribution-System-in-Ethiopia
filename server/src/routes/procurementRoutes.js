const express = require('express');
const router = express.Router();
const {
  getConsolidatedDemand,
  createProcurementRequest,
  getProcurementRequests,
  decisionProcurementRequest,
} = require('../controllers/procurementController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/consolidated-demand', requireRole('office_manager', 'manager'), getConsolidatedDemand);
router.post('/', requireRole('office_manager'), createProcurementRequest);
router.get('/', requireRole('office_manager', 'manager'), getProcurementRequests);
router.post('/:id/decision', requireRole('manager'), decisionProcurementRequest);

module.exports = router;
