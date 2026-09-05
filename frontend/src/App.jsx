import { useEffect, useState } from 'react';
import { getHealth, getQuestions, postAssess } from './api';
import QuestionForm from './components/QuestionForm';
import Results from './components/Results';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('unreachable'));
    getQuestions()
      .then(setQuestions)
      .catch(() => setError('Could not load questions from the backend.'));
  }, []);

  async function runAssessment(nextAnswers) {
    setError(null);
    const merged = { ...answers, ...nextAnswers };
    try {
      const data = await postAssess(merged);
      setAnswers(merged);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">Borrower Copilot</p>
        <h1>Know what's fair before you walk in.</h1>
        <p className={`status status-${backendStatus}`}>Backend: {backendStatus}</p>
      </header>

      {error && <p className="error">{error}</p>}

      {!result && questions.length > 0 && <QuestionForm questions={questions} onSubmit={runAssessment} />}

      {result && <Results result={result} answers={answers} questions={questions} onNarrow={runAssessment} />}
    </div>
  );
}

export default App;
