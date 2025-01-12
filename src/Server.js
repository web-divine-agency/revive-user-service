import express from "express";

import Logger from "./util/logger.js";

const appName = process.env.APP_NAME;
const port = process.env.HTTP_PORT;

const app = express();

app.listen(port, () => {
  Logger.out([`${appName} is listening on port ${port}`]);
});

export { app };
