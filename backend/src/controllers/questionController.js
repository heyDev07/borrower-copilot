const Question = require('../models/Question');

async function getQuestions(req, res) {
  const questions = await Question.find().sort({ order: 1 });
  res.json(questions);
}

module.exports = { getQuestions };
