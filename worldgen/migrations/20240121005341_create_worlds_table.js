exports.up = function(knex) {
    return knex.schema.createTable('worlds', table => {
      table.increments('id').primary();
      table.string('name');
      table.text('description');
      table.integer('size');
      table.string('hex_color').defaultTo('#404040'); 
    });
  };
  
exports.down = function(knex) {
    return knex.schema.dropTable('worlds');
};
