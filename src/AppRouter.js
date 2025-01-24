import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { app } from "./Server.js";

import { authAdmin, authenticated } from "./middleware/auth.js";

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
portal.use(authenticated);

/**
 * Admin routes
 */
app.use("/admin", admin);
admin.use(authAdmin);
admin.get("/res/users", UserController.list);
admin.post("/res/users", UserController.create);

admin.post("/res/roles", RoleController.create);

admin.get("/fn/roles-all", RoleController.all);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
