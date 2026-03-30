import { check } from 'k6';

export function validateLoginResponse(response) {
  return check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 1500ms': (r) => r.timings.duration < 1500,
    'response body contains token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined && body.token !== null;
      } catch (e) {
        return false;
      }
    },
  });
}
