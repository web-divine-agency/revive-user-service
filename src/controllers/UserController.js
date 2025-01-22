import { createHmac } from "crypto";

import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
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
  create: async (req, res) => {
    let validation = Validator.check([
      Validator.required(req.body, "first_name"),
      Validator.required(req.body, "last_name"),
      Validator.required(req.body, "gender"),
      Validator.required(req.body, "username"),
      Validator.required(req.body, "email"),
      Validator.required(req.body, "password"),
      Validator.required(req.body, "role_name"),
    ]);

    if (!validation.pass) {
      res.status(422);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: validation.result,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { first_name, last_name, gender, username, email, password, branch_ids, role_name } =
      req.body;

    if (!branch_ids || !branch_ids.length) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json({ branch_ids: "required" });
    }

    let role;
    let user;

    // Get the role
    try {
      role = await MysqlService.select(`SELECT id,name FROM roles WHERE name = "${role_name}"`);
    } catch (error) {
      res.status(500);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: error,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    if (!role || !role.length) {
      res.status(404);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        msg: "Role not found",
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create user
    try {
      user = await MysqlService.create("users", {
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        email: email,
        username: username,
        password: createHmac("sha256", process.env.HASH_SECRET).update(password).digest("hex"),
      });
    } catch (error) {
      res.status(500);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: error,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create user role
    try {
      await MysqlService.create("user_roles", {
        user_id: user.insertId,
        role_id: role[0].id,
      });
    } catch (error) {
      res.status(500);

      let message = {
        endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
        error: error,
      };

      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Record user branches
    branch_ids.map(async (item) => {
      try {
        await MysqlService.create("user_branches", {
          user_id: user.insertId,
          branch_id: item,
        });
      } catch (error) {
        res.status(500);

        let message = {
          endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
          error: error,
        };

        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }
    });

    // Enable all ticket types for admin role
    if (role[0].name === "Admin") {
    }

    res.status(200);

    let message = {
      endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      user: user.insertId,
    };

    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  },
};
