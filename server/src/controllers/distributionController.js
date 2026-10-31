const DistributionOrder = require('../models/DistributionOrder');
const FertilizerRequest = require('../models/FertilizerRequest');
const User = require('../models/User');
const InventoryService = require('../services/inventoryService');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

// @desc Create distribution order (Office Manager)
// @route POST /api/v1/distribution-orders
const createDistributionOrder = async (req, res, next) => {
  try {
    const { requestId, laborerId, distributionLocation, scheduledDate } = req.body;

    if (!requestId || !laborerId) {
      return res.status(400).json({ success: false, message: 'Request ID and assigned laborer are required.' });
    }

    const request = await FertilizerRequest.findById(requestId).populate('farmer');
    if (!request) return res.status(404).json({ success: false, message: 'Fertilizer request not found.' });

    if (request.status !== 'ready_for_distribution' && request.status !== 'payment_verified') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispatch distribution order: Request is in status '${request.status}'. Payment must be verified first.`,
      });
    }

    const laborer = await User.findOne({ _id: laborerId, role: 'laborer' });
    if (!laborer) {
      return res.status(400).json({ success: false, message: 'Designated user is not a valid active laborer.' });
    }

    const orderNumber = `DIST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await DistributionOrder.create({
      orderNumber,
      request: request._id,
      farmer: request.farmer._id,
      assignedLaborer: laborer._id,
      authorizedDap: request.approvedDap,
      authorizedUrea: request.approvedUrea,
      distributionLocation: distributionLocation || 'Woreda Central Distribution Depot',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      status: 'pending',
    });

    // Notify assigned laborer
    await NotificationService.send({
      recipient: laborer._id,
      titleEn: `New Distribution Task Assigned: #${orderNumber}`,
      titleAm: `አዲስ የማከፋፈል ሥራ ተመድቧል: #${orderNumber}`,
      messageEn: `Order #${orderNumber} for farmer ${request.farmer.name} (${request.approvedDap} Qtl DAP, ${request.approvedUrea} Qtl Urea).`,
      messageAm: `ትዕዛዝ #${orderNumber} ለአርሶ አደር ${request.farmer.name} (${request.approvedDap} ኩ/ል ዳፕ፣ ${request.approvedUrea} ኩ/ል ዩሪያ) ተመድቦልዎታል።`,
      type: 'distribution_schedule',
      actionUrl: `/laborer/tasks`,
    });

    // Notify farmer of pickup schedule
    await NotificationService.send({
      recipient: request.farmer._id,
      titleEn: `Fertilizer Distribution Ready: Order #${orderNumber}`,
      titleAm: `የማዳበሪያ ማከፋፈያ ዝግጁ ነው: ትዕዛዝ #${orderNumber}`,
      messageEn: `Your fertilizer order #${orderNumber} is scheduled for pickup at ${distributionLocation || 'Woreda Central Distribution Depot'}.`,
      messageAm: `የማዳበሪያ ትዕዛዝዎ #${orderNumber} በ ${distributionLocation || 'የወረዳው ዋና ማከፋፈያ መጋዘን'} ለመቀበል ዝግጁ ሆኗል።`,
      type: 'distribution_schedule',
      actionUrl: `/farmer/orders`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'DISTRIBUTION_ORDER_CREATED',
      entityType: 'DistributionOrder',
      entityId: order._id,
      ipAddress: req.ip,
      details: { orderNumber, assignedLaborer: laborer.name },
    });

    res.status(201).json({ success: true, message: 'Distribution order created and assigned to laborer.', order });
  } catch (error) {
    next(error);
  }
};

// @desc Get distribution orders
// @route GET /api/v1/distribution-orders
const getDistributionOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (req.user.role === 'laborer') {
      query.assignedLaborer = req.user._id;
    } else if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    }

    if (status) query.status = status;

    const orders = await DistributionOrder.find(query)
      .populate('farmer', 'name email phone preferredLanguage')
      .populate('assignedLaborer', 'name phone role')
      .populate('request', 'requestNumber crop cultivatedArea')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc Laborer executes and completes distribution
