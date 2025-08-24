import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 }, // Stay at 10 users for 5 minutes
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 0 },  // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export function setup() {
  // Login and get auth token
  let loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  if (loginRes.status === 200) {
    return { token: loginRes.json('token') };
  }
  return {};
}

export default function(data) {
  let headers = {};
  if (data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }

  // Test health endpoint
  let healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Test products endpoint
  let productsRes = http.get(`${BASE_URL}/api/products`, { headers });
  check(productsRes, {
    'products status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Test categories endpoint
  let categoriesRes = http.get(`${BASE_URL}/api/categories`, { headers });
  check(categoriesRes, {
    'categories status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(1);
}