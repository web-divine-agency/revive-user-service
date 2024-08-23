import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
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

  /**
   * Get a user using firebase uid
   * @param {*} req
   * @param {*} res
   * @returns
   */
  getByFirebaseUid: (req, res) => {
    let validation = Validator.check([Validator.required(req.params, "firebase_uid")]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    MysqlService.select("users", `AND firebase_uid = "${req.params.firebase_uid}"`)
      .then((response) => {
        Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
        return res.json(response[0]);
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },
};
