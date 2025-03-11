import axios from "axios";
import { url } from "../config/app.js";

const token = process.env.APP_PASSWORD;

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
        url: `/db/select`,
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

  /**
   * Create resource
   * @param {*} payload
   * @param {*} token
   * @returns
   */
  create: async (payload) => {
    try {
      return await axios({
        method: "POST",
        baseURL: url.databaseService,
        url: `/db/create`,
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

  user: async (payload) => {
    try {
      return await axios({
        method: "GET",
        baseURL: url.databaseService,
        url: `/user`,
        data: payload,
      });
    } catch (error) {
      const { status, data } = error?.response;
      return Promise.reject({ status: status, database: data });
    }
  },
};
