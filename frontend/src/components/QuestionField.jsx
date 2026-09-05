// Renders one input for one question from the API's question bank —
// the shape of the field comes entirely from `inputType`, never
// hardcoded per question, so a new question needs no frontend change.

function QuestionField({ question, value, onChange }) {
  const { qid, text, inputType, options } = question;

  if (inputType === 'select') {
    return (
      <label className="field">
        <span>{text}</span>
        <select value={value ?? ''} onChange={(e) => onChange(qid, e.target.value)}>
          <option value="" disabled>
            Choose one
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (inputType === 'boolean') {
    return (
      <label className="field field-checkbox">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(qid, e.target.checked)} />
        <span>{text}</span>
      </label>
    );
  }

  return (
    <label className="field">
      <span>{text}</span>
      <input
        type={inputType === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => onChange(qid, inputType === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </label>
  );
}

export default QuestionField;
