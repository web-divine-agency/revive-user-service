import { where } from "firebase/firestore";

import Logger from "../util/logger.js";
import Validator from "../util/validator.js";

import { auth } from "../config/firebase.js";

import FirebaseService from "../services/FirebaseService.js";

const UserController = {
  /**
   * List of users
   * @param {*} req
   * @param {*} res
   */
  list: (req, res) => {
    let validation = Validator.check([Validator.required(req.query, "type")]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    FirebaseService.select("users", [where("type", "==", req.query.type)])
      .then((response) => {
        let msg = { msg: `${req.method} ${req.originalUrl} ${res.statusCode}` };
        Logger.out([JSON.stringify(msg)]);

        let users = response.map((i) => ({
          type: i.type,
          auth_uid: i.auth_uid,
          last_name: i.last_name,
          first_name: i.first_name,
          email: i.email,
          mobile: i.mobile,
          doc_uid: i.doc_uid,
        }));

        return res.json(users);
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
      Validator.required(req.body, "first_name"),
      Validator.required(req.body, "last_name"),
      Validator.required(req.body, "email"),
      Validator.required(req.body, "mobile"),
      Validator.required(req.body, "type"),
    ]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    createUserWithEmailAndPassword(
      firebaseAuth,
      req.body.email,
      req.body.password
    )
      .then(async (response) => {
        await FirebaseService.insert("users", {
          auth_uid: response.user.uid,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          mobile: req.body.mobile,
          type: req.body.type,
          access_token: response.user.stsTokenManager.accessToken,
          access_expire: response.user.stsTokenManager.expirationTime,
        });

        let msg = { msg: `${req.method} ${req.originalUrl} ${res.statusCode}` };
        Logger.out([JSON.stringify(msg)]);
        return res.json(msg);
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },

  read: (req, res) => {
    let validation = Validator.check([Validator.required(req.params, "uid")]);

    if (!validation.pass) {
      Logger.error([JSON.stringify(validation)]);
      return res.status(422).json(validation.result);
    }

    FirebaseService.get("users", req.params.uid)
      .then((response) => {
        let msg = { msg: `${req.method} ${req.originalUrl} ${res.statusCode}` };
        Logger.out([JSON.stringify(msg)]);
        return res.json(response);
      })
      .catch((error) => {
        Logger.error([JSON.stringify(error)]);
        return res.status(500).json(error);
      });
  },
};

export default UserController;
