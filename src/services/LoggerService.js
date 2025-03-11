import axios from "axios";
import { url } from "../config/app.js";

const token = process.env.APP_PASSWORD;

export default {
  /**
   * Create log
   * @param {*} payload
   * @param {*} token
   * @returns
   */
  create: async (payload) => {
    try {
      return await axios({
        method: "POST",
        baseURL: url.loggerService,
        url: `/portal/logs`,
        data: payload,
        headers: {
          Authorization: token,
        },
      });
    } catch (error) {
      const { status, data } = error?.response;
      return Promise.reject({ status: status, database: data });
    }
  },
};
