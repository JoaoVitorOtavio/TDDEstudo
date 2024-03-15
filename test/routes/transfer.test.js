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

test('Deve inserir uma transferencia com sucesso', async () => {
  return request(app).post(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN}`)
    .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
    .then(async (res) => {
      expect(res.status).toBe(201)
      expect(res.body.description).toBe('Regular Transfer')

      const transactions = await app.db('transactions').where({ transfer_id: res.body.id })
      expect(transactions).toHaveLength(2)
      expect(transactions[0].description).toBe('Transfer to acc #10001')
      expect(transactions[1].description).toBe('Transfer from acc #10000')
      expect(transactions[0].ammount).toBe('-100.00')
      expect(transactions[1].ammount).toBe('100.00')
      expect(transactions[0].acc_id).toBe(10000)
      expect(transactions[1].acc_id).toBe(10001)
    })
})

describe('Ao salvar uma transferencia valida...', () => {
  let transferId;
  let income;
  let outcome;

  test('deve retornar o status 201 e os dados da transferencia', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date() })
      .then(async (res) => {
        expect(res.status).toBe(201)
        expect(res.body.description).toBe('Regular Transfer')
        transferId = res.body.id;
      })
  })

  test('As transacoes aquivalentes devem ter sido geradas', async () => {
    const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('ammount')
    expect(transactions).toHaveLength(2)

    outcome = transactions[0];
    income = transactions[1];
  });

  test('A transacao de saida deve ser negativa', () => {
    expect(outcome.description).toBe('Transfer to acc #10001')
    expect(outcome.ammount).toBe('-100.00')
    expect(outcome.acc_id).toBe(10000)
    expect(outcome.type).toBe('O')
  })

  test('A transacao de emtrada deve ser positiva', () => {
    expect(income.description).toBe('Transfer from acc #10000')
    expect(income.ammount).toBe('100.00')
    expect(income.acc_id).toBe(10001)
    expect(income.type).toBe('I')
  })

  test('Ambas devem referenciar a transferencia que as originou', () => {
    expect(income.transfer_id).toBe(transferId)
    expect(outcome.transfer_id).toBe(transferId)
  })
})

describe('Ao tenta salvar uma transferencia invalida...', () => {
  let validTransfer = {
    description: 'Regular Transfer',
    user_id: 10000,
    acc_ori_id: 10000,
    acc_dest_id: 10001,
    ammount: 100,
    date: new Date()
  }

  const transferReqTemplate = async (newData, errorMessage) => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...validTransfer, ...newData })
      .then(async (res) => {
        expect(res.status).toBe(400)
        expect(res.body.error).toBe(errorMessage)
      })
  }
  test('Nao deve inserir sem descricao', () => {
    transferReqTemplate({ description: null }, 'Descricao é um atributo obrigatório')
  })
  test('Nao deve inserir sem valor', () => {
    transferReqTemplate({ ammount: null }, 'Ammount é um atributo obrigatório')
  })
  test('Nao deve inserir sem data', () => {
    transferReqTemplate({ date: null }, 'Data é um atributo obrigatório')
  })
  test('Nao deve inserir sem conta de origem', () => {
    transferReqTemplate({ acc_ori_id: null }, 'Conta de origem é um atributo obrigatório')
  })
  test('Nao deve inserir sem conta de destino', () => {
    transferReqTemplate({ acc_dest_id: null }, 'Conta de destino é um atributo obrigatório')
  })
  test('Nao deve inserir se as conta de origem e destino forem as mesmas', () => {
    transferReqTemplate({ acc_ori_id: 1, acc_dest_id: 1 }, 'Conta de origem e destinos nao podem ser a mesma')
  })
})

test('Deve retornar uma transferencia por Id', () => {
  // transfer already on the seed
  return request(app).get(`${MAIN_ROUTE}/10000`)
    .set('authorization', `bearer ${TOKEN}`)
    .then((res) => {
      expect(res.status).toBe(200)
      expect(res.body.description).toBe('Transfer #1')
    })
})