const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  getExpenses,
  createExpense,
  decideExpense,
  getSalaries,
  createSalary,
  decideSalary,
} = require('../controllers/financialController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/summary', requireRole('manager'), getFinancialSummary);

// Expenses
router.get('/expenses', requireRole('manager', 'office_manager'), getExpenses);
router.post('/expenses', requireRole('manager', 'office_manager'), createExpense);
router.patch('/expenses/:id', requireRole('manager'), decideExpense);

// Salaries
router.get('/salaries', requireRole('manager'), getSalaries);
router.post('/salaries', requireRole('manager'), createSalary);
router.patch('/salaries/:id', requireRole('manager'), decideSalary);

module.exports = router;
