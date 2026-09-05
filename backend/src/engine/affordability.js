// O2's two numbers. The lender ceiling is what a FOIR check alone would
// clear. The borrower-safe ceiling nets out living expenses and a savings
// buffer first, then only commits a conservative share of what's left —
// which is usually the smaller, truer number.
//
// Every field below is optional and defaults to having no effect at all
// when unanswered — silence never tightens or loosens a ceiling.

function computeAffordability(answers, foirCapPct, ruleConfig) {
  const {
    netMonthlyIncome,
    existingMonthlyEMI,
    monthlyHouseholdExpenses,
    coApplicantIncome,
    variableIncomeSharePct,
    emergencySavingsMonths,
    upcomingLargeExpense,
  } = answers;

  // A variable share of income is discounted, not trusted at face value —
  // 30% of the variable slice is treated as if it won't show up.
  const variableHaircut = variableIncomeSharePct > 0 ? (variableIncomeSharePct / 100) * 0.3 : 0;
  const effectiveIncome = netMonthlyIncome * (1 - variableHaircut) + (coApplicantIncome || 0);

  const lenderEmiCeiling = Math.max(0, (effectiveIncome * foirCapPct) / 100 - existingMonthlyEMI);

  // Answered emergency savings shifts the buffer: a healthy cushion frees
  // up room, none at all means more has to be held back.
  let bufferPct = ruleConfig.savingsBufferPct;
  if (emergencySavingsMonths >= 6) bufferPct = Math.max(0, bufferPct - 5);
  else if (emergencySavingsMonths === 0) bufferPct += 5;

  const buffer = (effectiveIncome * bufferPct) / 100;
  const largeExpenseMonthly = (upcomingLargeExpense || 0) / 12;

  const trueLeftover = Math.max(
    0,
    effectiveIncome - existingMonthlyEMI - monthlyHouseholdExpenses - buffer - largeExpenseMonthly
  );
  const borrowerSafeEmiCeiling = (trueLeftover * ruleConfig.disposableIncomeFoirCap) / 100;

  const recommendedEmiCeiling = Math.min(lenderEmiCeiling, borrowerSafeEmiCeiling);

  return { lenderEmiCeiling, borrowerSafeEmiCeiling, recommendedEmiCeiling };
}

module.exports = { computeAffordability };
