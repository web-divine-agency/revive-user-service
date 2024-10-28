import express from "express";
import bodyParser from "body-parser";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";
import AuthController from "./controllers/AuthController.js";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Replace with your allowed origin
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(bodyParser.json());

const portal = express.Router();

/**
 * Portal routes
 */
app.use("/portal", portal);
portal.get("/users", UserController.list);
portal.post("/users", UserController.create);

portal.get("/users-count", UserController.count);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
