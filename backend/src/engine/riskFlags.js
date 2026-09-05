// Flags that exist independent of how much is being asked for — they're
// about the borrower's recent track record, not this specific loan.

function evaluateRiskFlags(answers, ruleConfig) {
  const flags = [];
  const { pastBounceCount6m, existingDebtOutstanding, existingDebtAvgApr } = answers;

  if (pastBounceCount6m > 0) {
    flags.push({
      code: 'BOUNCE',
      severity: pastBounceCount6m > 1 ? 'hard' : 'soft',
      message: `${pastBounceCount6m} bounced payment(s) in the last ${ruleConfig.bounceLookbackMonths} months`,
    });
  }

  if (existingDebtOutstanding > 0 && existingDebtAvgApr >= ruleConfig.highCostDebtApr) {
    flags.push({
      code: 'HIGH_COST_DEBT',
      severity: 'hard',
      message: `Existing debt at ${existingDebtAvgApr}% — above the ${ruleConfig.highCostDebtApr}% high-cost line`,
    });
  }

  return flags;
}

module.exports = { evaluateRiskFlags };
