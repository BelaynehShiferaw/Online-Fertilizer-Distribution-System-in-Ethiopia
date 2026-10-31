const FertilizerProduct = require('../models/FertilizerProduct');
const InventoryTransaction = require('../models/InventoryTransaction');

class InventoryService {
  /**
   * Receive inbound shipment from supplier/importer
   */
  static async receiveShipment({
    productCode,
    quantityQuintals,
    purchaseCostPerQuintal,
    supplier,
    referenceId,
    performedBy,
    notes,
  }) {
    if (quantityQuintals <= 0) {
      throw new Error('Received quantity must be greater than zero.');
    }

    const product = await FertilizerProduct.findOne({ code: productCode.toUpperCase() });
    if (!product) {
      throw new Error(`Fertilizer product '${productCode}' not found.`);
    }

    const previousStock = product.currentStockQuintals;
    const newStock = previousStock + Number(quantityQuintals);

    product.currentStockQuintals = newStock;
    await product.save();

    const transactionNumber = `TXN-IN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transaction = await InventoryTransaction.create({
      transactionNumber,
      product: product._id,
      productCode: product.code,
      transactionType: 'shipment_received',
      quantityQuintals: Number(quantityQuintals),
      previousStockBalance: previousStock,
      newStockBalance: newStock,
      referenceType: 'shipment',
      referenceId: referenceId || transactionNumber,
      supplierOrReceiver: supplier || 'Ethiopian Agricultural Businesses Corporation (EABC)',
      purchaseCostPerQuintal: Number(purchaseCostPerQuintal) || 0,
      totalCost: (Number(purchaseCostPerQuintal) || 0) * Number(quantityQuintals),
      performedBy,
      notes: notes || 'Inbound shipment registered successfully',
    });

    return { product, transaction };
  }

  /**
   * Reserve stock when payment is verified
   */
  static async reserveStock({ productCode, quantityQuintals }) {
    if (!quantityQuintals || quantityQuintals <= 0) return;

    const product = await FertilizerProduct.findOne({ code: productCode.toUpperCase() });
    if (!product) {
      throw new Error(`Fertilizer product '${productCode}' not found.`);
    }

    const available = product.currentStockQuintals - product.reservedQuintals;
    if (available < quantityQuintals) {
      throw new Error(
        `Insufficient stock for ${productCode}. Available: ${available.toFixed(2)} Qtl, Requested: ${quantityQuintals} Qtl.`
      );
    }

    product.reservedQuintals += Number(quantityQuintals);
    await product.save();
    return product;
  }

  /**
   * Release reservation if request is cancelled or rejected
   */
  static async releaseReservation({ productCode, quantityQuintals }) {
    if (!quantityQuintals || quantityQuintals <= 0) return;

    const product = await FertilizerProduct.findOne({ code: productCode.toUpperCase() });
    if (!product) return;

    product.reservedQuintals = Math.max(0, product.reservedQuintals - Number(quantityQuintals));
    await product.save();
    return product;
  }

  /**
   * Deduct stock upon laborer fulfillment
   * Strictly enforces: exactly once deduction, prevents negative inventory
   */
  static async deductDistributionStock({ order, performedBy }) {
    if (order.stockDeducted) {
      throw new Error('Integrity Warning: Inventory has already been deducted for this distribution order.');
    }

    const { authorizedDap, authorizedUrea, distributedDap, distributedUrea } = order;
    const actualDap = distributedDap !== undefined && distributedDap !== null ? distributedDap : authorizedDap;
    const actualUrea = distributedUrea !== undefined && distributedUrea !== null ? distributedUrea : authorizedUrea;

    const transactions = [];

    // Process DAP deduction
    if (actualDap > 0) {
      const dapProduct = await FertilizerProduct.findOne({ code: 'DAP' });
      if (!dapProduct) throw new Error('DAP product configuration missing.');
      if (dapProduct.currentStockQuintals < actualDap) {
        throw new Error(
          `Insufficient DAP physical stock! In depot: ${dapProduct.currentStockQuintals} Qtl, needed: ${actualDap} Qtl.`
        );
      }

      const prevDap = dapProduct.currentStockQuintals;
      dapProduct.currentStockQuintals = Math.max(0, prevDap - actualDap);
      // Release reservation
      dapProduct.reservedQuintals = Math.max(0, dapProduct.reservedQuintals - authorizedDap);
      await dapProduct.save();

      const dapTxn = await InventoryTransaction.create({
        transactionNumber: `TXN-DIST-DAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: dapProduct._id,
        productCode: 'DAP',
        transactionType: 'distribution_dispatch',
        quantityQuintals: -actualDap,
        previousStockBalance: prevDap,
        newStockBalance: dapProduct.currentStockQuintals,
        referenceType: 'distribution_order',
        referenceId: order.orderNumber,
        supplierOrReceiver: `Farmer Order #${order.orderNumber}`,
        performedBy,
        notes: `Dispatched ${actualDap} Qtl DAP to farmer`,
      });
      transactions.push(dapTxn);
    }

    // Process Urea deduction
    if (actualUrea > 0) {
      const ureaProduct = await FertilizerProduct.findOne({ code: 'UREA' });
      if (!ureaProduct) throw new Error('UREA product configuration missing.');
      if (ureaProduct.currentStockQuintals < actualUrea) {
        throw new Error(
          `Insufficient Urea physical stock! In depot: ${ureaProduct.currentStockQuintals} Qtl, needed: ${actualUrea} Qtl.`
        );
      }

      const prevUrea = ureaProduct.currentStockQuintals;
      ureaProduct.currentStockQuintals = Math.max(0, prevUrea - actualUrea);
      // Release reservation
      ureaProduct.reservedQuintals = Math.max(0, ureaProduct.reservedQuintals - authorizedUrea);
      await ureaProduct.save();

      const ureaTxn = await InventoryTransaction.create({
        transactionNumber: `TXN-DIST-UREA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        product: ureaProduct._id,
        productCode: 'UREA',
        transactionType: 'distribution_dispatch',
        quantityQuintals: -actualUrea,
        previousStockBalance: prevUrea,
        newStockBalance: ureaProduct.currentStockQuintals,
        referenceType: 'distribution_order',
        referenceId: order.orderNumber,
        supplierOrReceiver: `Farmer Order #${order.orderNumber}`,
        performedBy,
        notes: `Dispatched ${actualUrea} Qtl Urea to farmer`,
      });
      transactions.push(ureaTxn);
    }

    order.stockDeducted = true;
    await order.save();

    return { transactions, order };
  }

  /**
   * Record damaged bags or stock discrepancy
   */
  static async recordDamageAdjustment({ productCode, quantityQuintals, reason, performedBy }) {
    if (quantityQuintals <= 0) {
      throw new Error('Damaged quantity must be greater than zero.');
    }

    const product = await FertilizerProduct.findOne({ code: productCode.toUpperCase() });
    if (!product) throw new Error(`Product ${productCode} not found.`);

    if (product.currentStockQuintals < quantityQuintals) {
      throw new Error(`Cannot adjust more than available stock (${product.currentStockQuintals} Qtl).`);
    }

    const previousStock = product.currentStockQuintals;
    product.currentStockQuintals -= Number(quantityQuintals);
    await product.save();

    const transaction = await InventoryTransaction.create({
      transactionNumber: `TXN-DMG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product: product._id,
      productCode: product.code,
      transactionType: 'damage_adjustment',
      quantityQuintals: -Number(quantityQuintals),
      previousStockBalance: previousStock,
      newStockBalance: product.currentStockQuintals,
      referenceType: 'damage_report',
      referenceId: `INCIDENT-${Date.now()}`,
      performedBy,
      notes: reason || 'Warehouse torn bags or moisture damage reported',
    });

    return { product, transaction };
  }
}

module.exports = InventoryService;
