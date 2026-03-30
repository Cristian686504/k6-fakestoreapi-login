import { options, users } from '../config/options.js';
import { login } from '../helpers/requests.js';
import { validateLoginResponse } from '../helpers/checks.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

export { options };

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];

  const response = login(user.user, user.passwd);

  validateLoginResponse(response);
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
    [`reports/summary_${timestamp}.json`]: JSON.stringify(data, null, 2),
    'reports/latest_summary.json': JSON.stringify(data, null, 2),
  };
}
