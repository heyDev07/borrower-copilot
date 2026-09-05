// Narrows a product's full rate band down to this borrower's slice of it:
// credit tier picks the starting position, hard risk flags push it up.
// APR then folds in the processing fee, spread over the product's usual
// tenure — a simplification of the true IRR-based APR, documented as such.

function round1(n) {
  return Math.round(n * 10) / 10;
}

function computeRateBand(creditTier, riskFlags, product) {
  const { min, max } = product.rateBandPct;
  const span = max - min;

  let band;
  if (creditTier === 'high') band = { min, max: min + span * 0.35 };
  else if (creditTier === 'mid') band = { min: min + span * 0.25, max: min + span * 0.65 };
  else band = { min: min + span * 0.55, max };

  const hardFlagCount = riskFlags.filter((f) => f.severity === 'hard').length;
  const roomToMax = max - band.max;
  const pushUp = Math.min(hardFlagCount, roomToMax);

  return {
    min: round1(band.min + pushUp * 0.5),
    max: round1(Math.min(max, band.max + pushUp)),
  };
}

function computeAprBand(rateBand, product) {
  const tenureYears = product.maxTenureMonths / 12;
  const feeSpread = product.processingFeePct / tenureYears;
  return {
    min: round1(rateBand.min + feeSpread),
    max: round1(rateBand.max + feeSpread),
  };
}

module.exports = { computeRateBand, computeAprBand };
