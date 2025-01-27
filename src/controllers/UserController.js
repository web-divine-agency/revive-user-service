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
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { show, page } = req.query;

    let branch_id = req.query.branch_id ?? null;
    let role = req.query.role ?? "";
    let find = req.query.find ?? "";

    let query = `
      SELECT
        users.id,
        users.first_name,
        users.last_name,
        users.gender,
        users.username,
        users.email,
        users.mobile,
        ANY_VALUE(roles.id) AS role_id,
        ANY_VALUE(roles.name) AS role_name,
        JSON_ARRAYAGG(
            JSON_OBJECT('name', branches.name, 'id', branches.id)
        ) AS all_branches,
        users.verified_at,
        users.verified_at_order,
        users.created_at,
        users.created_at_order,
        users.updated_at,
        users.updated_at_order
      FROM users
      INNER JOIN user_branches ON users.id = user_branches.user_id
      INNER JOIN branches ON user_branches.branch_id = branches.id
      INNER JOIN user_roles ON users.id = user_roles.user_id
      INNER JOIN roles ON user_roles.role_id = roles.id
      WHERE branches.id = IFNULL(${branch_id}, branches.id)
      AND roles.name LIKE "%${role}%" 
      AND 
        (
          users.first_name LIKE "%${find}%" OR
          users.last_name LIKE "%${find}%" OR
          users.email LIKE "%${find}%"
        )
      GROUP BY users.id
    `;

    MysqlService.paginate(query, "users.id", show, page)
      .then((response) => {
        let message = Logger.message(req, res, 200, "users", response);
        Logger.out([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 500, "error", error);
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
      let message = Logger.message(req, res, 422, "error", validation.result);
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
      let message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    if (!role || !role.length) {
      let message = Logger.message(req, res, 404, "error", "Role not found");
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
      let message = Logger.message(req, res, 500, "error", error);
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
      let message = Logger.message(req, res, 500, "error", error);
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
        let message = Logger.message(req, res, 500, "error", error);
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
          let message = Logger.message(req, res, 500, "error", error);
          Logger.error([JSON.stringify(message)]);
          return res.json(message);
        }
      });
    }

    // To Do: Send an email for the credentials

    let message = Logger.message(req, res, 200, "user", user.insertId);
    Logger.out([JSON.stringify(message)]);
    return res.json(message);
  },
};
