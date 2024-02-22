const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple')

const MAIN_ROUTE = '/accounts';
let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@mail.com`,
    password: '123123'
  })

  user = { ...res[0] };
  user.token = jwt.encode(user, 'Secret super secreto')
});

test('Deve inserir uma conta com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Acc #1', user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Acc #1');
    })
});

test('Nao deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ user_id: user.id })
    .set('authorization', `bearer ${user.token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Nome e um atributo obrigatorio');
    })
})

test('Deve listar todas as contas', () => {
  return app.db('accounts')
    .insert({ name: 'Acc list', user_id: user.id })
    .then(() => request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      }))
})

test('Deve retornar uma conta por id', () => {
  return app.db('accounts')
    .insert({ name: 'Acc By Id', user_id: user.id }, ['id'])
    .then((result) => request(app).get(`${MAIN_ROUTE}/${result[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Acc By Id');
        expect(res.body.user_id).toBe(user.id);
      }))
})

test('Deve alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
    .then((result) => request(app).put(`${MAIN_ROUTE}/${result[0].id}`)
      .send({ name: 'Acc updated' })
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(200)
        expect(res.body.name).toBe('Acc updated')
      }))
})

test('Deve remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'Acc to remove', user_id: user.id }, ['id'])
    .then((result) => request(app).delete(`${MAIN_ROUTE}/${result[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
        expect(res.status).toBe(204);
      }))
})