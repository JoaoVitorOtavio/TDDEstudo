const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .select();
  }

  const findOne = (filter = {}) => {
    return app.db('transfers')
      .where(filter)
      .first();
  }

  const save = async (transfer) => {
    const requiredFields = [
      { field: 'description', message: 'Descricao é um atributo obrigatório' },
      { field: 'ammount', message: 'Ammount é um atributo obrigatório' },
      { field: 'date', message: 'Data é um atributo obrigatório' },
      { field: 'acc_ori_id', message: 'Conta de origem é um atributo obrigatório' },
      { field: 'acc_dest_id', message: 'Conta de destino é um atributo obrigatório' },
    ];

    if (transfer.acc_ori_id === transfer.acc_dest_id) {
      throw new ValidationError('Conta de origem e destinos nao podem ser a mesma')
    }

    for (const { field, message } of requiredFields) {
      if (!transfer[field]) {
        throw new ValidationError(message);
      }
    }

    const result = await app.db('transfers')
      .insert(transfer, '*')
    const transferId = result[0].id;

    const transactions = [
      {
        description: `Transfer to acc #${transfer.acc_dest_id}`,
        date: transfer.date,
        ammount: transfer.ammount * -1,
        type: 'O',
        acc_id: transfer.acc_ori_id,
        transfer_id: transferId
      },
      {
        description: `Transfer from acc #${transfer.acc_ori_id}`,
        date: transfer.date,
        ammount: transfer.ammount,
        type: 'I',
        acc_id: transfer.acc_dest_id,
        transfer_id: transferId
      },
    ];

    await app.db('transactions').insert(transactions);

    return result;
  }

  const update = async (id, transfer) => {
    const result = await app.db('transfers')
      .where({ id })
      .update(transfer, '*');

    const transactions = [
      {
        description: `Transfer to acc #${transfer.acc_dest_id}`,
        date: transfer.date,
        ammount: transfer.ammount * -1,
        type: 'O',
        acc_id: transfer.acc_ori_id,
        transfer_id: id
      },
      {
        description: `Transfer from acc #${transfer.acc_ori_id}`,
        date: transfer.date,
        ammount: transfer.ammount,
        type: 'I',
        acc_id: transfer.acc_dest_id,
        transfer_id: id
      },
    ];

    await app.db('transactions').where({ transfer_id: id }).del();

    await app.db('transactions').insert(transactions);

    return result;
  }

  return { find, save, findOne, update }
}