require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const FarmerProfile = require('./models/FarmerProfile');
const FarmPlot = require('./models/FarmPlot');
const Crop = require('./models/Crop');
const FertilizerProduct = require('./models/FertilizerProduct');
const FertilizerRecommendation = require('./models/FertilizerRecommendation');
const FertilizerPrice = require('./models/FertilizerPrice');
const FertilizerRequest = require('./models/FertilizerRequest');
const InventoryTransaction = require('./models/InventoryTransaction');
const ProcurementRequest = require('./models/ProcurementRequest');
const Payment = require('./models/Payment');
const DistributionOrder = require('./models/DistributionOrder');
const Notification = require('./models/Notification');
const SalaryPayment = require('./models/SalaryPayment');
const Expense = require('./models/Expense');
const AuditLog = require('./models/AuditLog');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      FarmPlot.deleteMany({}),
      Crop.deleteMany({}),
      FertilizerProduct.deleteMany({}),
      FertilizerRecommendation.deleteMany({}),
      FertilizerPrice.deleteMany({}),
      FertilizerRequest.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      ProcurementRequest.deleteMany({}),
      Payment.deleteMany({}),
      DistributionOrder.deleteMany({}),
      Notification.deleteMany({}),
      SalaryPayment.deleteMany({}),
      Expense.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users for all 5 roles...');
    const salt = await bcrypt.genSalt(10);

    const managerPassword = await bcrypt.hash('Manager@123', salt);
    const officePassword = await bcrypt.hash('Office@123', salt);
    const expertPassword = await bcrypt.hash('Expert@123', salt);
    const laborerPassword = await bcrypt.hash('Laborer@123', salt);
    const farmerPassword = await bcrypt.hash('Farmer@123', salt);

    const manager = await User.create({
      name: 'Abebe Bekele',
      email: 'manager@ofdms.et',
      phone: '+251911223344',
      passwordHash: managerPassword,
      role: 'manager',
      preferredLanguage: 'en',
      status: 'active',
    });

    const officeManager = await User.create({
      name: 'Tigist Hailu',
      email: 'officemanager@ofdms.et',
      phone: '+251922334455',
      passwordHash: officePassword,
      role: 'office_manager',
      preferredLanguage: 'am',
      status: 'active',
    });

    const agExpert = await User.create({
      name: 'Dr. Dawit Tadesse',
      email: 'agriexpert@ofdms.et',
      phone: '+251933445566',
      passwordHash: expertPassword,
      role: 'agricultural_expert',
      preferredLanguage: 'en',
      status: 'active',
    });

    const laborer = await User.create({
      name: 'Alazar Mengistu',
      email: 'laborer@ofdms.et',
      phone: '+251944556677',
      passwordHash: laborerPassword,
      role: 'laborer',
      preferredLanguage: 'am',
      status: 'active',
    });

    const farmer = await User.create({
      name: 'Kebede Wolde',
      email: 'farmer@ofdms.et',
      phone: '+251955667788',
      passwordHash: farmerPassword,
      role: 'farmer',
      preferredLanguage: 'am',
      status: 'active',
    });

    console.log('[Seed] Creating Farmer Profile for Kebede...');
    const farmerProfile = await FarmerProfile.create({
      user: farmer._id,
      farmerId: 'ETH-FARM-2026',
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: 'Ada\'a',
      kebele: 'Denkaka',
      village: 'Goda Harbu',
      nationalId: 'ID-ET-987654',
      cooperativeName: 'Ada\'a Farmers Primary Cooperative',
      totalCultivatedHectares: 2.5,
    });

    console.log('[Seed] Creating Ethiopian crops...');
    const crops = await Crop.insertMany([
      {
        nameEn: 'Teff',
        nameAm: 'ጤፍ',
        code: 'TEFF',
        category: 'Cereal',
        defaultDapRatePerHa: 1.0,
        defaultUreaRatePerHa: 1.0,
        descriptionEn: 'Ethiopian staple grain, Magna and Sergegna varieties',
        descriptionAm: 'የኢትዮጵያ ዋና የምግብ እህል (ማግና እና ሰርገኛ)',
        active: true,
      },
      {
        nameEn: 'Maize (Corn)',
        nameAm: 'በቆሎ',
        code: 'MAIZE',
        category: 'Cereal',
        defaultDapRatePerHa: 1.5,
        defaultUreaRatePerHa: 2.0,
        descriptionEn: 'High-yielding hybrid maize (BH-660 / BH-540)',
        descriptionAm: 'ምርጥ የድቅል በቆሎ ዝርያ',
        active: true,
      },
      {
        nameEn: 'Wheat',
        nameAm: 'ስንዴ',
        code: 'WHEAT',
        category: 'Cereal',
        defaultDapRatePerHa: 1.0,
        defaultUreaRatePerHa: 1.0,
        descriptionEn: 'Bread wheat and durum wheat varieties',
        descriptionAm: 'የዳቦ እና የፓስታ ስንዴ ዝርያዎች',
        active: true,
      },
      {
        nameEn: 'Barley',
        nameAm: 'ገብስ',
        code: 'BARLEY',
        category: 'Cereal',
        defaultDapRatePerHa: 1.0,
        defaultUreaRatePerHa: 0.75,
        descriptionEn: 'Food and malt barley for highlands',
        descriptionAm: 'የደጋ ገብስ እና የብቅል ገብስ',
        active: true,
      },
    ]);

    console.log('[Seed] Creating fertilizer products...');
    const dapProduct = await FertilizerProduct.create({
      code: 'DAP',
      nameEn: 'Di-Ammonium Phosphate (DAP)',
      nameAm: 'ዳፕ (ዲ-አሞኒየም ፎስፌት)',
      unit: 'Quintal (100 kg)',
      bagSizeKg: 50,
      currentStockQuintals: 500,
      reservedQuintals: 0,
      minimumAlertThreshold: 50,
      active: true,
    });

    const ureaProduct = await FertilizerProduct.create({
      code: 'UREA',
      nameEn: 'Granular Urea (46% N)',
      nameAm: 'ዩሪያ (46% ናይትሮጅን)',
      unit: 'Quintal (100 kg)',
      bagSizeKg: 50,
      currentStockQuintals: 600,
      reservedQuintals: 0,
      minimumAlertThreshold: 50,
      active: true,
    });

    console.log('[Seed] Recording initial inventory shipment ledger entries...');
    await InventoryTransaction.create({
      transactionNumber: 'TXN-IN-INIT-001',
      product: dapProduct._id,
      productCode: 'DAP',
      transactionType: 'shipment_received',
      quantityQuintals: 500,
      previousStockBalance: 0,
      newStockBalance: 500,
      referenceType: 'shipment',
      referenceId: 'SHIP-EABC-2026-01',
      supplierOrReceiver: 'Ethiopian Agricultural Businesses Corporation (EABC)',
      purchaseCostPerQuintal: 4200,
      totalCost: 2100000,
      performedBy: officeManager._id,
      notes: 'Initial warehouse stocking from central port Djibouti shipment',
    });

    await InventoryTransaction.create({
      transactionNumber: 'TXN-IN-INIT-002',
      product: ureaProduct._id,
      productCode: 'UREA',
      transactionType: 'shipment_received',
      quantityQuintals: 600,
      previousStockBalance: 0,
      newStockBalance: 600,
      referenceType: 'shipment',
      referenceId: 'SHIP-EABC-2026-02',
      supplierOrReceiver: 'Ethiopian Agricultural Businesses Corporation (EABC)',
      purchaseCostPerQuintal: 3600,
      totalCost: 2160000,
      performedBy: officeManager._id,
      notes: 'Initial warehouse stocking from central port Djibouti shipment',
    });

    console.log('[Seed] Creating approved and published fertilizer prices...');
    await FertilizerPrice.create({
      product: dapProduct._id,
      productCode: 'DAP',
      pricePerQuintal: 4850,
      currency: 'ETB',
      effectiveDate: new Date('2026-01-01'),
      setBy: manager._id,
      isPublished: true,
      publishedBy: officeManager._id,
      publishedAt: new Date('2026-01-02'),
      notes: 'Subsidized National Fertilizer Price 2026 Season',
    });

    await FertilizerPrice.create({
      product: ureaProduct._id,
      productCode: 'UREA',
      pricePerQuintal: 4200,
      currency: 'ETB',
      effectiveDate: new Date('2026-01-01'),
      setBy: manager._id,
      isPublished: true,
      publishedBy: officeManager._id,
      publishedAt: new Date('2026-01-02'),
      notes: 'Subsidized National Fertilizer Price 2026 Season',
    });

    console.log('[Seed] Creating expert recommendations...');
    for (const crop of crops) {
      await FertilizerRecommendation.create({
        crop: crop._id,
        soilContext: 'Vertisol (Walka) and Nitisol soils',
        region: 'Oromia / Amhara Agricultural Corridors',
        season: 'Meher 2026',
        dapQuintalsPerHa: crop.defaultDapRatePerHa,
        ureaQuintalsPerHa: crop.defaultUreaRatePerHa,
        expert: agExpert._id,
        instructionsEn: `Apply 100% of DAP during planting. Split Urea into two applications: first at 30 days after emergence and second before flowering.`,
        instructionsAm: `ዳፕን በሙሉ በዘር ወቅት ይጠቀሙ። ዩሪያን ሁለት ጊዜ ከፍለው (ከተበቀለ ከ30 ቀን በኋላ እና ከአበባ በፊት) ይጠቀሙ።`,
      });
    }

    console.log('[Seed] Creating farm plots for Kebede...');
    const plot1 = await FarmPlot.create({
      farmer: farmer._id,
      plotIdentifier: 'Plot 1 - Denkaka East Valley',
      areaInHectares: 1.5,
      soilType: 'Vertisol (Walka / Black soil)',
      locationDescription: 'Adjacent to Awash tributary road',
      season: 'Meher (Main season)',
      year: 2026,
    });

    const plot2 = await FarmPlot.create({
      farmer: farmer._id,
      plotIdentifier: 'Plot 2 - Highland Hillside',
      areaInHectares: 1.0,
      soilType: 'Nitisol (Key / Red soil)',
      locationDescription: 'North field near cooperative center',
      season: 'Meher (Main season)',
      year: 2026,
    });

    console.log('[Seed] Creating active sample fertilizer requests...');
    const teffCrop = crops.find((c) => c.code === 'TEFF');
    const wheatCrop = crops.find((c) => c.code === 'WHEAT');

    // Request 1: Approved and awaiting payment
    const req1 = await FertilizerRequest.create({
      requestNumber: 'REQ-2026-001',
      farmer: farmer._id,
      farmerProfile: farmerProfile._id,
      plot: plot1._id,
      crop: teffCrop._id,
      cultivatedArea: 1.5,
      requestedDap: 1.5,
      requestedUrea: 1.5,
      approvedDap: 1.5,
      approvedUrea: 1.5,
      dapPricePerQuintal: 4850,
      ureaPricePerQuintal: 4200,
      totalAmountDue: 1.5 * 4850 + 1.5 * 4200, // 13,575 ETB
      status: 'awaiting_payment',
      reviewedByExpert: agExpert._id,
      expertNotes: 'Approved based on standard Teff recommendation rate for Ada\'a Vertisol soil.',
      expertDecisionDate: new Date(),
      history: [
        {
          action: 'REQUEST_SUBMITTED',
          actor: farmer._id,
          actorRole: 'farmer',
          notes: 'Submitted for Teff planting',
          newStatus: 'submitted',
        },
        {
          action: 'EXPERT_APPROVED',
          actor: agExpert._id,
          actorRole: 'agricultural_expert',
          notes: 'Recommended rates approved for 1.5 ha',
          newStatus: 'awaiting_payment',
        },
      ],
    });

    // Request 2: Submitted and pending agronomic review
    await FertilizerRequest.create({
      requestNumber: 'REQ-2026-002',
      farmer: farmer._id,
      farmerProfile: farmerProfile._id,
      plot: plot2._id,
      crop: wheatCrop._id,
      cultivatedArea: 1.0,
      requestedDap: 1.0,
      requestedUrea: 1.0,
      dapPricePerQuintal: 4850,
      ureaPricePerQuintal: 4200,
      totalAmountDue: 1.0 * 4850 + 1.0 * 4200,
      status: 'submitted',
      history: [
        {
          action: 'REQUEST_SUBMITTED',
          actor: farmer._id,
          actorRole: 'farmer',
          notes: 'Submitted for Wheat planting',
          newStatus: 'submitted',
        },
      ],
    });

    console.log('[Seed] Creating operational expenses and salary records...');
    await Expense.create({
      category: 'warehouse_operations',
      description: 'Warehouse fumigation and pallet maintenance for Ada depot',
      amount: 45000,
      status: 'approved',
      requestedBy: officeManager._id,
      approvedBy: manager._id,
      approvedAt: new Date(),
    });

    await SalaryPayment.create({
      employee: laborer._id,
      employeeName: laborer.name,
      role: 'Warehouse Laborer',
      period: 'Meskerem 2018 (Sept 2025)',
      amount: 8500,
      status: 'approved',
      approvedBy: manager._id,
      approvedAt: new Date(),
      paymentReference: 'SAL-SEP-001',
    });

    console.log('[Seed] Creating welcome notifications...');
    await Notification.create({
      recipient: farmer._id,
      titleEn: 'Welcome to OFDMS Ethiopia',
      titleAm: 'ወደ ኦኤፍዲኤምኤስ ኢትዮጵያ በደህና መጡ',
      messageEn: 'Your farmer profile is registered. You can submit fertilizer requests and track distributions.',
      messageAm: 'የአርሶ አደር መገለጫዎ ተመዝግቧል። የማዳበሪያ ጥያቄዎችን ማቅረብ እና ክትትል ማድረግ ይችላሉ።',
      type: 'system_announcement',
    });

    console.log('\n=============================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Demo Accounts Created (Password for all: Role@123):');
    console.log(' 1. Manager:             manager@ofdms.et       / Manager@123');
    console.log(' 2. Office Manager:      officemanager@ofdms.et / Office@123');
    console.log(' 3. Agricultural Expert: agriexpert@ofdms.et    / Expert@123');
    console.log(' 4. Laborer:             laborer@ofdms.et       / Laborer@123');
    console.log(' 5. Farmer:              farmer@ofdms.et        / Farmer@123');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
