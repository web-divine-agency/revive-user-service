import mysql from "mysql";

import Logger from "../util/logger.js";

var mysqlClient = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
});

mysqlClient.connect(function (err) {
  if (err) throw err;
  Logger.out([`Connected to ${process.env.MYSQL_DB}`]);
});

export default mysqlClient;
