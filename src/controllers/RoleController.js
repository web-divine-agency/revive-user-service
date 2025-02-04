import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
  /**
   * List all roles without pagination
   * @param {*} req
   * @param {*} res
   */
  all: (req, res) => {
    MysqlService.select(`SELECT * FROM roles WHERE deleted_at IS NULL`)
      .then((response) => {
        let message = Logger.message(req, res, 200, "roles", response);
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
   * List roles
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

    let query = `
      SELECT
        ANY_VALUE(roles.id) AS role_id,
        roles.name AS role_name,
        roles.description AS role_description,
        JSON_ARRAYAGG(
            JSON_OBJECT('name', permissions.name, 'id', permissions.id, 'description', permissions.description)
        ) AS all_permissions
      FROM roles
      INNER JOIN role_permissions ON roles.id = role_permissions.role_id
      INNER JOIN permissions ON role_permissions.permission_id = permissions.id
      WHERE roles.deleted_at IS NULL
      AND role_permissions.deleted_at IS NULL
      GROUP BY roles.id
    `;

    MysqlService.paginate(query, "roles.id", show, page)
      .then((response) => {
        let message = Logger.message(req, res, 200, "roles", response);
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
   * Create role
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

    const { name, description, permission_ids } = req.body;

    if (!permission_ids || !permission_ids.length) {
      let message = Logger.message(req, res, 422, "error", { permission_ids: "required" });
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    let role;

    try {
      role = await MysqlService.create("roles", { name: name, description: description });
    } catch (error) {
      let message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Create role_permissions
    permission_ids?.map(async (item) => {
      try {
        await MysqlService.create("role_permissions", {
          role_id: role.insertId,
          permission_id: item,
        });
      } catch (error) {
        let message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }
    });

    let message = Logger.message(req, res, 200, "role", role.insertId);
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  },

  /**
   * Read role
   * @param {*} req
   * @param {*} res
   * @returns
   */
  read: (req, res) => {
    let validation = Validator.check([Validator.required(req.params, "role_id")]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { role_id } = req.params;

    let query = `
      SELECT
        ANY_VALUE(roles.id) AS role_id,
        roles.name AS role_name,
        roles.description AS role_description,
        JSON_ARRAYAGG(
            JSON_OBJECT('name', permissions.name, 'id', permissions.id, 'description', permissions.description)
        ) AS all_permissions
      FROM roles
      INNER JOIN role_permissions ON roles.id = role_permissions.role_id
      INNER JOIN permissions ON role_permissions.permission_id = permissions.id
      WHERE roles.deleted_at IS NULL
      AND role_permissions.deleted_at IS NULL
      AND roles.id = ${role_id}
      GROUP BY roles.id
    `;

    MysqlService.select(query)
      .then((response) => {
        let message = Logger.message(req, res, 200, "role", response[0]);
        Logger.out([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },

  update: async (req, res) => {
    let validation = Validator.check([
      Validator.required(req.params, "role_id"),
      Validator.required(req.body, "name"),
    ]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { role_id } = req.params;
    const { name, description, permission_ids } = req.body;

    if (!permission_ids || !permission_ids.length) {
      let message = Logger.message(req, res, 422, "error", { permission_ids: "required" });
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    try {
      await MysqlService.update("roles", { name: name, description: description }, { id: role_id });
    } catch (error) {
      let message = Logger.message(req, res, 500, "error", error);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    // Remove and insert role_permissions
    permission_ids?.map(async (item) => {
      try {
        await MysqlService.delete("role_permissions", {
          role_id: role_id,
        });

        await MysqlService.create("role_permissions", {
          role_id: role_id,
          permission_id: item,
        });
      } catch (error) {
        let message = Logger.message(req, res, 500, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      }
    });

    let message = Logger.message(req, res, 200, "updated", true);
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  },

  /**
   * Delete role
   * @param {*} req
   * @param {*} res
   * @returns
   */
  delete: (req, res) => {
    let validation = Validator.check([Validator.required(req.params, "role_id")]);

    if (!validation.pass) {
      let message = Logger.message(req, res, 422, "error", validation.result);
      Logger.error([JSON.stringify(message)]);
      return res.json(message);
    }

    const { role_id } = req.params;

    MysqlService.delete("roles", { id: role_id })
      .then(() => {
        let message = Logger.message(req, res, 200, "deleted", true);
        Logger.out([JSON.stringify(message)]);
        return res.json(message);
      })
      .catch((error) => {
        let message = Logger.message(req, res, 200, "error", error);
        Logger.error([JSON.stringify(message)]);
        return res.json(message);
      });
  },
};
