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
   * Delete resource
   * @param {*} table
   * @param {*} id
   * @returns
   */
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
      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        con.query(query, [data], (e, result) => {
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
   * Paginate resource
   * @param {*} query
   * @param {*} count_id
   * @param {*} show
   * @param {*} page
   * @returns
   */
  paginate: async (query, count_id, show, page) => {
    let list = await generatePagination(query, count_id, show);

    return new Promise((resolve, reject) => {
      if (page - 1 < 0) {
        return resolve([]);
      }

      if (page - 1 >= list.length) {
        return resolve([]);
      }

      let offset = list[page - 1][0];

      mysqlClient.getConnection((err, con) => {
        if (err) {
          return reject(err);
        }

        con.query(`${query} LIMIT ${show} OFFSET ${offset}`, (e, result) => {
          con.release();

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
    });
  },
};

/**
 * Generate pagination without getting all data from db
 * @param {*} query
 * @param {*} count_id
 * @param {*} show
 * @returns
 */
function generatePagination(query, count_id, show) {
  const regex = /SELECT\s*[\s\S]*?\s+FROM/i;

  let paginateQuery = query.replace(regex, `SELECT COUNT(${count_id}) AS 'rows' FROM`);

  return new Promise((resolve, reject) => {
    mysqlClient.getConnection((err, con) => {
      if (err) {
        return reject(err);
      }

      con.query(paginateQuery, (e, result) => {
        con.release();

        if (e) {
          return reject(e);
        }

        let array_rows = [...Array(result[0]?.rows).keys()];

        let paginated = Array.from({ length: Math.ceil(array_rows.length / show) }, (item, i) =>
          array_rows.slice(i * show, i * show + show)
        );

        return resolve(paginated);
      });
    });
  });
}
