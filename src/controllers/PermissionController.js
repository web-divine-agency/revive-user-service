import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
  /**
   * List all permissions without pagination
   * @param {*} req
   * @param {*} res
   */
  all: (req, res) => {
    MysqlService.select(`SELECT * FROM permissions WHERE deleted_at IS NULL`)
      .then((response) => {
        let message = Logger.message(req, res, 200, "permissions", response);
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
    let validation = Validator.check([
      Validator.required(req.query, "show"),
      Validator.required(req.query, "page"),
    ]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { show, page } = req.query;
    let find = req.query.find ?? "";

    let query = `
      SELECT
        *
      FROM permissions
      WHERE deleted_at IS NULL
      AND 
        (
          permissions.name LIKE "%${find}%"
        )
      `;

    MysqlService.paginate(query, "id", show, page)
      .then((response) => {
        let message = Logger.message(req, res, 200, "permissions", response);
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
    let validation = Validator.check([Validator.required(req.body, "name")]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { name, description } = req.body;

    MysqlService.create("permissions", { name: name, description: description })
      .then((response) => {
        let message = Logger.message(req, res, 200, "permission", response.insertId);
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
