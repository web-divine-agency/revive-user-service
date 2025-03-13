import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import DatabaseService from "../services/DatabaseService.js";

export default {
  /**
   * List all permissions without pagination
   * @param {*} req
   * @param {*} res
   */
  all: (req, res) => {
    let message;

    DatabaseService.select({ query: `SELECT * FROM permissions WHERE deleted_at IS NULL` })
      .then((response) => {
        message = Logger.message(req, res, 200, "permissions", response.data.result);
        Logger.out([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 200, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },

  /**
   * List permissions
   * @param {*} req
   * @param {*} res
   * @returns
   */
  list: (req, res) => {
    let message, validation, find, direction, query;

    validation = Validator.check([
      Validator.required(req.query, "direction"),
      Validator.required(req.query, "last"),
      Validator.required(req.query, "show"),
    ]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { last, show } = req.query;

    find = req.query.find || "";
    direction = req.query.direction === "next" ? "<" : ">";

    query = `
      SELECT
        *
      FROM permissions
      WHERE deleted_at IS NULL
      AND 
      (
        permissions.name LIKE "%${find}%"
      )
      AND created_at_order ${direction} ${last}
      ORDER BY created_at_order DESC
      LIMIT ${show}
    `;

    DatabaseService.select({ query })
      .then((response) => {
        let message = Logger.message(req, res, 200, "permissions", response.data.result);
        Logger.out([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 200, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },

  /**
   * Create permission
   * @param {*} req
   * @param {*} res
   * @returns
   */
  create: async (req, res) => {
    let message, validation;

    validation = Validator.check([Validator.required(req.body, "name")]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { name, description } = req.body;

    DatabaseService.create({ table: "permissions", data: { name: name, description: description } })
      .then((response) => {
        message = Logger.message(req, res, 200, "permission", response.data.result.insertId);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },
};
