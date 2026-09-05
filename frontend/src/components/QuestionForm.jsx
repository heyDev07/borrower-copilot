import { useState } from 'react';
import QuestionField from './QuestionField';

function applies(question, employmentType) {
  return question.appliesTo.includes('all') || question.appliesTo.includes(employmentType);
}

// The must-question set, adaptive from the first answer: picking an
// employment type immediately changes which later questions show up
// (e.g. incomeProofType only appears for self-employed/informal).

function QuestionForm({ questions, onSubmit }) {
  const [answers, setAnswers] = useState({});

  const mustQuestions = questions
    .filter((q) => q.tier === 'must')
    .filter((q) => applies(q, answers.employmentType))
    .sort((a, b) => a.order - b.order);

  function handleChange(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(answers);
  }

  const allAnswered = mustQuestions.every((q) => answers[q.qid] !== undefined && answers[q.qid] !== '');

  return (
    <form onSubmit={handleSubmit} className="question-form">
      {mustQuestions.map((q) => (
        <QuestionField key={q.qid} question={q} value={answers[q.qid]} onChange={handleChange} />
      ))}
      <button type="submit" disabled={!allAnswered}>
        See my numbers
      </button>
    </form>
  );
}

export default QuestionForm;
