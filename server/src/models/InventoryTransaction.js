const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FertilizerProduct',
      required: true,
    },
    productCode: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        'shipment_received',
        'reservation',
        'distribution_dispatch',
        'damage_adjustment',
        'return_adjustment',
      ],
      required: true,
    },
    quantityQuintals: {
      type: Number,
      required: true,
    },
    previousStockBalance: {
      type: Number,
      required: true,
    },
    newStockBalance: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['shipment', 'distribution_order', 'damage_report', 'manual_audit'],
      required: true,
    },
    referenceId: {
      type: String,
      default: '',
    },
    supplierOrReceiver: {
      type: String,
      default: '',
    },
    purchaseCostPerQuintal: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
