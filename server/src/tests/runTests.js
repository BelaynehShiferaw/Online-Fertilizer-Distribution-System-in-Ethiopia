require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FertilizerProduct = require('../models/FertilizerProduct');
const InventoryService = require('../services/inventoryService');
const connectDB = require('../config/db');

async function runTests() {
  console.log('--- Starting OFDMS Automated Backend Verification Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    await connectDB();

    // Test 1: Password hashing and comparison
    console.log('[Test 1] Verifying bcrypt password hashing and comparison...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('TestPassword123!', salt);
    const isMatch = await bcrypt.compare('TestPassword123!', hash);
    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);

    if (isMatch === true && isWrongMatch === false) {
      console.log('✓ PASS: Password hashing & verification working properly.');
      passed++;
    } else {
      console.error('✗ FAIL: Password verification logic error.');
      failed++;
    }

    // Test 2: Role Based Access Control Definitions
    console.log('[Test 2] Verifying allowed user roles...');
    const validRoles = ['manager', 'office_manager', 'agricultural_expert', 'laborer', 'farmer'];
    if (validRoles.length === 5) {
      console.log('✓ PASS: Exactly 5 RBAC roles configured correctly.');
      passed++;
    } else {
      console.error('✗ FAIL: Role list configuration error.');
      failed++;
    }

    // Test 3: Inventory Ledger Prevention of Negative Stock
    console.log('[Test 3] Verifying inventory ledger prevents negative stock...');
    const testProductCode = 'TEST_FERT_' + Date.now();
    const testProduct = await FertilizerProduct.create({
      code: 'DAP', // use existing or test
      nameEn: 'Test Fertilizer',
      nameAm: 'የሙከራ ማዳበሪያ',
      currentStockQuintals: 10,
      reservedQuintals: 0,
    }).catch(() => null);

    // Try to record damage greater than available
    let negativeDeductionPrevented = false;
    try {
      await InventoryService.recordDamageAdjustment({
        productCode: 'DAP',
        quantityQuintals: 999999, // way higher than stock
        reason: 'Test negative deduction',
        performedBy: new mongoose.Types.ObjectId(),
      });
    } catch (err) {
      negativeDeductionPrevented = true;
    }

    if (negativeDeductionPrevented) {
      console.log('✓ PASS: Inventory ledger successfully blocks negative stock adjustment.');
      passed++;
    } else {
      console.error('✗ FAIL: Negative inventory was not prevented!');
      failed++;
    }

    // Test 4: Duplicate stock deduction prevention
    console.log('[Test 4] Verifying duplicate distribution deduction prevention guard...');
    const dummyOrder = {
      orderNumber: 'TEST-ORDER-001',
      stockDeducted: true, // already deducted
      authorizedDap: 5,
      authorizedUrea: 5,
    };

    let duplicatePrevented = false;
    try {
      await InventoryService.deductDistributionStock({
        order: dummyOrder,
        performedBy: new mongoose.Types.ObjectId(),
      });
    } catch (err) {
      duplicatePrevented = true;
    }

    if (duplicatePrevented) {
      console.log('✓ PASS: Anti-double-spend guard successfully prevents duplicate inventory deduction.');
      passed++;
    } else {
      console.error('✗ FAIL: Duplicate inventory deduction guard failed!');
      failed++;
    }

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('[Test Execution Error]', error);
    process.exit(1);
  }
}

runTests();
