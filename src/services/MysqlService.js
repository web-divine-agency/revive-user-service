import moment from "moment";

import mysqlClient from "../config/mysql.js";

export default {
  /**
   * Select record from a table
   * @param {*} table
   * @param {*} queries
   * @param {*} active
   * @returns
   */
  select: (table, queries = null, active = 1) => {
    let archived = `WHERE deleted_at IS ${active * 1 ? "" : "NOT"} NULL`;
    let clauses = queries ? queries : "";

    return new Promise((resolve, reject) => {
      mysqlClient.query(`SELECT * FROM ${table} ${archived} ${clauses}`, (e, result) => {
        if (e) {
          return reject(e);
        }
        return resolve(result);
      });
    });
  },

  /**
   * Paginate set of data from a table
   * @param {*} table
   * @param {*} page
   * @param {*} show
   * @param {*} queries
   * @param {*} active
   * @returns
   */
  paginate: async (table, page, show, queries = null, active = 1) => {
    let archived = `WHERE deleted_at IS ${active * 1 ? "" : "NOT"} NULL`;
    let clauses = queries ? queries : "";

    let list = await generatePagination(table, show, queries, active);

    return new Promise((resolve, reject) => {
      if (page - 1 < 0) {
        return reject([]);
      }

      if (page - 1 >= list.length) {
        return reject([]);
      }

      let offset = list[page - 1][0];

      mysqlClient.query(
        `SELECT * FROM ${table} ${archived} ${clauses} LIMIT ${show} OFFSET ${offset}`,
        (e, result) => {
          if (e) {
            return reject(e);
          }
          return resolve({
            first_page: 1,
            last_page: list.length,
            current_page: page * 1,
            next_page: page * 1 >= list.length ? null : page * 1 + 1,
            prev_page: page * 1 <= 1 ? null : page * 1 - 1,
            pages: list.length,
            list: result,
          });
        }
      );
    });
  },

  /**
   * Insert record on a table
   * @param {*} table
   * @param {*} data
   * @returns
   */
  insert: (table, data) => {
    let date = moment();
    data.created_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.created_at_order = parseInt(date.format("YYYYMMDDHHmmss"));
    data.updated_at = date.format("YYYY-MM-DD HH:mm:ss");
    data.updated_at_order = parseInt(date.format("YYYYMMDDHHmmss"));

    return new Promise((resolve, reject) => {
      mysqlClient.query(
        `INSERT INTO ${table} (${Object.keys(data)}) VALUES ?`,
        [[Object.values(data)]],
        (e, result) => {
          if (e) {
            return reject(e);
          }
          return resolve(result);
        }
      );
    });
  },
};

function generatePagination(table, show, queries, active, callback) {
  let archived = `WHERE deleted_at IS ${active * 1 ? "" : "NOT"} NULL`;
  let clauses = queries ? queries : "";

  return new Promise((resolve, reject) => {
    mysqlClient.query(
      `SELECT COUNT(id) as 'rows' FROM ${table} ${archived} ${clauses}`,
      (e, result) => {
        if (e) {
          return reject(e);
        }

        let array_rows = [...Array(result[0].rows).keys()];

        let paginated = Array.from({ length: Math.ceil(array_rows.length / show) }, (item, i) =>
          array_rows.slice(i * show, i * show + show)
        );

        return resolve(paginated);
      }
    );
  });
}
