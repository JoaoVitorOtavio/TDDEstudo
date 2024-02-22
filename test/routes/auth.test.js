const request = require('supertest');
const app = require('../../src/app')

test('Deve criar usuario via signup', () => {
  return request(app).post('/auth/signup')
    .send({ name: 'Walter', mail: `${Date.now()}@mail.com`, password: '123123' })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter')
      expect(res.body).toHaveProperty('mail')
      expect(res.body).not.toHaveProperty('password')
    })
})

test('Deve receber token ao logar', () => {
  const mail = `${Date.now()}@mail.com`;

  return app.services.user.save(
    {
      name: 'Walter',
      mail,
      password: '123123'
    })
    .then(() => {
      request(app).post('/auth/signin')
        .send({ mail, password: '123123' })
        .then((res) => {
          expect(res.status).toBe(200)
          expect(res.body).toHaveProperty('token')
        })
    })
})

test('Não deve autenticar usuario com senha errada', () => {
  const mail = `${Date.now()}@mail.com`;

  return app.services.user.save(
    {
      name: 'Walter',
      mail,
      password: '123123'
    })
    .then(() => {
      request(app).post('/auth/signin')
        .send({ mail, password: '456456' })
        .then((res) => {
          expect(res.status).toBe(400)
          expect(res.body.error).toBe('Usuario ou senha errado')
        })
    })
})

test('Não deve autenticas usuario nao existente', () => {
  const mail = `usuarionaoexistente@mail.com`;

  return request(app).post('/auth/signin')
    .send({ mail, password: '456456' })
    .then((res) => {
      expect(res.status).toBe(400)
      expect(res.body.error).toBe('Usuario ou senha errado')
    })
})

test('Nao deve acessar uma rota protegida sem token', () => {
  return request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(401);
    })
})