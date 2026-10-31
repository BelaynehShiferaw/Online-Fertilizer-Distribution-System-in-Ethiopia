const FertilizerProduct = require('../models/FertilizerProduct');
const InventoryTransaction = require('../models/InventoryTransaction');
const InventoryService = require('../services/inventoryService');
const AuditService = require('../services/auditService');

// @desc Get live stock balances
// @route GET /api/v1/inventory
const getInventoryStatus = async (req, res, next) => {
  try {
    const products = await FertilizerProduct.find({ active: true });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc Get ledger transactions
// @route GET /api/v1/inventory/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { productCode, type, startDate, endDate } = req.query;
    const query = {};

    if (productCode) query.productCode = productCode.toUpperCase();
    if (type) query.transactionType = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await InventoryTransaction.find(query)
      .populate('performedBy', 'name role')
      .populate('product', 'nameEn nameAm unit')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    next(error);
  }
};

// @desc Receive inbound shipment (Office Manager)
// @route POST /api/v1/inventory/receipts
const receiveShipment = async (req, res, next) => {
  try {
    const { productCode, quantityQuintals, purchaseCostPerQuintal, supplier, referenceId, notes } = req.body;

    if (!productCode || !quantityQuintals) {
      return res.status(400).json({ success: false, message: 'Product code and quantity in quintals are required.' });
    }

    const result = await InventoryService.receiveShipment({
      productCode,
      quantityQuintals,
      purchaseCostPerQuintal,
      supplier,
      referenceId,
      performedBy: req.user._id,
      notes,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'INVENTORY_SHIPMENT_RECEIVED',
      entityType: 'InventoryTransaction',
      entityId: result.transaction._id,
      ipAddress: req.ip,
      details: { productCode, quantityQuintals, purchaseCostPerQuintal },
    });

    res.status(201).json({
      success: true,
      message: `Shipment of ${quantityQuintals} Qtl ${productCode} recorded successfully.`,
      product: result.product,
      transaction: result.transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Report damaged stock or discrepancy (Laborer or Office Manager)
// @route POST /api/v1/inventory/damage
const reportDamage = async (req, res, next) => {
  try {
    const { productCode, quantityQuintals, reason } = req.body;

    if (!productCode || !quantityQuintals) {
      return res.status(400).json({ success: false, message: 'Product code and damaged quantity are required.' });
    }

    const result = await InventoryService.recordDamageAdjustment({
      productCode,
      quantityQuintals,
      reason,
      performedBy: req.user._id,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'INVENTORY_DAMAGE_REPORTED',
      entityType: 'InventoryTransaction',
      entityId: result.transaction._id,
      ipAddress: req.ip,
      details: { productCode, quantityQuintals, reason },
    });

    res.status(200).json({
      success: true,
      message: 'Damaged stock adjustment recorded successfully.',
      product: result.product,
      transaction: result.transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventoryStatus,
  getTransactions,
  receiveShipment,
  reportDamage,
};
