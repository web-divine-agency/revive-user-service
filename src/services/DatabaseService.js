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

  /**
   * Update resource
   * @param {*} payload
   * @returns
   */
  update: async (payload) => {
    try {
      return await axios({
        method: "PUT",
        baseURL: url.databaseService,
        url: `/db/update`,
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
   * Delete resource
   * @param {*} payload
   * @returns
   */
  delete: async (payload) => {
    try {
      return await axios({
        method: "DELETE",
        baseURL: url.databaseService,
        url: `/db/delete`,
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
   * Get user
   * @param {*} payload
   * @returns
   */
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
