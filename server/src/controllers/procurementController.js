const ProcurementRequest = require('../models/ProcurementRequest');
const FertilizerRequest = require('../models/FertilizerRequest');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

// @desc Get consolidated demand calculation from approved farmer requests (Office Manager)
// @route GET /api/v1/procurement-requests/consolidated-demand
const getConsolidatedDemand = async (req, res, next) => {
  try {
    // Requests that are approved by expert
    const approvedRequests = await FertilizerRequest.find({
      status: { $in: ['approved', 'awaiting_payment', 'payment_under_verification', 'payment_verified', 'ready_for_distribution'] },
    }).populate('crop', 'nameEn nameAm code');

    let totalDap = 0;
    let totalUrea = 0;
    const cropBreakdown = {};

    approvedRequests.forEach((reqItem) => {
      const dap = reqItem.approvedDap || reqItem.requestedDap || 0;
      const urea = reqItem.approvedUrea || reqItem.requestedUrea || 0;
      totalDap += dap;
      totalUrea += urea;

      const cropName = reqItem.crop ? reqItem.crop.nameEn : 'Unknown';
      if (!cropBreakdown[cropName]) {
        cropBreakdown[cropName] = { dap: 0, urea: 0, count: 0 };
      }
      cropBreakdown[cropName].dap += dap;
      cropBreakdown[cropName].urea += urea;
      cropBreakdown[cropName].count += 1;
    });

    res.status(200).json({
      success: true,
      totalRequests: approvedRequests.length,
      totalDapQuintals: totalDap,
      totalUreaQuintals: totalUrea,
      cropBreakdown,
      approvedRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit consolidated procurement request to Manager (Office Manager)
// @route POST /api/v1/procurement-requests
const createProcurementRequest = async (req, res, next) => {
  try {
    const { dapQuantity, ureaQuantity, estimatedCost, justification, includedRequestIds } = req.body;

    if (!dapQuantity && !ureaQuantity) {
      return res.status(400).json({ success: false, message: 'Please specify DAP or Urea quantity.' });
    }

    const procurementNumber = `PROC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const procurement = await ProcurementRequest.create({
      procurementNumber,
      requestedBy: req.user._id,
      dapQuantity: Number(dapQuantity) || 0,
      ureaQuantity: Number(ureaQuantity) || 0,
      estimatedCost: Number(estimatedCost) || 0,
      justification: justification || 'Consolidated demand for seasonal planting',
      includedRequests: includedRequestIds || [],
    });

    // Notify Manager
    await NotificationService.broadcastToRole('manager', {
      titleEn: `New Procurement Request #${procurementNumber}`,
      titleAm: `አዲስ የግዢ ጥያቄ ቁጥር #${procurementNumber}`,
      messageEn: `Office Manager requested procurement: ${dapQuantity} Qtl DAP, ${ureaQuantity} Qtl Urea. Est. Cost: ${estimatedCost} ETB.`,
      messageAm: `የቢሮ ሥራ አስኪያጅ የግዢ ጥያቄ አቅርበዋል: ${dapQuantity} ኩ/ል ዳፕ፣ ${ureaQuantity} ኩ/ል ዩሪያ። ግምት: ${estimatedCost} ብር።`,
      type: 'procurement_update',
      actionUrl: `/manager/procurement`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'PROCUREMENT_REQUEST_SUBMITTED',
      entityType: 'ProcurementRequest',
      entityId: procurement._id,
      ipAddress: req.ip,
      details: { dapQuantity, ureaQuantity, estimatedCost },
    });

    res.status(201).json({ success: true, message: 'Procurement request submitted to Manager.', procurement });
  } catch (error) {
    next(error);
  }
};

// @desc Get all procurement requests
// @route GET /api/v1/procurement-requests
const getProcurementRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const procurements = await ProcurementRequest.find(query)
      .populate('requestedBy', 'name role email')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: procurements.length, procurements });
  } catch (error) {
    next(error);
  }
};

// @desc Manager decision on procurement request (Approve / Reject / Revision)
// @route POST /api/v1/procurement-requests/:id/decision
const decisionProcurementRequest = async (req, res, next) => {
  try {
    const { decision, managerNotes } = req.body;

    if (!['approved', 'rejected', 'revision_requested'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision.' });
    }

    const procurement = await ProcurementRequest.findById(req.params.id);
    if (!procurement) return res.status(404).json({ success: false, message: 'Procurement request not found.' });

    procurement.status = decision;
    procurement.reviewedBy = req.user._id;
    procurement.managerNotes = managerNotes || '';
    procurement.decisionDate = new Date();
    await procurement.save();

    // Notify Office Manager
    await NotificationService.send({
      recipient: procurement.requestedBy,
      titleEn: `Procurement Request #${procurement.procurementNumber} ${decision.toUpperCase()}`,
      titleAm: `የግዢ ጥያቄ #${procurement.procurementNumber} ${decision === 'approved' ? 'ፀድቋል' : decision === 'rejected' ? 'ውድቅ ተደርጓል' : 'እንዲሻሻል ተመልሷል'}`,
      messageEn: `Manager decision on procurement #${procurement.procurementNumber}: ${decision}. Notes: ${managerNotes || 'None'}`,
      messageAm: `የሥራ አስኪያጅ ውሳኔ በግዢ #${procurement.procurementNumber}: ${decision === 'approved' ? 'ፀድቋል' : 'ተከልሷል'}። ማስታወሻ: ${managerNotes || 'የለም'}`,
      type: 'procurement_update',
      actionUrl: `/office/procurement`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: `PROCUREMENT_${decision.toUpperCase()}`,
      entityType: 'ProcurementRequest',
      entityId: procurement._id,
      ipAddress: req.ip,
      details: { decision, managerNotes },
    });

    res.status(200).json({ success: true, message: `Procurement request ${decision}.`, procurement });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConsolidatedDemand,
  createProcurementRequest,
  getProcurementRequests,
  decisionProcurementRequest,
};
