const request = require("supertest");
const jwt = require("jwt-simple")
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/transactions';

let user;
let accUser;

let user2;
let accUser2;


beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();

  const users = await app.db('users').insert([
    { name: 'User #1', mail: 'user@mail.com', password: '$2a$10$1GOjmbpxFMtPDMMKZmMPR.tiJtf43xhtVUi8Tey/bSwoheQcJV05S' },
    { name: 'User #2', mail: 'user2@mail.com', password: '$2a$10$1GOjmbpxFMtPDMMKZmMPR.tiJtf43xhtVUi8Tey/bSwoheQcJV05S' }
  ], '*');

  [user, user2] = users;
  delete user.password;

  user.token = jwt.encode(user, 'Secret super secreto')

  const accs = await app.db('accounts').insert([
    { name: 'Acc #1', user_id: user.id },
    { name: 'Acc #2', user_id: user2.id },
  ], '*');

  [accUser, accUser2] = accs;
});

test('Deve listar apenas as transacoes do usuario', () => {
  return app.db('transactions').insert([
    { description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id },
    { description: 'T2', date: new Date(), ammount: 300, type: 'O', acc_id: accUser2.id },
  ]).then(() => request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].description).toBe('T1')
    })
  )
})

test("Deve inserir uma transacao com sucesso", () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .send({ description: 'New T', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id })
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.acc_id).toBe(accUser.id);
    })
})

test("Deve retornar uma transacao por ID", () => {
  return app.db('transactions').insert({ description: 'T ID', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'])
    .then(transac => request(app).get(`${MAIN_ROUTE}/${transac[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
        expect(result.status).toBe(200);
        expect(result.body.id).toBe(transac[0].id);
        expect(result.body.description).toBe('T ID');
      }))
})

test('Deve alterar uma transaction com sucesso', () => {
  return app.db('transactions').insert({ description: 'New T', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id }, ['id'])
    .then(transac => request(app).put(`${MAIN_ROUTE}/${transac[0].id}`)
      .send({ description: 'Updated T' })
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body[0].description).toBe('Updated T')
      })
    )
})

test('Deve remover uma transacao', () => {
  return app.db('transactions').insert({ description: 'New T to remove', date: new Date(), ammount: 150, type: 'I', acc_id: accUser.id }, ['id'])
    .then(transac => request(app).delete(`${MAIN_ROUTE}/${transac[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(204)
      })
    )
})
test('Nao deve alterar uma transacao de outro usuario', () => {
  return app.db('transactions').insert({ description: 'New Transactions', date: new Date(), ammount: 150, type: 'I', acc_id: accUser2.id }, ['id'])
    .then(transac => request(app).delete(`${MAIN_ROUTE}/${transac[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe("Este recurso nao pertence ao usuario")
      })
    )
})

