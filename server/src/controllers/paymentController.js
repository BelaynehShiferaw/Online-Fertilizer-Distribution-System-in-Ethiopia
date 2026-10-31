const path = require('path');
const fs = require('fs');
const Payment = require('../models/Payment');
const FertilizerRequest = require('../models/FertilizerRequest');
const InventoryService = require('../services/inventoryService');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

// @desc Submit payment with receipt (Farmer)
// @route POST /api/v1/payments
const submitPayment = async (req, res, next) => {
  try {
    const { requestId, paymentReference, amountPaid, paymentMethod, paymentDate } = req.body;

    if (!requestId || !paymentReference || !amountPaid) {
      return res.status(400).json({ success: false, message: 'Request ID, payment reference, and amount paid are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Payment receipt document or photo upload is required.' });
    }

    // Check duplicate payment reference
    const cleanRef = paymentReference.trim().toUpperCase();
    const existingRef = await Payment.findOne({ paymentReference: cleanRef });
    if (existingRef) {
      // Remove uploaded file if duplicate
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: `Duplicate Payment Reference: A receipt with reference '${cleanRef}' has already been registered in the system.`,
      });
    }

    const request = await FertilizerRequest.findById(requestId);
    if (!request) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Fertilizer request not found.' });
    }

    if (request.farmer.toString() !== req.user._id.toString()) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Unauthorized: you can only submit payments for your own requests.' });
    }

    const receiptUrl = `/uploads/receipts/${req.file.filename}`;

    const payment = await Payment.create({
      paymentReference: cleanRef,
      farmer: req.user._id,
      request: request._id,
      amountPaid: Number(amountPaid),
      currency: 'ETB',
      paymentMethod: paymentMethod || 'commercial_bank_of_ethiopia',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      receiptUrl,
      receiptOriginalName: req.file.originalname,
      receiptMimeType: req.file.mimetype,
      verificationStatus: 'pending',
    });

    // Advance request state
    request.status = 'payment_under_verification';
    request.history.push({
      action: 'PAYMENT_SUBMITTED',
      actor: req.user._id,
      actorRole: req.user.role,
      notes: `Submitted payment receipt with reference ${cleanRef} for ${amountPaid} ETB`,
      newStatus: 'payment_under_verification',
    });
    await request.save();

    // Notify Office Manager
    await NotificationService.broadcastToRole('office_manager', {
      titleEn: `Payment Submitted: Ref #${cleanRef}`,
      titleAm: `ክፍያ ተፈጽሟል: የማመሳከሪያ ቁጥር #${cleanRef}`,
      messageEn: `Farmer ${req.user.name} uploaded receipt of ${amountPaid} ETB for request #${request.requestNumber}.`,
      messageAm: `አርሶ አደር ${req.user.name} ለጥያቄ #${request.requestNumber} የ ${amountPaid} ብር ደረሰኝ አስገብተዋል።`,
      type: 'payment_status',
      actionUrl: `/office/payments`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'PAYMENT_RECEIPT_SUBMITTED',
      entityType: 'Payment',
      entityId: payment._id,
      ipAddress: req.ip,
      details: { paymentReference: cleanRef, amountPaid },
    });

    res.status(201).json({
      success: true,
      message: 'Payment receipt uploaded successfully and is now pending verification.',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get payments
// @route GET /api/v1/payments
const getPayments = async (req, res, next) => {
  try {
    const { status, requestId } = req.query;
    const query = {};

    if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    }

    if (status) query.verificationStatus = status;
    if (requestId) query.request = requestId;

    const payments = await Payment.find(query)
      .populate('farmer', 'name email phone preferredLanguage')
      .populate('request', 'requestNumber approvedDap approvedUrea totalAmountDue')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    next(error);
  }
};

// @desc Verify or reject payment (Office Manager only)
// @route POST /api/v1/payments/:id/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { status, rejectionReason, notes } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either verified or rejected.' });
    }

    if (status === 'rejected' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({ success: false, message: 'A rejection reason is mandatory when declining a payment.' });
    }

    const payment = await Payment.findById(req.params.id).populate('request');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found.' });

    if (payment.verificationStatus === 'verified') {
      return res.status(400).json({ success: false, message: 'This payment has already been verified and locked.' });
    }

    payment.verificationStatus = status;
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    payment.rejectionReason = status === 'rejected' ? rejectionReason : '';
    payment.notes = notes || '';
    await payment.save();

    const request = await FertilizerRequest.findById(payment.request._id);

    if (status === 'verified') {
      // Reserve stock in inventory ledger
      if (request.approvedDap > 0) {
        await InventoryService.reserveStock({ productCode: 'DAP', quantityQuintals: request.approvedDap });
      }
      if (request.approvedUrea > 0) {
        await InventoryService.reserveStock({ productCode: 'UREA', quantityQuintals: request.approvedUrea });
      }

      request.status = 'ready_for_distribution';
      request.history.push({
        action: 'PAYMENT_VERIFIED',
        actor: req.user._id,
        actorRole: req.user.role,
        notes: `Payment verified by office manager. Stock reserved. Reference: ${payment.paymentReference}`,
        newStatus: 'ready_for_distribution',
      });
      await request.save();

      // Notify farmer
      await NotificationService.send({
        recipient: payment.farmer,
        titleEn: `Payment Verified: Ref #${payment.paymentReference}`,
        titleAm: `ክፍያዎ ተረጋግጧል: ማመሳከሪያ #${payment.paymentReference}`,
        messageEn: `Your payment of ${payment.amountPaid} ETB has been verified! Request #${request.requestNumber} is now ready for distribution dispatch.`,
        messageAm: `የ ${payment.amountPaid} ብር ክፍያዎ ተረጋግጧል! ጥያቄ #${request.requestNumber} ለማዳበሪያ መቀበያ ዝግጁ ሆኗል።`,
        type: 'payment_status',
        actionUrl: `/farmer/requests/${request._id}`,
      });
    } else {
      // Rejected
      request.status = 'changes_requested';
      request.history.push({
        action: 'PAYMENT_REJECTED',
        actor: req.user._id,
        actorRole: req.user.role,
        notes: `Payment rejected. Reason: ${rejectionReason}`,
        newStatus: 'changes_requested',
      });
      await request.save();

      await NotificationService.send({
        recipient: payment.farmer,
        titleEn: `Payment Rejected: Ref #${payment.paymentReference}`,
        titleAm: `ክፍያዎ ውድቅ ተደርጓል: ማመሳከሪያ #${payment.paymentReference}`,
        messageEn: `Payment was rejected. Reason: ${rejectionReason}. Please review your receipt and re-submit.`,
        messageAm: `ክፍያዎ ውድቅ ተደርጓል። ምክንያት: ${rejectionReason}። እባክዎ ደረሰኙን አስተካክለው እንደገና ያስገቡ።`,
        type: 'payment_status',
        actionUrl: `/farmer/requests/${request._id}`,
      });
    }

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: `PAYMENT_${status.toUpperCase()}`,
      entityType: 'Payment',
      entityId: payment._id,
      ipAddress: req.ip,
      details: { status, rejectionReason },
    });

    res.status(200).json({
      success: true,
      message: `Payment ${status} successfully.`,
      payment,
      requestStatus: request.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Serve protected receipt file to authorized users only
// @route GET /api/v1/payments/receipts/:filename
const serveReceipt = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const receiptPath = path.join(__dirname, '../../uploads/receipts', filename);

    if (!fs.existsSync(receiptPath)) {
      return res.status(404).json({ success: false, message: 'Receipt file not found.' });
    }

    // Role check: Only the farmer who owns it, office manager, or manager can view
    const payment = await Payment.findOne({ receiptUrl: { $regex: filename } });
    if (payment) {
      if (req.user.role === 'farmer' && payment.farmer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this document.' });
      }
    }

    res.sendFile(receiptPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPayment,
  getPayments,
  verifyPayment,
  serveReceipt,
};
