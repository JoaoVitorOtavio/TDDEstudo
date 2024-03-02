const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db("transactions")
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
  };

  const findOne = (filter) => {
    return app.db('transactions')
      .where(filter)
      .first();
  }

  const save = (transaction) => {
    const requiredFields = [
      { field: 'description', message: 'Descricao é um atributo obrigatório' },
      { field: 'ammount', message: 'Ammount é um atributo obrigatório' },
      { field: 'date', message: 'Data é um atributo obrigatório' },
      { field: 'acc_id', message: 'Account é um atributo obrigatório' },
      { field: 'type', message: 'Tipo é um atributo obrigatório' },
    ];

    for (const { field, message } of requiredFields) {
      if (!transaction[field]) {
        throw new ValidationError(message);
      }
    }

    if (transaction.type !== 'I' && transaction.type !== 'O') {
      throw new ValidationError('Tipo invalido')
    }

    const newTransaction = { ...transaction }

    if ((transaction.type === 'I' && transaction.ammount < 0) || (transaction.type === 'O' && transaction.ammount > 0)) {
      newTransaction.ammount *= -1;
    }

    return app.db('transactions')
      .insert(newTransaction, '*')
  }

  const update = (id, transaction) => {
    return app.db('transactions')
      .where({ id })
      .update(transaction, '*')
  }

  const remove = (id) => {
    return app.db('transactions')
      .where({ id })
      .delete()
  }

  return { find, save, findOne, update, remove }
}