import { createHmac, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";

import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import MysqlService from "../services/MysqlService.js";

export default {
  /**
   * Register user
   * @param {*} req
   * @param {*} res
   * @returns
   */
  register: (req, res) => {
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

    MysqlService.create("users", {
      type: req.body.type,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: createHmac("sha256", process.env.HASH_SECRET)
        .update(req.body.password)
        .digest("hex"),
    })
      .then(async (response) => {
        let user = await MysqlService.select(`SELECT * FROM users WHERE id = ${response.insertId}`);

        delete user[0].password;

        let token = jwt.sign({ ...user[0] }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
        return res.json({ ...user[0], token: token });
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },

  login: async (req, res) => {
    let validation = Validator.check([
      Validator.required(req.body, "email"),
      Validator.required(req.body, "password"),
    ]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    let user = await MysqlService.select(`SELECT * FROM users WHERE email = "${req.body.email}"`);

    if (!user.length) {
      Logger.error([JSON.stringify({ msg: "User not found" })]);
      return res.status(404).json({ msg: "User not found" });
    }

    let userPassword = user[0].password;
    let reqPassword = createHmac("sha256", process.env.HASH_SECRET)
      .update(req.body.password)
      .digest("hex");

    // Check length before using timingSageEqual
    if (userPassword.length !== reqPassword.length) {
      Logger.error([JSON.stringify({ msg: "Not authorized" })]);
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (timingSafeEqual(Buffer.from(userPassword), Buffer.from(reqPassword))) {
      delete user[0].password;

      let token = jwt.sign({ ...user[0] }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      Logger.out([`${req.method} ${req.originalUrl} ${res.statusCode}`]);
      return res.json({ ...user[0], token: token });
    } else {
      Logger.error([JSON.stringify({ msg: "Not authorized" })]);
      return res.status(401).json({ msg: "Not authorized" });
    }
  },
};
