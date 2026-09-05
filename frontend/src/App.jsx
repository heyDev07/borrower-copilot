import { useEffect, useState } from 'react';
import { getHealth } from './api';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    getHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('unreachable'));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">Borrower Copilot</p>
        <h1>Know what's fair before you walk in.</h1>
      </header>

      <p className={`status status-${backendStatus}`}>
        Backend: {backendStatus}
      </p>
    </div>
  );
}

export default App;
