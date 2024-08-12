import express from "express";

import { app } from "./Server.js";

import Controller from "./controllers/Controller.js";
import UserController from "./controllers/UserController.js";

const portal = express.Router();

/**
 * Portal routes
 */
app.use("/portal", portal);
portal.post("/users", UserController.create);
portal.get("/users/firebase/:firebase_uid", UserController.getByFirebaseUid);

/**
 * Base routes
 */
app.get("/", Controller.base);
