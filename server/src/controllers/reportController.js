const FertilizerProduct = require('../models/FertilizerProduct');
const InventoryTransaction = require('../models/InventoryTransaction');
const DistributionOrder = require('../models/DistributionOrder');
const FertilizerRequest = require('../models/FertilizerRequest');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const SalaryPayment = require('../models/SalaryPayment');

// @desc Generate comprehensive inventory report
// @route GET /api/v1/reports/inventory
const getInventoryReport = async (req, res, next) => {
  try {
    const products = await FertilizerProduct.find({ active: true });
    const transactions = await InventoryTransaction.find().sort({ createdAt: -1 });

    const summaryByProduct = {};

    for (const prod of products) {
      const prodTxns = transactions.filter((t) => t.productCode === prod.code);
      const incoming = prodTxns
        .filter((t) => t.transactionType === 'shipment_received')
        .reduce((sum, t) => sum + t.quantityQuintals, 0);

      const distributed = prodTxns
        .filter((t) => t.transactionType === 'distribution_dispatch')
        .reduce((sum, t) => sum + Math.abs(t.quantityQuintals), 0);

      const damaged = prodTxns
        .filter((t) => t.transactionType === 'damage_adjustment')
        .reduce((sum, t) => sum + Math.abs(t.quantityQuintals), 0);

      summaryByProduct[prod.code] = {
        nameEn: prod.nameEn,
        nameAm: prod.nameAm,
        currentStock: prod.currentStockQuintals,
        reservedStock: prod.reservedQuintals,
        availableStock: Math.max(0, prod.currentStockQuintals - prod.reservedQuintals),
        totalIncoming: incoming,
        totalDistributed: distributed,
        totalDamaged: damaged,
      };
    }

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      summaryByProduct,
      recentTransactions: transactions.slice(0, 50),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate distribution report
// @route GET /api/v1/reports/distribution
const getDistributionReport = async (req, res, next) => {
  try {
    const orders = await DistributionOrder.find()
      .populate('farmer', 'name phone')
      .populate('assignedLaborer', 'name')
      .populate('request', 'requestNumber')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    let totalDapDistributed = 0;
    let totalUreaDistributed = 0;

    orders.forEach((o) => {
      totalDapDistributed += o.distributedDap || 0;
      totalUreaDistributed += o.distributedUrea || 0;
    });

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      metrics: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalDapDistributed,
        totalUreaDistributed,
      },
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate financial report
// @route GET /api/v1/reports/financial
const getFinancialReport = async (req, res, next) => {
  try {
    const verifiedPayments = await Payment.find({ verificationStatus: 'verified' })
      .populate('farmer', 'name')
      .populate('request', 'requestNumber')
      .sort({ createdAt: -1 });

    const totalVerifiedIncome = verifiedPayments.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

    const approvedExpenses = await Expense.find({ status: 'approved' }).sort({ createdAt: -1 });
    const totalExpenses = approvedExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const approvedSalaries = await SalaryPayment.find({ status: { $in: ['approved', 'paid'] } }).sort({ createdAt: -1 });
    const totalSalaries = approvedSalaries.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      financials: {
        totalVerifiedIncome,
        totalExpenses,
        totalSalaries,
        netCashflow: totalVerifiedIncome - (totalExpenses + totalSalaries),
      },
      payments: verifiedPayments,
      expenses: approvedExpenses,
      salaries: approvedSalaries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export report data as downloadable CSV
// @route GET /api/v1/reports/export-csv
const exportReportCsv = async (req, res, next) => {
  try {
    const { type } = req.query; // 'inventory' | 'distribution' | 'financial'

    let filename = `ofdms-report-${type || 'general'}-${Date.now()}.csv`;
    let csvContent = '';

    if (type === 'distribution') {
      const orders = await DistributionOrder.find().populate('farmer', 'name phone').populate('assignedLaborer', 'name');
      csvContent = 'Order Number,Farmer,Phone,Laborer,Auth DAP,Auth Urea,Dist DAP,Dist Urea,Status,Scheduled Date,Ack Signed\n';
      orders.forEach((o) => {
        csvContent += `"${o.orderNumber}","${o.farmer?.name || ''}","${o.farmer?.phone || ''}","${o.assignedLaborer?.name || ''}",${o.authorizedDap},${o.authorizedUrea},${o.distributedDap},${o.distributedUrea},"${o.status}","${new Date(o.scheduledDate).toISOString()}","${o.farmerAcknowledgmentSigned}"\n`;
      });
    } else if (type === 'financial') {
      const payments = await Payment.find().populate('farmer', 'name');
      csvContent = 'Payment Reference,Farmer,Amount (ETB),Method,Status,Date\n';
      payments.forEach((p) => {
        csvContent += `"${p.paymentReference}","${p.farmer?.name || ''}",${p.amountPaid},"${p.paymentMethod}","${p.verificationStatus}","${new Date(p.paymentDate).toISOString()}"\n`;
      });
    } else {
      // Default to inventory ledger
      const txns = await InventoryTransaction.find().sort({ createdAt: -1 });
      csvContent = 'Transaction Number,Product,Type,Quantity (Qtl),Prev Balance,New Balance,Reference,Date,Notes\n';
      txns.forEach((t) => {
        csvContent += `"${t.transactionNumber}","${t.productCode}","${t.transactionType}",${t.quantityQuintals},${t.previousStockBalance},${t.newStockBalance},"${t.referenceId}","${new Date(t.createdAt).toISOString()}","${t.notes.replace(/"/g, '""')}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryReport,
  getDistributionReport,
  getFinancialReport,
  exportReportCsv,
};
