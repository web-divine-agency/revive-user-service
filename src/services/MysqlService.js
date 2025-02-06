import moment from "moment";

import mysqlClient from "../config/mysql.js";

export default {
  /**
   * Select resource(s)
   * @param {*} query
   * @returns
   */
  select: (query) => {
    return new Promise((resolve, reject) => {
      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        con.query(query, (e, result) => {
          con.release();

          if (e) {
            return reject(e);
          }
          return resolve(result);
        });
      });
    });
  },

  /**
   * Create resource
   * @param {*} table
   * @param {*} data
   * @returns
   */
  create: (table, data) => {
    let date = moment();
    data.created_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.created_at_order = parseInt(date.format("YYYYMMDDHHmmss"));
    data.updated_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.updated_at_order = parseInt(date.format("YYYYMMDDHHmmss"));

    return new Promise((resolve, reject) => {
      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        con.query(
          `INSERT INTO ${table} (${Object.keys(data)}) VALUES ?`,
          [[Object.values(data)]],
          (e, result) => {
            con.release();

            if (e) {
              return reject(e);
            }
            return resolve(result);
          }
        );
      });
    });
  },

  /**
   * Update resource
   * @param {*} table
   * @param {*} data
   * @param {*} params
   * @returns
   */
  update: (table, data, params) => {
    let date = moment();
    data.created_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.created_at_order = parseInt(date.format("YYYYMMDDHHmmss"));
    data.updated_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.updated_at_order = parseInt(date.format("YYYYMMDDHHmmss"));

    return new Promise((resolve, reject) => {
      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        // Convert data object into a WHERE clause
        let where = Object.entries(params)
          .map(([key]) => `${key} = ?`)
          .join(" AND ");

        con.query(
          `UPDATE ${table} SET ? WHERE ${where}`,
          [data, ...Object.values(params)],
          (e, result) => {
            con.release();

            if (e) {
              return reject(e);
            }
            return resolve(result);
          }
        );
      });
    });
  },

  /**
   * Delete resource
   * @param {*} table
   * @param {*} id
   * @returns
   */
  delete: (table, params) => {
    let date = moment();

    let data = {
      updated_at: date.format("YYYY-MM-DD HH:mm:ss"),
      updated_at_order: parseInt(date.format("YYYYMMDDHHmmss")),
      deleted_at: date.format("YYYY-MM-DD HH:mm:ss"),
      deleted_at_order: parseInt(date.format("YYYYMMDDHHmmss")),
    };

    return new Promise((resolve, reject) => {
      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        // Convert data object into a WHERE clause
        let where = Object.entries(params)
          .map(([key]) => `${key} = ?`)
          .join(" AND ");

        con.query(
          `UPDATE ${table} SET ? WHERE ${where}`,
          [data, ...Object.values(params)],
          (e, result) => {
            con.release();

            if (e) {
              return reject(e);
            }
            return resolve(result);
          }
        );
      });
    });
  },
};
