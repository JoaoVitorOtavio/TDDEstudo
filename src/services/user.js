module.exports = (app) => {
	const findAll = () => {
		return app.db('users').select();
	}

	const save = async (user) => {
		if (!user.name) {
			return { error: 'Nome é um atributo obrigatorio' }
		}

		if (!user.mail) {
			return { error: 'Email é um atributo obrigatorio' }
		}

		if (!user.password) {
			return { error: 'Senha é um atributo obrigatorio' }
		}

		return app.db('users').insert(user, '*')
	};

	return { save, findAll }
}