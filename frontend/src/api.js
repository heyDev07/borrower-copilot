const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function getJson(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}

export function getHealth() {
  return getJson('/health');
}

export function getQuestions() {
  return getJson('/questions');
}

export function postAssess(answers) {
  return getJson('/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
}
