const express = require('express');
const router = express.Router();
const { submitPayment, getPayments, verifyPayment, serveReceipt } = require('../controllers/paymentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../config/multer');

router.use(requireAuth);

router.post('/', requireRole('farmer'), upload.single('receipt'), submitPayment);
router.get('/', getPayments);
router.post('/:id/verify', requireRole('office_manager', 'manager'), verifyPayment);
router.get('/receipts/:filename', serveReceipt);

module.exports = router;
