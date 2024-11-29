import mysql from "mysql";

import Logger from "../util/logger.js";

var mysqlClient = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 24,
  waitForConnections: true,
  queueLimit: 0,
});

mysqlClient.on("acquire", (connection) => {
  Logger.out([`Connection ${connection.threadId} acquired`]);
});

mysqlClient.on("release", (connection) => {
  Logger.out([`Connection ${connection.threadId} released`]);
});

mysqlClient.on("enqueue", () => {
  Logger.out(["Waiting available connection slot"]);
});

mysqlClient.on("error", (err) => {
  Logger.error([`Unexpected MySQL pool error:, ${JSON.stringify(err)}`]);
});

export default mysqlClient;
