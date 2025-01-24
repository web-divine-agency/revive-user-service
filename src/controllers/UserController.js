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
      Validator.required(req.query, "show"),
      Validator.required(req.query, "page"),
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

    const { show, page, role } = req.query;

    let query = `
      SELECT
        users.id,
        users.first_name,
        users.last_name,
        users.username,
        users.gender,
        users.email,
        users.mobile,
        users.verified_at,
        users.created_at,
        users.created_at_order,
        users.updated_at,
        users.updated_at_order,
        roles.id as role_id,
        roles.name as role_name,
        roles.description as role_description
      FROM users
      INNER JOIN user_roles ON users.id = user_roles.user_id
      INNER JOIN roles ON user_roles.role_id = roles.id
      WHERE roles.name LIKE "%${role}%" 
      AND users.deleted_at IS NULL
    `;

    MysqlService.paginate(query, "users.id", show, page)
      .then((response) => {
        res.status(200);

        let message = {
          endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
          users: response,
        };

        Logger.out([JSON.stringify(message)]);
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
    let ticket_types;

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
      ticket_types = await MysqlService.select(
        `SELECT id,name FROM ticket_types WHERE deleted_at IS NULL`
      );

      ticket_types.map(async (item) => {
        try {
          await MysqlService.create("user_ticket_types", {
            user_id: user.insertId,
            ticket_type_id: item.id,
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
    }

    // To Do: Send an email for the credentials

    res.status(200);

    let message = {
      endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      user: user.insertId,
    };

    Logger.out([JSON.stringify(message)]);
    return res.json(message);
  },
};
