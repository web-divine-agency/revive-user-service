import axios from "axios";
import { url } from "../config/app.js";

export default {
  /**
   * Create log
   * @param {*} payload 
   * @param {*} token 
   * @returns 
   */
  create: (payload, token) => {
    return axios({
      method: "POST",
      baseURL: url.loggerService,
      url: `/portal/logs`,
      data: payload,
      headers: {
        Authorization: token,
      },
    });
  },
};
