import mysqlClient from "../config/mysql.js";

var table = process.env.npm_config_table;

var fields = {
  users: [
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "type VARCHAR(255) NOT NULL",
    "first_name VARCHAR(255) NOT NULL",
    "middle_name VARCHAR(255) NULL",
    "last_name VARCHAR(255) NOT NULL",
    "email VARCHAR(255) NOT NULL UNIQUE",
    "mobile VARCHAR(255) NULL",
    "password VARCHAR(255) NOT NULL",
    "verified_at TIMESTAMP NULL",
    "verified_at_order DOUBLE NULL",
    "created_at TIMESTAMP NOT NULL",
    "created_at_order DOUBLE NOT NULL",
    "updated_at TIMESTAMP NOT NULL",
    "updated_at_order DOUBLE NOT NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ],
};

mysqlClient.query(`create table ${table} (${[...fields[table]]})`, function (err) {
  if (err) throw err;
  console.log(`${table} table: success`);
  process.exit();
});
