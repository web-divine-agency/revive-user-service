import mysql from "mysql";

var mysqlClient = mysql.createPool({
  host: "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 24,
  waitForConnections: true,
  queueLimit: 0,
});

var enums = [
  "create_users_table",
  "create_permissions_table",
  "create_roles_table",
  "create_role_permissions_table",
  "create_user_roles_table",
  "create_user_branches_table",
  "create_user_templates_table",
  "create_reset_passwords_table",
];

var statements = [
  // create_users_table
  `CREATE TABLE users (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "first_name VARCHAR(255) NOT NULL",
    "last_name VARCHAR(255) NOT NULL",
    "gender VARCHAR(255) NULL",
    "username VARCHAR(255) NOT NULL UNIQUE",
    "email VARCHAR(255) NOT NULL UNIQUE",
    "mobile VARCHAR(255) NULL",
    "password VARCHAR(255) NOT NULL",
    "verified_at TIMESTAMP NULL",
    "verified_at_order DOUBLE NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_permissions_table
  `CREATE TABLE permissions (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "name VARCHAR(255) NOT NULL",
    "description TEXT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_roles_table
  `CREATE TABLE roles (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "name VARCHAR(255) NOT NULL",
    "description TEXT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_role_permissions_table
  `CREATE TABLE role_permissions (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "role_id BIGINT UNSIGNED NOT NULL",
    "permission_id BIGINT UNSIGNED NOT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_user_roles_table
  `CREATE TABLE user_roles (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "user_id BIGINT UNSIGNED NOT NULL",
    "role_id BIGINT UNSIGNED NOT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_user_branches_table
  `CREATE TABLE user_branches (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "user_id BIGINT UNSIGNED NOT NULL",
    "branch_id BIGINT UNSIGNED NOT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_user_templates_table
  `CREATE TABLE user_templates (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "user_id BIGINT UNSIGNED NOT NULL",
    "template_id BIGINT UNSIGNED NOT NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
  // create_reset_passwords_table
  `CREATE TABLE reset_passwords (${[
    "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY",
    "user_id BIGINT UNSIGNED NOT NULL",
    "token VARCHAR(255) NOT NULL",
    "expires_at TIMESTAMP NULL",
    "expires_at_order DOUBLE NULL",
    "created_at TIMESTAMP NULL",
    "created_at_order DOUBLE NULL",
    "updated_at TIMESTAMP NULL",
    "updated_at_order DOUBLE NULL",
    "deleted_at TIMESTAMP NULL",
    "deleted_at_order DOUBLE NULL",
  ]})`,
];

if (process.argv[2]) {
  mysqlClient.getConnection((err, con) => {
    if (err) throw err;

    con.query(statements[enums.indexOf(process.argv[2])], function (e) {
      con.release();

      if (e) throw e;
      console.log("Success");
    });
  });
} else {
  statements.forEach((statement) => {
    mysqlClient.getConnection((err, con) => {
      if (err) throw err;

      con.query(statement, function (e) {
        con.release();

        if (e) throw e;
        console.log("Success");
      });
    });
  });
}
