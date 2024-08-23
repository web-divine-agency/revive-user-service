import { watchFile, statSync, writeFile } from "fs";
import moment from "moment";

const LOG_LIMIT = 1024; // KB

export default {
  /**
   * Console log output
   * @param {*} messages
   */
  out: (messages = []) => {
    if (messages.length) {
      messages.forEach((message) => {
        console.log(`${moment().format("YYYY-MM-DD hh:mm:ss Z")} ${message}`);
      });
    }
  },

  /**
   * Console log error
   * @param {*} messages
   */
  error: (messages = []) => {
    if (messages.length) {
      messages.forEach((message) => {
        console.error(`${moment().format("YYYY-MM-DD hh:mm:ss Z")} ${message}`);
      });
    }
  },

  /**
   * This will maintain log file to less than 1024 KB
   */
  sweeper: () => {
    watchFile("logs/error.log", () => {
      let fileStats = statSync("logs/error.log");
      let size = fileStats.size / LOG_LIMIT;

      if (size > LOG_LIMIT) {
        writeFile("logs/error.log", "", (err) => {
          if (err) throw err;
        });
      }
    });

    watchFile("logs/out.log", () => {
      let fileStats = statSync("logs/out.log");
      let size = fileStats.size / LOG_LIMIT;

      if (size > LOG_LIMIT) {
        writeFile("logs/out.log", "", (err) => {
          if (err) throw err;
        });
      }
    });
  },
};
