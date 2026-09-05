const Product = require('../models/Product');
const RuleConfig = require('../models/RuleConfig');
const Question = require('../models/Question');
const { runAssessment } = require('../engine');

const REQUIRED_FIELDS = [
  'employmentType',
  'purpose',
  'loanAmountRequested',
  'netMonthlyIncome',
  'existingMonthlyEMI',
  'monthlyHouseholdExpenses',
  'age',
];

async function postAssess(req, res) {
  const { answers } = req.body;
  if (!answers) {
    return res.status(400).json({ error: 'answers is required' });
  }

  const missing = REQUIRED_FIELDS.filter((field) => answers[field] === undefined || answers[field] === null);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required answers: ${missing.join(', ')}` });
  }

  const [products, ruleConfig, questions] = await Promise.all([
    Product.find().lean(),
    RuleConfig.findOne({ key: 'default' }).lean(),
    Question.find().lean(),
  ]);

  if (!ruleConfig) {
    return res.status(503).json({ error: 'Rules config not seeded yet. Run `npm run seed`.' });
  }

  const result = runAssessment(answers, { products, ruleConfig, questions });
  res.json(result);
}

module.exports = { postAssess };
