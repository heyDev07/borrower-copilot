require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const RuleConfig = require('../models/RuleConfig');
const Question = require('../models/Question');
const { products, ruleConfig, questions } = require('./data');

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
