const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  category: { type: String, enum: ['unsecured', 'secured', 'asset-linked'], required: true },
  rateBandPct: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  processingFeePct: { type: Number, required: true },
  appliesToPurpose: [{ type: String }],
  notes: String,
});

module.exports = mongoose.model('Product', productSchema);
