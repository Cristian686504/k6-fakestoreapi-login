import http from 'k6/http';
import { BASE_URL } from '../config/options.js';

const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;

const HEADERS = {
  'Content-Type': 'application/json',
};

export function login(username, password) {
  const payload = JSON.stringify({
    username: username,
    password: password,
  });

  const response = http.post(LOGIN_ENDPOINT, payload, {
    headers: HEADERS,
    timeout: '60s',
    tags: { name: 'login' },
  });

  return response;
}
