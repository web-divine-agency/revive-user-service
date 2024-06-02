import express from "express";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";

const admin = express.Router();
const customer = express.Router();

/**
 * Admin routes
 */
app.use("/admin", admin);

/**
 * Customer routes
 */
app.use("/customer", customer);

/**
 * Base routes
 */
app.get("/", Controller.base);
