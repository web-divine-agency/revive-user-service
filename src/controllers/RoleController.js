import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
  /**
   * Create role
   * @param {*} req
   * @param {*} res
   * @returns
   */
  create: async (req, res) => {
    let validation = Validator.check([Validator.required(req.body, "role_name")]);

    if (!validation.pass) {
      res.status(422);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: validation.result,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { role_name } = req.body;

    MysqlService.create("roles", { name: role_name })
      .then((response) => {
        res.status(200);

        let message = {
          endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
          id: response.insertId,
        };

        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        res.status(500);

        let message = {
          endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
          error: error,
        };

        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },
};
