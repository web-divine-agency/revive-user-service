import express from "express";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";

const admin = express.Router();
const customer = express.Router();

/**
 * Admin routes
 */
app.use("/admin", admin);
// Users
admin.get("/users", UserController.list);

/**
 * Customer routes
 */
app.use("/customer", customer);

/**
 * Base routes
 */
app.get("/", Controller.base);
