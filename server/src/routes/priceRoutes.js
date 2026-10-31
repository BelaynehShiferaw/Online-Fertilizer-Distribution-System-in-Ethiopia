const express = require('express');
const router = express.Router();
const { getPrices, setPrice, publishPrice } = require('../controllers/priceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Public route to view prices
router.get('/public', getPrices);

router.use(requireAuth);
router.get('/', getPrices);
router.post('/', requireRole('manager'), setPrice);
router.post('/:id/publish', requireRole('office_manager', 'manager'), publishPrice);

module.exports = router;
