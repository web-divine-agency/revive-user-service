import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";
import AuthController from "./controllers/AuthController.js";
import RoleController from "./controllers/RoleController.js";

if (process.env.APP_ENV === "dev") {
  app.use(cors());
}

app.use(bodyParser.json());

const portal = express.Router();
const admin = express.Router();

/**
 * Portal routes
 */
app.use("/portal", portal);
portal.get("/users", UserController.list);


/**
 * Admin routes
 */
app.use("/admin", admin);
admin.post("/users", UserController.create);

admin.post("/roles", RoleController.create);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/register", AuthController.register);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
