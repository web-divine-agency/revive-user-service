import mysqlClient from "../config/mysql.js";

var table = process.env.npm_config_table;

var fields = {
  users: [
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "created_at TIMESTAMP NOT NULL",
    "created_at_order DOUBLE NOT NULL",
    "updated_at TIMESTAMP NOT NULL",
    "updated_at_order DOUBLE NOT NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
    "first_name VARCHAR(255) NOT NULL",
    "middle_name VARCHAR(255) NULL",
    "last_name VARCHAR(255) NOT NULL",
    "email VARCHAR(255) NOT NULL UNIQUE",
    "type VARCHAR(255) NOT NULL",
    "firebase_uid VARCHAR(255) NOT NULL",
    "session TEXT NULL",
    "session_expiration DOUBLE NULL",
  ],
};

mysqlClient.query(`create table ${table} (${[...fields[table]]})`, function (err, result) {
  if (err) throw err;
  console.log(`${table} table: success`);
  process.exit();
});
