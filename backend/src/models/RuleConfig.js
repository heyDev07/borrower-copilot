const mongoose = require('mongoose');

const tierCapSchema = new mongoose.Schema(
  { high: Number, mid: Number, low: Number },
  { _id: false }
);

// All ratios in this schema are plain percentages (55 means 55%), the
// same convention Product uses for rateBandPct and processingFeePct.
const ruleConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'default' },

  // Max share of net income that can go toward EMIs, by employment type
  // and credit-score tier. This is the "lender's number" side of O2.
  foirCapByEmploymentType: {
    salaried: tierCapSchema,
    self_employed_itr: tierCapSchema,
    self_employed_cash: tierCapSchema,
    informal: tierCapSchema,
  },

  // Credit score at or above `high`/`mid` gets that tier; below `mid` is
  // "low". An unknown score is always treated as "low" — never assumed.
  creditScoreTiers: {
    high: Number,
    mid: Number,
  },

  // The "borrower's safe number" side of O2/O4: applied to income left
  // over after existing EMIs, household expenses, and the savings buffer.
  disposableIncomeFoirCap: Number,
  savingsBufferPct: Number,

  // Loan-to-value ceiling for routing to a secured product.
  secureLoanMaxLTV: Number,

  // Existing debt above this APR is flagged as high-cost.
  highCostDebtApr: Number,
  highUtilisationPct: Number,
  bounceLookbackMonths: Number,

  // Loan tenure is capped so it ends before this age.
  retirementAge: Number,

  // Stress test assumptions for O4.
  stressIncomeDropPct: Number,
  stressRateRisePct: Number,

  processingFeeDefaultPct: Number,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RuleConfig', ruleConfigSchema);
