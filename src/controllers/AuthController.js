import { createHmac, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";

import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import LoggerService from "../services/LoggerService.js";

export default {
  /**
   * User login
   * @param {*} req
   * @param {*} res
   * @returns
   */
  login: async (req, res) => {
    let validation = Validator.check([
      Validator.required(req.body, "username"),
      Validator.required(req.body, "password"),
    ]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { username, password } = req.body;

    let userQuery = `
      SELECT
        users.id,
        users.first_name,
        users.last_name,
        users.username,
        users.gender,
        users.email,
        users.mobile,
        users.password,
        users.verified_at,
        roles.id as role_id,
        roles.name as role_name,
        roles.description
      FROM users
      INNER JOIN user_roles ON users.id = user_roles.user_id
      INNER JOIN roles ON user_roles.role_id = roles.id
      WHERE users.username = "${username}"
      AND users.deleted_at IS NULL
    `;

    let user = await MysqlService.select(userQuery);

    if (!user.length) {
      let message = Logger.message(req, res, 404, "error", "User not found");
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    let userPassword = user[0].password;
    let reqPassword = createHmac("sha256", process.env.HASH_SECRET).update(password).digest("hex");

    // Check length before using timingSageEqual
    if (userPassword.length !== reqPassword.length) {
      let message = Logger.message(req, res, 401, "error", "Invalid credentials");
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    if (timingSafeEqual(Buffer.from(userPassword), Buffer.from(reqPassword))) {
      // Remove the password upon jwt sign
      delete user[0].password;

      let token = jwt.sign({ ...user[0] }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      try {
        await LoggerService.create(
          { user_id: user[0].id, module: "Authentication", note: "User login" },
          token
        );
      } catch (error) {
        let message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }

      let message = Logger.message(req, res, 200, "user", { ...user[0], token: token });
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    } else {
      let message = Logger.message(req, res, 401, "error", "Invalid credentials");
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }
  },

  /**
   * Check if user is authenticated
   * @param {*} req
   * @param {*} res
   * @returns
   */
  authenticated: (req, res) => {
    let token = req.header("Authorization");

    if (!token) {
      res.status(404);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: "Token not found",
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);

      res.status(200);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        auth: true,
      };

      Logger.out([JSON.stringify(message)]);
      return res.json(message);
    } catch {
      res.status(401);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        auth: false,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }
  },
};
