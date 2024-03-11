const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.fpDgiFwAd2vZuoAu7Z6PorEDeUcWg1EDbEDgN6FEThw'

beforeAll(async () => {
  await app.db.seed.run();
})

test('Deve listar apenas as transferencias do usuario', async () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].description).toBe('Transfer #1')
    })
})