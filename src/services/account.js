module.exports = (app) => {
  const save = (account) => {
    return app.db('accounts').insert(account, '*');
  }

  const findAll = () => {
    return app.db('accounts');
  }

  const get = (filter = {}) => {
    return app.db('accounts').where(filter).first()
  }

  return { save, findAll, get }
}