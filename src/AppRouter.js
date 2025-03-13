import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { app } from "./Server.js";

import { authAdmin, authenticated } from "./middleware/auth.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";
import AuthController from "./controllers/AuthController.js";
import RoleController from "./controllers/RoleController.js";
import PermissionController from "./controllers/PermissionController.js";

app.use(cors());

app.use(bodyParser.json());

const portal = express.Router();
const admin = express.Router();

/**
 * Portal routes
 */
app.use("/portal", portal);
portal.use(authenticated);

portal.get("/users", UserController.list);
portal.get("/users/:user_id", UserController.read);

portal.get("/roles/all", RoleController.all);
portal.get("/roles", RoleController.list);
portal.get("/roles/:role_id", RoleController.read);

portal.get("/permissions/all", PermissionController.all);
portal.get("/permissions", PermissionController.list);

/**
 * Admin routes
 */
app.use("/admin", admin);
admin.use(authAdmin);
admin.post("/users", UserController.create);
admin.put("/users/:user_id", UserController.update);

admin.post("/roles", RoleController.create);
admin.put("/roles/:role_id", RoleController.update);
admin.delete("/roles/:role_id", RoleController.delete);

admin.post("/permissions", PermissionController.create);

/**
 * Base routes
 */
app.get("/", Controller.base);
app.post("/login", AuthController.login);
app.get("/authenticated", AuthController.authenticated);
