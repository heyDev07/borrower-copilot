// Collateral wins regardless of purpose: if what's offered covers the
// loan within the LTV ceiling, that's a materially cheaper product and
// the borrower should be routed there even if they didn't ask for it.

function routeProduct(answers, products, ruleConfig) {
  const { purpose, collateralValue, loanAmountRequested } = answers;

  if (collateralValue > 0) {
    const ltvPct = (loanAmountRequested / collateralValue) * 100;
    if (ltvPct <= ruleConfig.secureLoanMaxLTV) {
      const secured = products.find((p) => p.key === 'secured_lap_gold');
      if (secured) return secured;
    }
  }

  const key =
    purpose === 'vehicle' ? 'two_wheeler' : purpose === 'business' ? 'business_unsecured' : 'personal_unsecured';

  return products.find((p) => p.key === key);
}

module.exports = { routeProduct };
