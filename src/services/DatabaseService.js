import axios from "axios";
import { url } from "../config/app.js";

export default {
  /**
   * Select resource
   * @param {*} payload 
   * @returns 
   */
  select: async (payload) => {
    try {
      return await axios({
        method: "GET",
        baseURL: url.databaseService,
        url: `/portal/select`,
        data: payload,
      });
    } catch (error) {
      const { status, data } = error?.response;
      return Promise.reject({ status: status, database: data });
    }
  },

  /**
   * Create resource
   * @param {*} payload
   * @param {*} token
   * @returns
   */
  create: async (payload, token) => {
    try {
      return await axios({
        method: "POST",
        baseURL: url.databaseService,
        url: `/admin/create`,
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
