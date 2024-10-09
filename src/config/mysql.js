import mysql from "mysql";

import Logger from "../util/logger.js";

var mysqlClient = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

mysqlClient.connect(function (err) {
  if (err) {
    Logger.out([JSON.stringify(err)]);
  }
  Logger.out([`Connected to ${process.env.MYSQL_DATABASE}`]);
});

export default mysqlClient;
