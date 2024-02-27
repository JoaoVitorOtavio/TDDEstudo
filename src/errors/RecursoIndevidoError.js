module.exports = function RecursoIndevidoError(message = 'Este recurso nao pertence ao usuario') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
}
