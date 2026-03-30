import { check } from 'k6';

export function validateLoginResponse(response) {
  return check(response, {
    'status is 201 or 401': (r) => r.status === 201 || r.status === 401,
    'response time < 1500ms': (r) => r.timings.duration < 1500,
    'valid credentials return token': (r) => {
      if (r.status === 401) return true; // expected for invalid creds
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined && body.token !== null;
      } catch (e) {
        return false;
      }
    },
    'no server errors (5xx)': (r) => r.status < 500,
  });
}
