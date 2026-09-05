// Confidence widens with silence, on purpose: it's the share of
// applicable additional questions the borrower actually answered.

function computeConfidence(answers, additionalQuestions) {
  const applicable = additionalQuestions.filter(
    (q) => q.appliesTo.includes('all') || q.appliesTo.includes(answers.employmentType)
  );
  if (applicable.length === 0) return 'medium';

  const answered = applicable.filter((q) => answers[q.qid] !== undefined && answers[q.qid] !== null);
  const ratio = answered.length / applicable.length;

  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.25) return 'medium';
  return 'low';
}

module.exports = { computeConfidence };
