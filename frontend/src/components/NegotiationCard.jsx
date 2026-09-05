import { formatINR } from '../format';

const VERDICT_LABEL = {
  borrow: 'Borrow',
  borrow_less: 'Borrow less',
  dont_borrow: "Don't borrow",
};

// The one screen meant to be shown to a lender, not just read on-screen —
// every figure a borrower needs to negotiate, nothing they don't.

function NegotiationCard({ card }) {
  return (
    <div className="negotiation-card">
      <p className="card-label">Negotiation Card</p>
      <p className="card-verdict">{VERDICT_LABEL[card.verdict]}</p>
      <p className="card-headline">{card.headline}</p>
      {card.offerComparison && <p className="card-offer">{card.offerComparison}</p>}
      <dl className="card-facts">
        <dt>Product</dt>
        <dd>{card.product}</dd>
        <dt>Amount to use</dt>
        <dd>{formatINR(card.amountToUse)}</dd>
        <dt>Fair rate</dt>
        <dd>
          {card.rateBandPct.min}–{card.rateBandPct.max}%
        </dd>
        <dt>All-in APR</dt>
        <dd>
          {card.aprBandPct.min}–{card.aprBandPct.max}%
        </dd>
        <dt>EMI ceiling</dt>
        <dd>{formatINR(card.emiCeiling)}/month</dd>
      </dl>
    </div>
  );
}

export default NegotiationCard;
