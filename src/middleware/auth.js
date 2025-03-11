import jwt from "jsonwebtoken";

import Logger from "../util/logger.js";

export function authenticated(req, res, next) {
  let message,
    token = req.header("Authorization");

  if (!token) {
    message = Logger.message(req, res, 404, "error", "Token not found");
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    message = Logger.message(req, res, 401, "error", "Not authorized");
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }
}

export function authAdmin(req, res, next) {
  let message,
    decoded = {},
    token = req.header("Authorization");

  if (!token) {
    message = Logger.message(req, res, 404, "error", "Token not found");
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    message = Logger.message(req, res, 401, "error", error);
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }

  if (decoded.role_name === "Admin") {
    next();
  } else {
    message = Logger.message(req, res, 401, "error", "Not authorized");
    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }
}
