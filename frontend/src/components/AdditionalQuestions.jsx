import { useState } from 'react';
import QuestionField from './QuestionField';

function applies(question, employmentType) {
  return question.appliesTo.includes('all') || question.appliesTo.includes(employmentType);
}

// The adaptive loop, as a form: whatever's answered here gets merged in
// and the engine re-runs, narrowing only the outputs those answers touch.

function AdditionalQuestions({ questions, employmentType, answeredQids, onNarrow }) {
  const [draft, setDraft] = useState({});

  const applicable = questions
    .filter((q) => q.tier === 'additional')
    .filter((q) => applies(q, employmentType))
    .filter((q) => !answeredQids.includes(q.qid))
    .sort((a, b) => a.order - b.order);

  if (applicable.length === 0) return null;

  function handleChange(qid, value) {
    setDraft((prev) => ({ ...prev, [qid]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onNarrow(draft);
  }

  const hasAnyAnswer = Object.values(draft).some((v) => v !== undefined && v !== '');

  return (
    <form onSubmit={handleSubmit} className="question-form additional-questions">
      <h2>Answer more to narrow this</h2>
      <p className="hint">
        Every question here moves at least one number above. Skip whatever you don't know.
      </p>
      {applicable.map((q) => (
        <QuestionField key={q.qid} question={q} value={draft[q.qid]} onChange={handleChange} />
      ))}
      <button type="submit" disabled={!hasAnyAnswer}>
        Narrow my numbers
      </button>
    </form>
  );
}

export default AdditionalQuestions;
