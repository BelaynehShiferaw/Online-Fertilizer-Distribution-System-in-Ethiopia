const express = require('express');
const router = express.Router();
const {
  getInventoryReport,
  getDistributionReport,
  getFinancialReport,
  exportReportCsv,
} = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/inventory', requireRole('manager', 'office_manager'), getInventoryReport);
router.get('/distribution', requireRole('manager', 'office_manager'), getDistributionReport);
router.get('/financial', requireRole('manager'), getFinancialReport);
router.get('/export-csv', requireRole('manager', 'office_manager'), exportReportCsv);

module.exports = router;
