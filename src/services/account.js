const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
  const save = async (account) => {
    if (!account.name) {
      throw new ValidationError('Nome e um atributo obrigatorio');
    }
    return app.db('accounts').insert(account, '*');
  }

  const findAll = (user_id) => {
    return app.db('accounts').where({ user_id });
  }

  const get = (filter = {}) => {
    return app.db('accounts').where(filter).first()
  }

  const update = (id, account) => {
    return app.db('accounts')
      .where({ id })
      .update(account, '*')
  }

  const remove = (id) => {
    return app.db('accounts')
      .where({ id })
      .delete()
  }

  return { save, findAll, get, update, remove }
}