import jwt from "jsonwebtoken";

import Logger from "../util/logger.js";

export function authenticated(req, res, next) {
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
    next();
  } catch (error) {
    res.status(404);

    let message = {
      endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      error: error,
    };

    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }
}

export function authAdmin(req, res, next) {
  let token = req.header("Authorization");
  let decoded = {};

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
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);

    let message = {
      endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      error: error,
    };

    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }


  if (decoded.role_name === "Admin") {
    next();
  } else {
    res.status(401);

    let message = {
      endpoint: `${req.method} ${req.originalUrl} ${res.statusCode}`,
      error: "Not authorized",
    };

    Logger.error([JSON.stringify(message)]);
    return res.json(message);
  }
}
