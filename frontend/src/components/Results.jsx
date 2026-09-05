import { formatINR } from '../format';
import NegotiationCard from './NegotiationCard';
import AdditionalQuestions from './AdditionalQuestions';

const VERDICT_LABEL = {
  borrow: 'Borrow',
  borrow_less: 'Borrow less',
  dont_borrow: "Don't borrow",
};

function Results({ result, answers, questions, onNarrow }) {
  const { outputs, negotiationCard, confidence, riskFlags } = result;

  return (
    <div className="results">
      <p className={`confidence confidence-${confidence}`}>Confidence: {confidence}</p>

      <section className="output">
        <h2>O1 · {VERDICT_LABEL[outputs.O1.decision]}</h2>
        <p>{outputs.O1.reason}</p>
      </section>

      <section className="output">
        <h2>O2 · How much</h2>
        <p>
          A lender might sanction up to <b>{formatINR(outputs.O2.lenderMaxAmount)}</b>. Use{' '}
          <b>{formatINR(outputs.O2.borrowerSafeMaxAmount)}</b> instead — it's the safer number.
        </p>
        <p className="why">{outputs.O2.reason}</p>
      </section>

      <section className="output">
        <h2>O3 · Fair rate</h2>
        <p>
          <b>
            {outputs.O3.rateBandPct.min}–{outputs.O3.rateBandPct.max}%
          </b>{' '}
          on a {outputs.O3.product}, all-in APR{' '}
          <b>
            {outputs.O3.aprBandPct.min}–{outputs.O3.aprBandPct.max}%
          </b>
          .
        </p>
        <p className="why">{outputs.O3.reason}</p>
      </section>

      <section className="output">
        <h2>O4 · EMI ceiling</h2>
        <p>
          Don't cross <b>{formatINR(outputs.O4.emiCeiling)}/month</b>.
        </p>
        <p className="why">{outputs.O4.reason}</p>
        <ul className="tenure-options">
          {outputs.O4.tenureOptions.map((t) => (
            <li key={t.months}>
              {t.months} months → {formatINR(t.emi)}/month
            </li>
          ))}
        </ul>
        <p className="stress">
          Stress test ({outputs.O4.stress.assumption}):{' '}
          {outputs.O4.stress.stillAffordable ? 'still affordable.' : 'would no longer be affordable.'}
        </p>
      </section>

      {riskFlags.length > 0 && (
        <section className="output risk-flags">
          <h2>Flags</h2>
          <ul>
            {riskFlags.map((f) => (
              <li key={f.code}>{f.message}</li>
            ))}
          </ul>
        </section>
      )}

      <NegotiationCard card={negotiationCard} />

      <AdditionalQuestions
        questions={questions}
        employmentType={answers.employmentType}
        answeredQids={Object.keys(answers)}
        onNarrow={onNarrow}
      />
    </div>
  );
}

export default Results;
