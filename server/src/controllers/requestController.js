const FertilizerRequest = require('../models/FertilizerRequest');
const FarmerProfile = require('../models/FarmerProfile');
const FarmPlot = require('../models/FarmPlot');
const Crop = require('../models/Crop');
const FertilizerPrice = require('../models/FertilizerPrice');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

// @desc Create a new fertilizer request (Farmer)
// @route POST /api/v1/fertilizer-requests
const createRequest = async (req, res, next) => {
  try {
    const { plotId, cropId, cultivatedArea, requestedDap, requestedUrea, isDraft, isAdditional, originalRequestId } = req.body;

    if (!plotId || !cropId || !cultivatedArea) {
      return res.status(400).json({ success: false, message: 'Plot, Crop, and Cultivated Area are required.' });
    }

    const plot = await FarmPlot.findById(plotId);
    if (!plot || plot.farmer.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid plot selected or ownership mismatch.' });
    }

    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(400).json({ success: false, message: 'Selected crop not found.' });
    }

    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id });

    // Fetch latest prices for estimation
    const dapPriceDoc = await FertilizerPrice.findOne({ productCode: 'DAP' }).sort({ effectiveDate: -1 });
    const ureaPriceDoc = await FertilizerPrice.findOne({ productCode: 'UREA' }).sort({ effectiveDate: -1 });

    const dapPrice = dapPriceDoc ? dapPriceDoc.pricePerQuintal : 4500;
    const ureaPrice = ureaPriceDoc ? ureaPriceDoc.pricePerQuintal : 4000;

    const dapQty = Number(requestedDap) || 0;
    const ureaQty = Number(requestedUrea) || 0;
    const estimatedCost = dapQty * dapPrice + ureaQty * ureaPrice;

    const requestNumber = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const status = isDraft ? 'draft' : 'submitted';

    const newRequest = await FertilizerRequest.create({
      requestNumber,
      farmer: req.user._id,
      farmerProfile: farmerProfile ? farmerProfile._id : null,
      plot: plot._id,
      crop: crop._id,
      cultivatedArea: Number(cultivatedArea),
      requestedDap: dapQty,
      requestedUrea: ureaQty,
      dapPricePerQuintal: dapPrice,
      ureaPricePerQuintal: ureaPrice,
      totalAmountDue: estimatedCost,
      status,
      isAdditionalRequest: Boolean(isAdditional),
      originalRequestId: originalRequestId || null,
      history: [
        {
          action: isDraft ? 'DRAFT_CREATED' : 'REQUEST_SUBMITTED',
          actor: req.user._id,
          actorRole: req.user.role,
          notes: isDraft ? 'Saved request as draft' : 'Submitted request for agricultural review',
          newStatus: status,
        },
      ],
    });

    // Notify Agricultural Experts if submitted directly
    if (!isDraft) {
      await NotificationService.broadcastToRole('agricultural_expert', {
        titleEn: `New Fertilizer Request #${requestNumber}`,
        titleAm: `አዲስ የማዳበሪያ ጥያቄ ቁጥር #${requestNumber}`,
        messageEn: `Farmer ${req.user.name} submitted a fertilizer request for ${cultivatedArea} ha of ${crop.nameEn}.`,
        messageAm: `አርሶ አደር ${req.user.name} ለ ${cultivatedArea} ሄክታር ${crop.nameAm} የማዳበሪያ ጥያቄ አቅርበዋል።`,
        type: 'agricultural_review',
        actionUrl: `/expert/reviews`,
      });
    }

    res.status(201).json({
      success: true,
      message: isDraft ? 'Request draft saved.' : 'Fertilizer request submitted for agricultural review.',
      request: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get fertilizer requests
// @route GET /api/v1/fertilizer-requests
const getRequests = async (req, res, next) => {
  try {
    const { status, crop, search } = req.query;
    const query = {};

    // Privacy security rule: Scoped strictly to authenticated farmer
    if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    }

    if (status) query.status = status;
    if (crop) query.crop = crop;

    const requests = await FertilizerRequest.find(query)
      .populate('farmer', 'name email phone preferredLanguage')
      .populate('farmerProfile')
      .populate('plot')
      .populate('crop')
      .populate('reviewedByExpert', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc Get single request by ID
// @route GET /api/v1/fertilizer-requests/:id
const getRequestById = async (req, res, next) => {
  try {
    const request = await FertilizerRequest.findById(req.params.id)
      .populate('farmer', 'name email phone preferredLanguage')
      .populate('farmerProfile')
      .populate('plot')
      .populate('crop')
      .populate('reviewedByExpert', 'name role')
      .populate('history.actor', 'name role');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Role check
    if (req.user.role === 'farmer' && request.farmer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this request.' });
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

// @desc Submit a draft request (Farmer)
// @route POST /api/v1/fertilizer-requests/:id/submit
const submitDraftRequest = async (req, res, next) => {
  try {
    const request = await FertilizerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    if (request.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to submit this request.' });
    }

    if (request.status !== 'draft' && request.status !== 'changes_requested') {
      return res.status(400).json({ success: false, message: `Cannot submit request in status '${request.status}'` });
    }

    request.status = 'submitted';
    request.history.push({
      action: 'SUBMITTED',
      actor: req.user._id,
      actorRole: req.user.role,
      notes: 'Request submitted for agricultural review',
      newStatus: 'submitted',
    });

    await request.save();

    await NotificationService.broadcastToRole('agricultural_expert', {
      titleEn: `Submitted Fertilizer Request #${request.requestNumber}`,
      titleAm: `የቀረበ የማዳበሪያ ጥያቄ #${request.requestNumber}`,
      messageEn: `Request #${request.requestNumber} is ready for expert agronomic review.`,
      messageAm: `የማዳበሪያ ጥያቄ ቁጥር #${request.requestNumber} ለባለሙያ ግምገማ ዝግጁ ነው።`,
      type: 'agricultural_review',
      actionUrl: `/expert/reviews`,
    });

    res.status(200).json({ success: true, message: 'Request submitted successfully.', request });
  } catch (error) {
    next(error);
  }
};

// @desc Agricultural Expert review action (Approve / Reject / Request Corrections)
// @route POST /api/v1/fertilizer-requests/:id/review
const reviewRequestByExpert = async (req, res, next) => {
  try {
    const { decision, approvedDap, approvedUrea, expertNotes } = req.body;

    if (!['approved', 'rejected', 'changes_requested'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision. Must be approved, rejected, or changes_requested.' });
    }

    // Mandatory written explanation when rejecting or requesting changes
    if ((decision === 'rejected' || decision === 'changes_requested') && (!expertNotes || !expertNotes.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A written explanation is mandatory when rejecting or requesting changes to a fertilizer request.',
      });
    }

    const request = await FertilizerRequest.findById(req.params.id).populate('crop');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    const prevStatus = request.status;
    request.status = decision === 'approved' ? 'awaiting_payment' : decision;
    request.reviewedByExpert = req.user._id;
    request.expertNotes = expertNotes || '';
    request.expertDecisionDate = new Date();

    if (decision === 'approved') {
      request.approvedDap = Number(approvedDap) !== undefined ? Number(approvedDap) : request.requestedDap;
      request.approvedUrea = Number(approvedUrea) !== undefined ? Number(approvedUrea) : request.requestedUrea;

      // Lock current prices
      const dapPriceDoc = await FertilizerPrice.findOne({ productCode: 'DAP' }).sort({ effectiveDate: -1 });
      const ureaPriceDoc = await FertilizerPrice.findOne({ productCode: 'UREA' }).sort({ effectiveDate: -1 });

      const dapPrice = dapPriceDoc ? dapPriceDoc.pricePerQuintal : 4500;
      const ureaPrice = ureaPriceDoc ? ureaPriceDoc.pricePerQuintal : 4000;

      request.dapPricePerQuintal = dapPrice;
      request.ureaPricePerQuintal = ureaPrice;
      request.totalAmountDue = request.approvedDap * dapPrice + request.approvedUrea * ureaPrice;
    }

    request.history.push({
      action: `EXPERT_${decision.toUpperCase()}`,
      actor: req.user._id,
      actorRole: req.user.role,
      notes: expertNotes || `Request ${decision} by agricultural expert`,
      previousStatus: prevStatus,
      newStatus: request.status,
    });

    await request.save();

    // Notify farmer
    const titleEn = decision === 'approved' ? 'Fertilizer Request Approved' : decision === 'rejected' ? 'Fertilizer Request Rejected' : 'Corrections Requested on Request';
    const titleAm = decision === 'approved' ? 'የማዳበሪያ ጥያቄዎ ፀድቋል' : decision === 'rejected' ? 'የማዳበሪያ ጥያቄዎ ውድቅ ተደርጓል' : 'በጥያቄዎ ላይ ማስተካከያ ተጠይቋል';

    const msgEn = decision === 'approved'
      ? `Your request #${request.requestNumber} was approved for ${request.approvedDap} Qtl DAP and ${request.approvedUrea} Qtl Urea. Amount due: ${request.totalAmountDue} ETB.`
      : `Request #${request.requestNumber}: ${expertNotes}`;

    const msgAm = decision === 'approved'
      ? `የማዳበሪያ ጥያቄ #${request.requestNumber} ለ ${request.approvedDap} ኩንታል ዳፕ እና ${request.approvedUrea} ኩንታል ዩሪያ ፀድቋል። የሚከፈል: ${request.totalAmountDue} ብር።`
      : `ጥያቄ #${request.requestNumber}: ${expertNotes}`;

    await NotificationService.send({
      recipient: request.farmer,
      titleEn,
      titleAm,
      messageEn: msgEn,
      messageAm: msgAm,
      type: 'agricultural_review',
      actionUrl: `/farmer/requests/${request._id}`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: `REQUEST_REVIEWED_${decision.toUpperCase()}`,
      entityType: 'FertilizerRequest',
      entityId: request._id,
      ipAddress: req.ip,
      details: { decision, approvedDap: request.approvedDap, approvedUrea: request.approvedUrea },
    });

    res.status(200).json({
      success: true,
      message: `Request successfully ${decision}.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  submitDraftRequest,
  reviewRequestByExpert,
};
