/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
    return knex.schema.createTable('users', (t) => {
        t.increments('id');
        t.string('name').notNullable();
        t.string('mail').notNullable().unique();
        t.string('password').notNullable();
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
    return knex.schema.dropTable('users')
};
