import express from "express";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";
import AuthController from "./controllers/AuthController.js";

const portal = express.Router();

/**
 * Portal routes
 */
app.use("/portal", portal);
portal.get("/users", UserController.list);
portal.post("/users", UserController.create);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