// @route POST /api/v1/distribution-orders/:id/complete
const completeDistribution = async (req, res, next) => {
  try {
    const { distributedDap, distributedUrea, farmerAcknowledgmentSigned, farmerSignatureName, laborerNotes, damagedBagsReported } = req.body;

    const order = await DistributionOrder.findById(req.params.id)
      .populate('farmer')
      .populate('request');

    if (!order) return res.status(404).json({ success: false, message: 'Distribution order not found.' });

    // Enforce role permission
    if (req.user.role === 'laborer' && order.assignedLaborer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: this order is assigned to another laborer.' });
    }

    if (order.status === 'completed' && order.stockDeducted) {
      return res.status(400).json({ success: false, message: 'This distribution order has already been finalized.' });
    }

    const actualDap = distributedDap !== undefined ? Number(distributedDap) : order.authorizedDap;
    const actualUrea = distributedUrea !== undefined ? Number(distributedUrea) : order.authorizedUrea;

    // Validate cannot distribute more than authorized
    if (actualDap > order.authorizedDap || actualUrea > order.authorizedUrea) {
      return res.status(400).json({
        success: false,
        message: `Laborer rule violation: Distributed quantities (${actualDap} DAP, ${actualUrea} Urea) cannot exceed authorized quotas (${order.authorizedDap} DAP, ${order.authorizedUrea} Urea).`,
      });
    }

    // Farmer signature or acknowledgment confirmation check
    if (!farmerAcknowledgmentSigned) {
      return res.status(400).json({
        success: false,
        message: 'Farmer acknowledgment or signature confirmation is required to release fertilizer.',
      });
    }

    order.distributedDap = actualDap;
    order.distributedUrea = actualUrea;
    order.farmerAcknowledgmentSigned = true;
    order.farmerSignatureName = farmerSignatureName || order.farmer.name;
    order.distributionDate = new Date();
    order.laborerNotes = laborerNotes || '';
    order.damagedBagsReported = Number(damagedBagsReported) || 0;

    const isFullyFulfilled = actualDap >= order.authorizedDap && actualUrea >= order.authorizedUrea;
    order.status = isFullyFulfilled ? 'completed' : 'partially_fulfilled';

    // Atomic stock deduction with duplicate prevention
    await InventoryService.deductDistributionStock({
      order,
      performedBy: req.user._id,
    });

    // Update Request status
    const request = await FertilizerRequest.findById(order.request._id);
    if (request) {
      request.status = isFullyFulfilled ? 'completed' : 'partially_distributed';
      request.history.push({
        action: isFullyFulfilled ? 'DISTRIBUTION_COMPLETED' : 'DISTRIBUTION_PARTIAL',
        actor: req.user._id,
        actorRole: req.user.role,
        notes: `Distributed ${actualDap} Qtl DAP and ${actualUrea} Qtl Urea. Signed by: ${order.farmerSignatureName}`,
        newStatus: request.status,
      });
      await request.save();
    }

    // Send bilingual completion confirmation notification to farmer
    await NotificationService.send({
      recipient: order.farmer._id,
      titleEn: `Fertilizer Handed Over: Order #${order.orderNumber}`,
      titleAm: `ማዳበሪያው ተረክቧል: ትዕዛዝ #${order.orderNumber}`,
      messageEn: `Confirmation: You received ${actualDap} Qtl DAP and ${actualUrea} Qtl Urea. Thank you for using OFDMS!`,
      messageAm: `ማረጋገጫ: ${actualDap} ኩንታል ዳፕ እና ${actualUrea} ኩንታል ዩሪያ ተረክበዋል። ኦኤፍዲኤምኤስን ስለተጠቀሙ እናመሰግናለን!`,
      type: 'distribution_complete',
      actionUrl: `/farmer/orders`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'DISTRIBUTION_ORDER_FULFILLED',
      entityType: 'DistributionOrder',
      entityId: order._id,
      ipAddress: req.ip,
      details: { actualDap, actualUrea, isFullyFulfilled, farmerSignatureName: order.farmerSignatureName },
    });

    res.status(200).json({
      success: true,
      message: `Distribution recorded successfully. Inventory updated and ledger generated.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDistributionOrder,
  getDistributionOrders,
  completeDistribution,
};
