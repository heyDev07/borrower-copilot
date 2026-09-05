// O2's two numbers. The lender ceiling is what a FOIR check alone would
// clear. The borrower-safe ceiling nets out living expenses and a savings
// buffer first, then only commits a conservative share of what's left —
// which is usually the smaller, truer number.

function computeAffordability(answers, foirCapPct, ruleConfig) {
  const { netMonthlyIncome, existingMonthlyEMI, monthlyHouseholdExpenses } = answers;

  const lenderEmiCeiling = Math.max(0, (netMonthlyIncome * foirCapPct) / 100 - existingMonthlyEMI);

  const buffer = (netMonthlyIncome * ruleConfig.savingsBufferPct) / 100;
  const trueLeftover = Math.max(0, netMonthlyIncome - existingMonthlyEMI - monthlyHouseholdExpenses - buffer);
  const borrowerSafeEmiCeiling = (trueLeftover * ruleConfig.disposableIncomeFoirCap) / 100;

  const recommendedEmiCeiling = Math.min(lenderEmiCeiling, borrowerSafeEmiCeiling);

  return { lenderEmiCeiling, borrowerSafeEmiCeiling, recommendedEmiCeiling };
}

module.exports = { computeAffordability };
