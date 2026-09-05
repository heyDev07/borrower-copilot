// Narrows a product's full rate band down to this borrower's slice of it:
// credit tier picks the starting position, hard risk flags push it up,
// a long income history nudges it back down. APR then folds in the
// processing fee, spread over the borrower's actual tenure — a
// simplification of the true IRR-based APR, documented as such.

function round1(n) {
  return Math.round(n * 10) / 10;
}

function computeRateBand(creditTier, riskFlags, product, incomeStabilityMonths) {
  const { min, max } = product.rateBandPct;
  const span = max - min;

  let band;
  if (creditTier === 'high') band = { min, max: min + span * 0.35 };
  else if (creditTier === 'mid') band = { min: min + span * 0.25, max: min + span * 0.65 };
  else band = { min: min + span * 0.55, max };

  const hardFlagCount = riskFlags.filter((f) => f.severity === 'hard').length;
  const roomToMax = max - band.max;
  const pushUp = Math.min(hardFlagCount, roomToMax);

  band = {
    min: band.min + pushUp * 0.5,
    max: Math.min(max, band.max + pushUp),
  };

  // A long, stable income history is a mild positive; a very new one is a
  // mild negative — neither as strong as an actual risk flag.
  if (incomeStabilityMonths >= 36) band = { min: Math.max(min, band.min - 0.5), max: Math.max(min, band.max - 0.5) };
  else if (incomeStabilityMonths > 0 && incomeStabilityMonths < 12) {
    band = { min: Math.min(max, band.min + 0.5), max: Math.min(max, band.max + 0.5) };
  }

  return { min: round1(band.min), max: round1(band.max) };
}

function computeAprBand(rateBand, product, tenureMonths) {
  const tenureYears = tenureMonths / 12;
  const feeSpread = product.processingFeePct / tenureYears;
  return {
    min: round1(rateBand.min + feeSpread),
    max: round1(rateBand.max + feeSpread),
  };
}

module.exports = { computeRateBand, computeAprBand };
