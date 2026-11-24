const request = require('supertest');
const app = require('../app');

test('la página principal responde', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
});