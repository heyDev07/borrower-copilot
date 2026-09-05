const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  qid: { type: String, required: true, unique: true },
  text: { type: String, required: true },
  tier: { type: String, enum: ['must', 'additional'], required: true },

  // 'all', or a subset of employment types this question is asked for.
  appliesTo: [{ type: String }],

  inputType: { type: String, enum: ['number', 'select', 'boolean', 'text'], required: true },
  options: [{ type: String }],

  // Which outputs answering this question can tighten: any of O1-O4.
  // An additional question with an empty list should not exist.
  affects: [{ type: String }],

  order: { type: Number, required: true },
});

module.exports = mongoose.model('Question', questionSchema);
