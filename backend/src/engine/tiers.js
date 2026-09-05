// Turns raw answers into the two tiers everything else keys off:
// how risky the income is, and how risky the credit history is.
// An unknown credit score is always "low" — never assumed good.

function employmentKey(employmentType, incomeProofType) {
  if (employmentType === 'salaried') return 'salaried';
  if (employmentType === 'self_employed') {
    return incomeProofType === 'itr' ? 'self_employed_itr' : 'self_employed_cash';
  }
  return 'informal';
}

function creditTier(creditScore, creditScoreTiers) {
  if (!creditScore) return 'low';
  if (creditScore >= creditScoreTiers.high) return 'high';
  if (creditScore >= creditScoreTiers.mid) return 'mid';
  return 'low';
}

module.exports = { employmentKey, creditTier };
