import { createHmac } from "crypto";

import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import DatabaseService from "../services/DatabaseService.js";
import LoggerService from "../services/LoggerService.js";

export default {
  /**
   * List of users
   * @param {*} req
   * @param {*} res
   * @returns
   */
  list: (req, res) => {
    let message, validation, branch_id, role, find, direction, query;

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

    branch_id = req.query.branch_id || "";
    role = req.query.role || "";
    find = req.query.find || "";
    direction = req.query.direction === "next" ? "<" : ">";

    query = `
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
      WHERE users.deleted_at IS NULL
      AND user_branches.deleted_at IS NULL
      AND branches.id LIKE "%${branch_id}%"
      AND roles.name LIKE "%${role}%"
      AND
        (
          users.first_name LIKE "%${find}%" OR
          users.last_name LIKE "%${find}%" OR
          users.email LIKE "%${find}%"
        )
      AND users.created_at_order ${direction} ${last}
      GROUP BY users.id
      ORDER BY users.created_at_order DESC
      LIMIT ${show}
    `;

    DatabaseService.select({ query })
      .then((response) => {
        let message = Logger.message(req, res, 200, "users", response.data.result);
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
    let message, validation, role, user, templates;

    validation = Validator.check([
      Validator.required(req.body, "first_name"),
      Validator.required(req.body, "last_name"),
      Validator.required(req.body, "gender"),
      Validator.required(req.body, "username"),
      Validator.required(req.body, "email"),
      Validator.required(req.body, "password"),
      Validator.required(req.body, "role_name"),
      Validator.required(req.body, "auth_id"),
    ]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const {
      first_name,
      last_name,
      gender,
      username,
      email,
      password,
      branch_ids,
      role_name,
      auth_id,
    } = req.body;

    if (!branch_ids || !branch_ids.length) {
      message = Logger.message(req, res, 422, "error", { branch_ids: "required" });
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Get the role
    try {
      role = (
        await DatabaseService.select({
          query: `SELECT id,name FROM roles WHERE name = "${role_name}"`,
        })
      ).data.result;
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    if (!role || !role.length) {
      message = Logger.message(req, res, 404, "error", "Role not found");
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create user
    try {
      user = (
        await DatabaseService.create({
          table: "users",
          data: {
            first_name: first_name,
            last_name: last_name,
            gender: gender,
            email: email,
            username: username,
            password: createHmac("sha256", process.env.HASH_SECRET).update(password).digest("hex"),
          },
        })
      ).data.result;
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create user role
    try {
      await DatabaseService.create({
        table: "user_roles",
        data: {
          user_id: user.insertId,
          role_id: role[0].id,
        },
      });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Record user branches
    branch_ids.map(async (item) => {
      try {
        await DatabaseService.create({
          table: "user_branches",
          data: {
            user_id: user.insertId,
            branch_id: item,
          },
        });
      } catch (error) {
        message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }
    });

    // Enable all ticket types for admin role
    if (role[0].name === "Admin") {
      try {
        templates = (
          await DatabaseService.select({
            query: `SELECT id,name FROM templates WHERE deleted_at IS NULL`,
          })
        ).data.result;
      } catch (error) {
        message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }

      templates.map(async (item) => {
        try {
          await MysqlService.create("user_templates", {
            user_id: user.insertId,
            template_id: item.id,
          });
        } catch (error) {
          let message = Logger.message(req, res, 500, "error", error);
          Logger.error([JSON.stringify(message)]);
          return res.json(message);
        }
      });
    }

    // To Do: Send an email for the credentials

    // Create logs
    try {
      await LoggerService.create({
        user_id: auth_id,
        module: "Users",
        note: `Created user #${user.insertId}`,
      });
    } catch (error) {
      let message = Logger.message(req, res, 500, "error", error.stack);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    message = Logger.message(req, res, 200, "user", user.insertId);
    Logger.out([JSON.stringify(message)]);
    return res.json(message);
  },

  /**
   * Read user
   * @param {*} req
   * @param {*} res
   * @returns
   */
  read: (req, res) => {
    let message, validation, query;

    validation = Validator.check([Validator.required(req.params, "user_id")]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { user_id } = req.params;

    query = `
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
      WHERE users.deleted_at IS NULL
      AND user_branches.deleted_at IS NULL
      AND users.id = ${user_id}
    `;

    DatabaseService.select({ query })
      .then((response) => {
        let message = Logger.message(req, res, 200, "user", response.data.result[0]);
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
   * Update user
   * @param {*} req
   * @param {*} res
   * @returns
   */
  update: async (req, res) => {
    let message, validation, user;

    validation = Validator.check([
      Validator.required(req.params, "user_id"),
      Validator.required(req.body, "first_name"),
      Validator.required(req.body, "last_name"),
      Validator.required(req.body, "gender"),
      Validator.required(req.body, "email"),
      Validator.required(req.body, "role_id"),
      Validator.required(req.body, "auth_id"),
    ]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { user_id } = req.params;

    const { first_name, last_name, gender, email, password, branch_ids, role_id, auth_id } =
      req.body;

    if (!branch_ids || !branch_ids.length) {
      message = Logger.message(req, res, 422, "error", { branch_ids: "required" });
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Update user role
    try {
      await DatabaseService.update({
        table: "user_roles",
        data: {
          role_id: role_id,
        },
        params: {
          user_id,
        },
      });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Update user
    try {
      user = (
        await DatabaseService.update({
          table: "users",
          data: {
            first_name: first_name,
            last_name: last_name,
            gender: gender,
            email: email,
            ...(password && {
              password: createHmac("sha256", process.env.HASH_SECRET)
                .update(password)
                .digest("hex"),
            }),
          },
          params: {
            id: user_id,
          },
        })
      ).data.result;
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Delete user branches to reset
    try {
      await DatabaseService.delete({
        table: "user_branches",
        params: {
          user_id,
        },
      });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Record user branches
    branch_ids.map(async (item) => {
      try {
        await DatabaseService.create({
          table: "user_branches",
          data: {
            user_id,
            branch_id: item,
          },
        });
      } catch (error) {
        message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }
    });

    // To Do: Send an email for the credentials

    // Create logs
    try {
      await LoggerService.create({
        user_id: auth_id,
        module: "Users",
        note: `Updated user #${user_id}`,
      });
    } catch (error) {
      let message = Logger.message(req, res, 500, "error", error.stack);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    message = Logger.message(req, res, 200, "user", user.insertId);
    Logger.out([JSON.stringify(message)]);
    return res.json(message);
  },

  /**
   * Delete user
   * @param {*} req
   * @param {*} res
   * @returns
   */
  delete: async (req, res) => {
    let message, validation;

    validation = Validator.check([
      Validator.required(req.params, "user_id"),
      Validator.required(req.body, "auth_id"),
    ]);

    if (!validation.pass) {
      message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { user_id } = req.params;
    const { auth_id } = req.body;

    // Delete user roles
    try {
      await DatabaseService.delete({ table: "user_roles", params: { user_id } });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error.stack);
      Logger.out([JSON.stringify(message)]);
      return res.json(message);
    }

    // Delete user branches
    try {
      await DatabaseService.delete({
        table: "user_branches",
        params: {
          user_id,
        },
      });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Delete user
    try {
      await DatabaseService.delete({
        table: "users",
        params: {
          id: user_id,
        },
      });
    } catch (error) {
      message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create logs
    try {
      await LoggerService.create({
        user_id: auth_id,
        module: "Users",
        note: `Deleted user #${user_id}`,
      });
    } catch (error) {
      let message = Logger.message(req, res, 500, "error", error.stack);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    message = Logger.message(req, res, 200, "deleted", true);
    Logger.out([JSON.stringify(message)]);
    return res.json(message);
  },
};
