import jwt from "jsonwebtoken";

import Logger from "../util/logger.js";

export default function authenticated(req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    Logger.error([JSON.stringify({ msg: "Not authorized" })]);
    return res.status(401).json({ msg: "Not authorized" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    Logger.error([JSON.stringify({ msg: "Not authorized" })]);
    return res.status(401).json({ msg: "Not authorized" });
  }
}
