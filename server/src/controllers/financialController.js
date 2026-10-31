const Expense = require('../models/Expense');
const SalaryPayment = require('../models/SalaryPayment');
const Payment = require('../models/Payment');
const ProcurementRequest = require('../models/ProcurementRequest');
const AuditService = require('../services/auditService');

// @desc Get financial summary (Manager)
// @route GET /api/v1/financial/summary
const getFinancialSummary = async (req, res, next) => {
  try {
    // Total income from verified farmer payments
    const verifiedPayments = await Payment.find({ verificationStatus: 'verified' });
    const totalIncome = verifiedPayments.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

    // Total approved operational expenses
    const approvedExpenses = await Expense.find({ status: 'approved' });
    const totalExpenses = approvedExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Total approved salaries
    const approvedSalaries = await SalaryPayment.find({ status: { $in: ['approved', 'paid'] } });
    const totalSalaries = approvedSalaries.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Total approved procurement commitments
    const approvedProcurements = await ProcurementRequest.find({ status: 'approved' });
    const totalProcurementCost = approvedProcurements.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

    const totalExpenditures = totalExpenses + totalSalaries + totalProcurementCost;
    const netBalance = totalIncome - totalExpenditures;

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        totalSalaries,
        totalProcurementCost,
        totalExpenditures,
        netBalance,
        verifiedPaymentCount: verifiedPayments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get expenses
// @route GET /api/v1/financial/expenses
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find()
      .populate('requestedBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    next(error);
  }
};

// @desc Create expense claim
// @route POST /api/v1/financial/expenses
const createExpense = async (req, res, next) => {
  try {
    const { category, description, amount, receiptUrl } = req.body;
    if (!category || !description || !amount) {
      return res.status(400).json({ success: false, message: 'Category, description, and amount are required.' });
    }

    const expense = await Expense.create({
      category,
      description,
      amount: Number(amount),
      receiptUrl: receiptUrl || '',
      status: req.user.role === 'manager' ? 'approved' : 'pending',
      requestedBy: req.user._id,
      approvedBy: req.user.role === 'manager' ? req.user._id : null,
      approvedAt: req.user.role === 'manager' ? new Date() : null,
    });

    res.status(201).json({ success: true, message: 'Expense record created.', expense });
  } catch (error) {
    next(error);
  }
};

// @desc Approve or reject expense (Manager only)
// @route PATCH /api/v1/financial/expenses/:id
const decideExpense = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

    expense.status = status;
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    expense.notes = notes || '';
    await expense.save();

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: `EXPENSE_${status.toUpperCase()}`,
      entityType: 'Expense',
      entityId: expense._id,
      ipAddress: req.ip,
      details: { amount: expense.amount, category: expense.category },
    });

    res.status(200).json({ success: true, message: `Expense ${status}.`, expense });
  } catch (error) {
    next(error);
  }
};

// @desc Get salary payments
// @route GET /api/v1/financial/salaries
const getSalaries = async (req, res, next) => {
  try {
    const salaries = await SalaryPayment.find()
      .populate('employee', 'name email role phone')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: salaries.length, salaries });
  } catch (error) {
    next(error);
  }
};

// @desc Create salary payment record
// @route POST /api/v1/financial/salaries
const createSalary = async (req, res, next) => {
  try {
    const { employeeId, employeeName, role, period, amount, notes } = req.body;
    if (!employeeId || !period || !amount) {
      return res.status(400).json({ success: false, message: 'Employee, period, and amount are required.' });
    }

    const salary = await SalaryPayment.create({
      employee: employeeId,
      employeeName: employeeName || 'Employee',
      role: role || 'Staff',
      period,
      amount: Number(amount),
      status: req.user.role === 'manager' ? 'approved' : 'pending',
      approvedBy: req.user.role === 'manager' ? req.user._id : null,
      approvedAt: req.user.role === 'manager' ? new Date() : null,
      notes: notes || '',
    });

    res.status(201).json({ success: true, message: 'Salary payment entry created.', salary });
  } catch (error) {
    next(error);
  }
};

// @desc Approve or mark paid salary (Manager only)
// @route PATCH /api/v1/financial/salaries/:id
const decideSalary = async (req, res, next) => {
  try {
    const { status, paymentReference, notes } = req.body;
    if (!['approved', 'paid', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid salary status.' });
    }

    const salary = await SalaryPayment.findById(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found.' });

    salary.status = status;
    salary.approvedBy = req.user._id;
    salary.approvedAt = new Date();
    if (paymentReference) salary.paymentReference = paymentReference;
    if (notes) salary.notes = notes;
    await salary.save();

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: `SALARY_${status.toUpperCase()}`,
      entityType: 'SalaryPayment',
      entityId: salary._id,
      ipAddress: req.ip,
      details: { amount: salary.amount, employeeName: salary.employeeName, period: salary.period },
    });

    res.status(200).json({ success: true, message: `Salary record updated to ${status}.`, salary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialSummary,
  getExpenses,
  createExpense,
  decideExpense,
  getSalaries,
  createSalary,
  decideSalary,
};
