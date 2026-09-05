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
  const rateBand = computeRateBand(tier, riskFlags, product);
  const aprBand = computeAprBand(rateBand, product);
  const midRate = (rateBand.min + rateBand.max) / 2;

  const emiForRequestedAmount = emiForPrincipal(answers.loanAmountRequested, midRate, product.maxTenureMonths);

  const verdict = computeVerdict({
    loanAmountRequested: answers.loanAmountRequested,
    recommendedEmiCeiling: affordability.recommendedEmiCeiling,
    emiForRequestedAmount,
    riskFlags,
  });

  const lenderMaxAmount = principalForEmi(affordability.lenderEmiCeiling, midRate, product.maxTenureMonths);
  const borrowerSafeMaxAmount = principalForEmi(affordability.borrowerSafeEmiCeiling, midRate, product.maxTenureMonths);

  const tenureOptions = [0.25, 0.5, 1].map((fraction) => {
    const months = Math.max(6, Math.round((product.maxTenureMonths * fraction) / 6) * 6);
    return { months, emi: Math.round(emiForPrincipal(answers.loanAmountRequested, midRate, months)) };
  });

  const stressedIncome = answers.netMonthlyIncome * (1 - ruleConfig.stressIncomeDropPct / 100);
  const stressedAffordability = computeAffordability(
    { ...answers, netMonthlyIncome: stressedIncome },
    foirCapPct,
    ruleConfig
  );
  const stressedRate = midRate + ruleConfig.stressRateRisePct;
  const stressedEmiForRequested = emiForPrincipal(answers.loanAmountRequested, stressedRate, product.maxTenureMonths);

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
        reason: `${product.label} for a "${tier}" credit tier, with the processing fee spread over ${product.maxTenureMonths} months folded into the APR.`,
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
      headline: `Fair for your profile is ${rateBand.min}–${rateBand.max}%, because ${lowerFirst(verdict.reason)}`,
    },
  };
}

module.exports = { runAssessment };
