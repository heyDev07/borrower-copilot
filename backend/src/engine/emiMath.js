// Standard reducing-balance EMI formula, used both directions:
// given a principal find the EMI, or given an EMI ceiling find the
// principal it can support.

function emiForPrincipal(principal, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  const factor = (1 + r) ** tenureMonths;
  return (principal * r * factor) / (factor - 1);
}

function principalForEmi(emi, annualRatePct, tenureMonths) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return emi * tenureMonths;
  const factor = (1 + r) ** tenureMonths;
  return (emi * (factor - 1)) / (r * factor);
}

module.exports = { emiForPrincipal, principalForEmi };
