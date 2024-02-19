// const knexLogger = require('knex-logger')
const bodyParser = require('body-parser')


module.exports = (app) => {
    app.use(bodyParser.json())
    // app.use(knexLogger(app.db))
};
