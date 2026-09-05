const { employmentKey, creditTier } = require('./tiers');
const { computeAffordability } = require('./affordability');
const { routeProduct } = require('./productRouter');
const { evaluateRiskFlags } = require('./riskFlags');
const { computeRateBand, computeAprBand } = require('./rateEngine');
const { computeVerdict } = require('./verdict');
const { computeConfidence } = require('./confidence');
const { emiForPrincipal, principalForEmi } = require('./emiMath');

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function compareToOffer(offerReceivedRate, rateBand) {
  if (!offerReceivedRate) return null;
  if (offerReceivedRate > rateBand.max) {
    return `A lender quoted you ${offerReceivedRate}% — that's above fair. Ask for ${rateBand.min}–${rateBand.max}%.`;
  }
  if (offerReceivedRate < rateBand.min) {
    return `A lender quoted you ${offerReceivedRate}% — that's already better than fair for your profile.`;
  }
  return `A lender quoted you ${offerReceivedRate}% — that's within the fair range.`;
}

// Runs the whole pipeline once: tiering -> affordability -> product ->
// risk -> rate -> verdict -> outputs. Pure function — no I/O, so it's
// easy to unit test and easy to defend line by line.

function runAssessment(answers, { products, ruleConfig, questions }) {
  const empKey = employmentKey(answers.employmentType, answers.incomeProofType);
  const tier = creditTier(answers.creditScore, ruleConfig.creditScoreTiers);
  const foirCapPct = ruleConfig.foirCapByEmploymentType[empKey][tier];

  const affordability = computeAffordability(answers, foirCapPct, ruleConfig);
  const product = routeProduct(answers, products, ruleConfig);
  const riskFlags = evaluateRiskFlags(answers, ruleConfig);
  const rateBand = computeRateBand(tier, riskFlags, product, answers.incomeStabilityMonths);
  const midRate = (rateBand.min + rateBand.max) / 2;

  // A loan has to be repaid before retirement — cap the tenure this
  // borrower can actually use, not just what the product allows.
  const ageCappedTenureMonths = Math.max(6, (ruleConfig.retirementAge - answers.age) * 12);
  const tenureMonths = Math.min(product.maxTenureMonths, ageCappedTenureMonths);

  const aprBand = computeAprBand(rateBand, product, tenureMonths);
  const emiForRequestedAmount = emiForPrincipal(answers.loanAmountRequested, midRate, tenureMonths);

  const verdict = computeVerdict({
    loanAmountRequested: answers.loanAmountRequested,
    recommendedEmiCeiling: affordability.recommendedEmiCeiling,
    emiForRequestedAmount,
    riskFlags,
    loanProductiveReturnPct: answers.loanProductiveReturnPct,
    midRate,
  });

  const lenderMaxAmount = principalForEmi(affordability.lenderEmiCeiling, midRate, tenureMonths);
  const borrowerSafeMaxAmount = principalForEmi(affordability.borrowerSafeEmiCeiling, midRate, tenureMonths);

  const tenureOptions = [0.25, 0.5, 1].map((fraction) => {
    const months = Math.max(6, Math.round((tenureMonths * fraction) / 6) * 6);
    return { months, emi: Math.round(emiForPrincipal(answers.loanAmountRequested, midRate, months)) };
  });

  const stressedIncome = answers.netMonthlyIncome * (1 - ruleConfig.stressIncomeDropPct / 100);
  const stressedAffordability = computeAffordability(
    { ...answers, netMonthlyIncome: stressedIncome },
    foirCapPct,
    ruleConfig
  );
  const stressedRate = midRate + ruleConfig.stressRateRisePct;
  const stressedEmiForRequested = emiForPrincipal(answers.loanAmountRequested, stressedRate, tenureMonths);

  const confidence = computeConfidence(
    answers,
    questions.filter((q) => q.tier === 'additional')
  );

  return {
    confidence,
    riskFlags,
    outputs: {
      O1: {
        decision: verdict.decision,
        reason: verdict.reason,
      },
      O2: {
        lenderMaxAmount: Math.round(lenderMaxAmount),
        borrowerSafeMaxAmount: Math.round(borrowerSafeMaxAmount),
        useThisOne: 'borrowerSafeMaxAmount',
        reason:
          `The lender-side number comes from ${foirCapPct}% of income minus existing EMIs; the safe number ` +
          'nets out expenses and a savings buffer first — use the smaller one.',
      },
      O3: {
        product: product.label,
        rateBandPct: rateBand,
        aprBandPct: aprBand,
        offerComparison: compareToOffer(answers.offerReceivedRate, rateBand),
        reason: `${product.label} for a "${tier}" credit tier, with the processing fee spread over ${tenureMonths} months folded into the APR.`,
      },
      O4: {
        emiCeiling: Math.round(affordability.recommendedEmiCeiling),
        tenureOptions,
        stress: {
          assumption: `income drops ${ruleConfig.stressIncomeDropPct}% or the rate rises ${ruleConfig.stressRateRisePct} points`,
          stressedEmiCeiling: Math.round(stressedAffordability.recommendedEmiCeiling),
          stressedEmiForRequested: Math.round(stressedEmiForRequested),
          stillAffordable: stressedEmiForRequested <= stressedAffordability.recommendedEmiCeiling,
        },
        reason: `₹${Math.round(affordability.recommendedEmiCeiling).toLocaleString('en-IN')} is what's left of your income after existing EMIs, expenses, and a savings buffer.`,
      },
    },
    negotiationCard: {
      verdict: verdict.decision,
      product: product.label,
      amountToUse: Math.round(borrowerSafeMaxAmount),
      rateBandPct: rateBand,
      aprBandPct: aprBand,
      emiCeiling: Math.round(affordability.recommendedEmiCeiling),
      offerComparison: compareToOffer(answers.offerReceivedRate, rateBand),
      headline: `Fair for your profile is ${rateBand.min}–${rateBand.max}%, because ${lowerFirst(verdict.reason)}`,
    },
  };
}

module.exports = { runAssessment };
