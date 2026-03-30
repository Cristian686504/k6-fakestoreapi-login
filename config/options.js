import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import http from 'k6/http';

const BASE_URL = 'https://fakestoreapi.com';

const TARGET_TPS = 20;
const MAX_RESPONSE_TIME_MS = 1500;
const MAX_ERROR_RATE_PERCENT = 3;


http.setResponseCallback(http.expectedStatuses(201));

export const options = {
  scenarios: {
    login_load_test: {
      executor: 'constant-arrival-rate',
      rate: TARGET_TPS,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: [`p(95)<${MAX_RESPONSE_TIME_MS}`],
    http_req_failed: [`rate<${MAX_ERROR_RATE_PERCENT / 100}`],
  },
};

export const users = new SharedArray('users', function () {
  const file = open('../data/users.csv');
  return papaparse.parse(file, { header: true }).data;
});

export { BASE_URL, TARGET_TPS, MAX_RESPONSE_TIME_MS, MAX_ERROR_RATE_PERCENT };
