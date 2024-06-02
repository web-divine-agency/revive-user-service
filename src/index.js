import moment from "moment-timezone";

import "dotenv/config";
import "./Server.js";
import "./AppRouter.js";

moment.tz.setDefault("Asia/Singapore");

import Logger from "./util/logger.js";

// Run logs sweeper
Logger.sweeper();
