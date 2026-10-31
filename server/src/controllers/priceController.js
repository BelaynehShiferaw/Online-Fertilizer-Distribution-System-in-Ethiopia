const FertilizerPrice = require('../models/FertilizerPrice');
const FertilizerProduct = require('../models/FertilizerProduct');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

// @desc Get fertilizer prices (historical or active)
// @route GET /api/v1/fertilizer-prices
const getPrices = async (req, res, next) => {
  try {
    const { productCode, onlyPublished } = req.query;
    const query = {};

    if (productCode) query.productCode = productCode.toUpperCase();
    if (onlyPublished === 'true' || req.user?.role === 'farmer') {
      query.isPublished = true;
    }

    const prices = await FertilizerPrice.find(query)
      .populate('product')
      .populate('setBy', 'name role')
      .populate('publishedBy', 'name role')
      .sort({ effectiveDate: -1 });

    res.status(200).json({ success: true, count: prices.length, prices });
  } catch (error) {
    next(error);
  }
};

// @desc Set fertilizer price per quintal (Manager only)
// @route POST /api/v1/fertilizer-prices
const setPrice = async (req, res, next) => {
  try {
    const { productCode, pricePerQuintal, effectiveDate, notes } = req.body;

    if (!productCode || pricePerQuintal === undefined) {
      return res.status(400).json({ success: false, message: 'Product code and price per quintal are required.' });
    }

    const product = await FertilizerProduct.findOne({ code: productCode.toUpperCase() });
    if (!product) return res.status(400).json({ success: false, message: 'Fertilizer product not found.' });

    const newPrice = await FertilizerPrice.create({
      product: product._id,
      productCode: product.code,
      pricePerQuintal: Number(pricePerQuintal),
      currency: 'ETB',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      setBy: req.user._id,
      isPublished: false,
      notes: notes || '',
    });

    // Notify Office Manager to review & publish
    await NotificationService.broadcastToRole('office_manager', {
      titleEn: `New Fertilizer Price Set for ${product.code}`,
      titleAm: `አዲስ የማዳበሪያ ዋጋ ለ ${product.code} ተወስኗል`,
      messageEn: `Manager set price for ${product.code} at ${pricePerQuintal} ETB/Qtl. Ready for publication.`,
      messageAm: `ሥራ አስኪያጅ ለ ${product.code} በ ${pricePerQuintal} ብር/ኩንታል ዋጋ ወስነዋል። ለህትመት ዝግጁ ነው።`,
      type: 'price_update',
      actionUrl: `/office/prices`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'FERTILIZER_PRICE_SET',
      entityType: 'FertilizerPrice',
      entityId: newPrice._id,
      ipAddress: req.ip,
      details: { productCode, pricePerQuintal },
    });

    res.status(201).json({ success: true, message: 'Price set successfully. Pending publication by Office Manager.', price: newPrice });
  } catch (error) {
    next(error);
  }
};

// @desc Publish approved fertilizer price (Office Manager only)
// @route POST /api/v1/fertilizer-prices/:id/publish
const publishPrice = async (req, res, next) => {
  try {
    const priceDoc = await FertilizerPrice.findById(req.params.id).populate('product');
    if (!priceDoc) return res.status(404).json({ success: false, message: 'Price record not found.' });

    priceDoc.isPublished = true;
    priceDoc.publishedBy = req.user._id;
    priceDoc.publishedAt = new Date();
    await priceDoc.save();

    // Broadcast new price to all farmers
    await NotificationService.broadcastToRole('farmer', {
      titleEn: `Official Fertilizer Price Published: ${priceDoc.productCode}`,
      titleAm: `ይፋዊ የማዳበሪያ ዋጋ ታውጇል: ${priceDoc.productCode}`,
      messageEn: `Official price for ${priceDoc.productCode} is now ${priceDoc.pricePerQuintal} ETB per quintal.`,
      messageAm: `የ ${priceDoc.productCode} ይፋዊ ዋጋ በአንድ ኩንታል ${priceDoc.pricePerQuintal} ብር ሆኗል።`,
      type: 'price_update',
      actionUrl: `/farmer/prices`,
    });

    AuditService.log({
      actor: req.user._id,
      actorName: req.user.name,
      role: req.user.role,
      action: 'FERTILIZER_PRICE_PUBLISHED',
      entityType: 'FertilizerPrice',
      entityId: priceDoc._id,
      ipAddress: req.ip,
      details: { productCode: priceDoc.productCode, pricePerQuintal: priceDoc.pricePerQuintal },
    });

    res.status(200).json({ success: true, message: 'Price published to farmers successfully.', price: priceDoc });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrices,
  setPrice,
  publishPrice,
};
