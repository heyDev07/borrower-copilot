require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const RuleConfig = require('../models/RuleConfig');
const Question = require('../models/Question');

const products = [
  {
    key: 'personal_unsecured',
    label: 'Personal Loan (Unsecured)',
    category: 'unsecured',
    rateBandPct: { min: 10.5, max: 22 },
    processingFeePct: 2,
    appliesToPurpose: ['wedding', 'medical', 'education', 'home_improvement', 'other'],
    notes: 'Default product for salaried/self-employed borrowers with no collateral.',
  },
  {
    key: 'business_unsecured',
    label: 'Business Loan (Unsecured)',
    category: 'unsecured',
    rateBandPct: { min: 14, max: 24 },
    processingFeePct: 2,
    appliesToPurpose: ['business'],
    notes: 'Higher band than personal — income proof is weaker and use is riskier.',
  },
  {
    key: 'secured_lap_gold',
    label: 'Secured Loan (Property/Gold-backed)',
    category: 'secured',
    rateBandPct: { min: 9, max: 12 },
    processingFeePct: 1,
    appliesToPurpose: ['business', 'home_improvement', 'wedding', 'medical', 'education', 'other'],
    notes: 'Routed to whenever collateral clears secureLoanMaxLTV, regardless of purpose.',
  },
  {
    key: 'two_wheeler',
    label: 'Two-Wheeler Loan (Asset-linked)',
    category: 'asset-linked',
    rateBandPct: { min: 11, max: 15 },
    processingFeePct: 1.5,
    appliesToPurpose: ['vehicle'],
    notes: 'The vehicle itself is the asset — cheaper than a personal loan for the same purpose.',
  },
];

const ruleConfig = {
  key: 'default',
  foirCapByEmploymentType: {
    salaried: { high: 0.55, mid: 0.5, low: 0.4 },
    self_employed_itr: { high: 0.45, mid: 0.45, low: 0.35 },
    self_employed_cash: { high: 0.35, mid: 0.35, low: 0.3 },
    informal: { high: 0.3, mid: 0.3, low: 0.25 },
  },
  creditScoreTiers: { high: 750, mid: 650 },
  disposableIncomeFoirCap: 0.35,
  savingsBufferPct: 0.1,
  secureLoanMaxLTV: 0.65,
  highCostDebtApr: 0.24,
  bounceLookbackMonths: 6,
  stressIncomeDropPct: 0.2,
  stressRateRisePct: 0.02,
  processingFeeDefaultPct: 0.02,
};

const questions = [
  // --- must questions: minimum to produce all four outputs ---
  { qid: 'employmentType', text: 'How would you describe your work?', tier: 'must', appliesTo: ['all'], inputType: 'select', options: ['salaried', 'self_employed', 'informal'], affects: ['O1', 'O2', 'O3', 'O4'], order: 1 },
  { qid: 'purpose', text: 'What is this loan for?', tier: 'must', appliesTo: ['all'], inputType: 'select', options: ['wedding', 'medical', 'education', 'business', 'vehicle', 'home_improvement', 'other'], affects: ['O2', 'O3'], order: 2 },
  { qid: 'loanAmountRequested', text: 'How much do you want to borrow?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O2'], order: 3 },
  { qid: 'netMonthlyIncome', text: 'What is your net monthly income?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O2', 'O3', 'O4'], order: 4 },
  { qid: 'existingMonthlyEMI', text: 'What do you currently pay in EMIs each month?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O2', 'O4'], order: 5 },
  { qid: 'monthlyHouseholdExpenses', text: 'What are your essential monthly household expenses?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O2', 'O4'], order: 6 },
  { qid: 'age', text: 'What is your age?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O4'], order: 7 },
  { qid: 'creditScore', text: 'What is your credit score, if you know it?', tier: 'must', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O3'], order: 8 },
  { qid: 'incomeProofType', text: 'What income proof can you show?', tier: 'must', appliesTo: ['self_employed', 'informal'], inputType: 'select', options: ['itr', 'bank_statement', 'none'], affects: ['O1', 'O3'], order: 9 },

  // --- additional questions: each must tighten a specific output ---
  { qid: 'incomeStabilityMonths', text: 'How many months have you had this income?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O3'], order: 10 },
  { qid: 'variableIncomeSharePct', text: 'What share of your income varies month to month?', tier: 'additional', appliesTo: ['self_employed', 'informal'], inputType: 'number', affects: ['O1', 'O3'], order: 11 },
  { qid: 'existingDebtOutstanding', text: 'What do you owe in total across existing loans/cards?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O1'], order: 12 },
  { qid: 'existingDebtAvgApr', text: 'What is the average interest rate on that existing debt?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O3'], order: 13 },
  { qid: 'creditUtilisationPct', text: 'On average, how much of your credit card limit do you use?', tier: 'additional', appliesTo: ['salaried', 'self_employed'], inputType: 'number', affects: ['O1', 'O3'], order: 14 },
  { qid: 'pastBounceCount6m', text: 'Any bounced EMI or bill payments in the last 6 months?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O1'], order: 15 },
  { qid: 'emergencySavingsMonths', text: 'If your income stopped, how many months of expenses could you cover?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O1', 'O4'], order: 16 },
  { qid: 'collateralValue', text: 'Do you have property, gold, or an FD you could offer as security? What is it worth?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O2', 'O3'], order: 17 },
  { qid: 'coApplicantIncome', text: 'Is there a co-applicant? What is their net monthly income?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O2', 'O4'], order: 18 },
  { qid: 'upcomingLargeExpense', text: 'Any large expense coming up in the next year?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O4'], order: 19 },
  { qid: 'loanProductiveReturnPct', text: 'If this loan is for your business, what return do you expect it to generate?', tier: 'additional', appliesTo: ['self_employed'], inputType: 'number', affects: ['O1'], order: 20 },
  { qid: 'offerReceivedRate', text: 'Has a lender already quoted you a rate? What was it?', tier: 'additional', appliesTo: ['all'], inputType: 'number', affects: ['O3'], order: 21 },
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Product.insertMany(products);

  await RuleConfig.deleteMany({});
  await RuleConfig.create(ruleConfig);

  await Question.deleteMany({});
  await Question.insertMany(questions);

  console.log(`Seeded ${products.length} products, 1 rule config, ${questions.length} questions.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
