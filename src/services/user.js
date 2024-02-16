module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select();
    }

    const save = async (user) => {
        if (!user.name) {
            return { error: 'Nome é um atributo obrigatorio' }
        }
        return app.db('users').insert(user, '*')
    };

    return { save, findAll }
}