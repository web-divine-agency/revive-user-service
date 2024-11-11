import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
  /**
   * Count users
   * @param {*} req
   * @param {*} res
   */
  count: async (req, res) => {
    let query = `SELECT COUNT(id) as 'rows' FROM users WHERE type = "${req.query.type}" AND deleted_at IS NULL`;

    MysqlService.select(query)
      .then((response) => {
        Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
        return res.json(response[0]);
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },

  /**
   * List of users
   * @param {*} req
   * @param {*} res
   * @returns
   */
  list: (req, res) => {
    let validation = Validator.check([
      Validator.required(req.query, "type"),
      Validator.required(req.query, "show"),
      Validator.required(req.query, "page"),
    ]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    let query = `SELECT * FROM users WHERE type = "${req.query.type}" AND deleted_at IS NULL`;

    MysqlService.paginate(query, "users.id", req.query.show, req.query.page)
      .then((response) => {
        Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
        return res.json(response);
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },

  /**
   * Create a user
   * @param {*} req
   * @param {*} res
   * @returns
   */
  create: (req, res) => {
    let validation = Validator.check([
      Validator.required(req.body, "type"),
      Validator.required(req.body, "first_name"),
      Validator.required(req.body, "last_name"),
      Validator.required(req.body, "email"),
      Validator.required(req.body, "password"),
    ]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    MysqlService.insert("users", {
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      email: req.body.email,
      type: req.body.type,
      firebase_uid: req.body.firebase_uid,
      session: req.body.session,
      session_expiration: req.body.session_expiration,
    })
      .then((response) => {
        Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
        return res.json({
          msg: `${req.method} ${req.originalUrl} ${res.statusCode}`,
          id: response.insertId,
        });
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },
};
