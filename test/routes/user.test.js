const request = require('supertest');

const app = require('../../src/app');

const mail = `${Date.now()}@mail.com`
test("Deve listar todos os usuarios", async () => {
	return request(app).get('/users')
		.then((res) => {
			expect(res.status).toBe(200);
			expect(res.body.length).toBeGreaterThan(0);
		});
})

test('deve inserir usuario com sucesso', async () => {
	return request(app).post('/users')
		.send({ name: 'Walter Mitty', mail, password: '123123' })
		.then((res) => {
			expect(res.status).toBe(201);
			expect(res.body.name).toBe('Walter Mitty')
			expect(res.body).not.toHaveProperty('password')
		})
})

test('Deve armazenar senha criptografada', async () => {
	const res = await request(app).post('/users')
		.send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, password: '123123' });

	expect(res.status).toBe(201);

	const { id } = res.body;
	const userDb = await app.services.user.findOne({ id });
	expect(userDb.password).not.toBeUndefined();
	expect(userDb.password).not.toBe('123123');
})

test('Nao deve inserir usuario sem nome', async () => {
	return request(app).post('/users')
		.send({ mail, password: '123123' })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Nome é um atributo obrigatorio')
		})
})

test('Nao deve inserir usuario sem email', async () => {
	const result = await request(app).post('/users')
		.send({ name: 'Walter Mitty', password: '123123' })

	expect(result.status).toBe(400);
	expect(result.body.error).toBe('Email é um atributo obrigatorio')
})

test("Nao deve inserir usuario sem senha", (done) => {
	request(app).post('/users')
		.send({ name: 'Walter Mitty', mail })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Senha é um atributo obrigatorio')
			done();
		})
})

test('Nao deve inserir usuario com email existente', async () => {
	return request(app).post('/users')
		.send({ name: 'Walter Mitty', mail, password: "123123" })
		.then((res) => {
			expect(res.status).toBe(400);
			expect(res.body.error).toBe('Ja existe um usuario com esse email')
		})
})