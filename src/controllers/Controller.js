import Logger from "../util/logger.js";

const Controller = {
  base: (req, res) => {
    Logger.out([JSON.stringify({ service: `${process.env.APP_NAME} api` })]);
    return res.json({ service: `${process.env.APP_NAME} api` });
  },
};

export default Controller;
