import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { app } from "./Server.js";

import { authenticated } from "./middleware/auth.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";
import AuthController from "./controllers/AuthController.js";
import RoleController from "./controllers/RoleController.js";
import PermissionController from "./controllers/PermissionController.js";

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
// admin.use(authAdmin);
admin.get("/users", UserController.list);
admin.post("/users", UserController.create);

admin.get("/roles/all", RoleController.all);

admin.get("/roles", RoleController.list);
admin.post("/roles", RoleController.create);
admin.get("/roles/:role_id", RoleController.read);
admin.put("/roles/:role_id", RoleController.update);
admin.delete("/roles/:role_id", RoleController.delete);

admin.get("/permissions/all", PermissionController.all);

admin.get("/permissions", PermissionController.list);
admin.post("/permissions", PermissionController.create);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
