// O1. Two hard flags is an automatic "don't" — one problem can be a
// one-off, two is a pattern. Otherwise it comes down to how far the
// requested amount's EMI sits above the safe ceiling — relaxed a little
// if the loan is expected to pay for itself.

function computeVerdict({
  loanAmountRequested,
  recommendedEmiCeiling,
  emiForRequestedAmount,
  riskFlags,
  loanProductiveReturnPct,
  midRate,
}) {
  const hardFlags = riskFlags.filter((f) => f.severity === 'hard');

  if (hardFlags.length >= 2) {
    return { decision: 'dont_borrow', reason: hardFlags.map((f) => f.message).join('; ') };
  }

  const overCeilingRatio = recommendedEmiCeiling > 0 ? emiForRequestedAmount / recommendedEmiCeiling : Infinity;

  // A return that clearly beats the cost of borrowing earns some slack —
  // matching the cost isn't enough, since costs can move against you.
  const isProductive = loanProductiveReturnPct > midRate + 3;
  const overCeilingThreshold = isProductive ? 1.6 : 1.3;

  if (hardFlags.length === 1 || overCeilingRatio > overCeilingThreshold) {
    const reason = hardFlags.length
      ? hardFlags[0].message
      : `The EMI for ₹${Math.round(loanAmountRequested).toLocaleString('en-IN')} would run about ` +
        `${Math.round((overCeilingRatio - 1) * 100)}% over your safe ceiling.`;
    return { decision: 'borrow_less', reason };
  }

  return { decision: 'borrow', reason: 'The requested amount fits within your safe EMI ceiling.' };
}

module.exports = { computeVerdict };
