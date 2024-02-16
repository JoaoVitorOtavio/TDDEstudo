module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select();
    }

    const save = async (user) => {
        return app.db('users').insert(user, '*')
    };

    return { save, findAll }
}