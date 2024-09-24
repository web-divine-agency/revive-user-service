import moment from "moment";

import mysqlClient from "../config/mysql.js";

export default {
  /**
   * Select record(s) on selected table
   * @param {*} query
   * @returns
   */
  select: (query) => {
    return new Promise((resolve, reject) => {
      mysqlClient.query(query, (e, result) => {
        if (e) {
          return reject(e);
        }
        return resolve(result);
      });
    });
  },

  /**
   * Create a record on selected table
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

  delete: (table, id) => {
    let date = moment();

    let data = {
      updated_at: date.format("YYYY-MM-DD HH:mm:ss"),
      updated_at_order: parseInt(date.format("YYYYMMDDHHmmss")),
      deleted_at: date.format("YYYY-MM-DD HH:mm:ss"),
      deleted_at_order: parseInt(date.format("YYYYMMDDHHmmss")),
    };

    let query = `UPDATE ${table} SET ? WHERE id=${id}`;

    return new Promise((resolve, reject) => {
      mysqlClient.query(query, [data], (e, result) => {
        if (e) {
          return reject(e);
        }
        return resolve(result);
      });
    });
  },

  /**
   * Paginate set of data from a table
   * @param {*} query
   * @param {*} paginateQuery
   * @param {*} show
   * @param {*} page
   * @returns
   */
  paginate: async (query, paginateQuery, show, page) => {
    let list = await generatePagination(paginateQuery, show);

    return new Promise((resolve, reject) => {
      if (page - 1 < 0) {
        return resolve([]);
      }

      if (page - 1 >= list.length) {
        return resolve([]);
      }

      let offset = list[page - 1][0];

      mysqlClient.query(`${query} LIMIT ${show} OFFSET ${offset}`, (e, result) => {
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
      });
    });
  },
};

/**
 * Generate pagination list helper function
 * @param {*} paginateQuery
 * @param {*} show
 * @returns
 */
function generatePagination(paginateQuery, show) {
  return new Promise((resolve, reject) => {
    mysqlClient.query(paginateQuery, (e, result) => {
      if (e) {
        return reject(e);
      }

      let array_rows = [...Array(result[0].rows).keys()];

      let paginated = Array.from({ length: Math.ceil(array_rows.length / show) }, (item, i) =>
        array_rows.slice(i * show, i * show + show)
      );

      return resolve(paginated);
    });
  });
}
