const express = require('express');
const router = express.Router();
const {
  getInventoryStatus,
  getTransactions,
  receiveShipment,
  reportDamage,
} = require('../controllers/inventoryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', getInventoryStatus);
router.get('/transactions', getTransactions);
router.post('/receipts', requireRole('office_manager', 'manager'), receiveShipment);
router.post('/damage', requireRole('laborer', 'office_manager', 'manager'), reportDamage);

module.exports = router;
