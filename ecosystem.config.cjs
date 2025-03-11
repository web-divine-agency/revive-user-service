module.exports = {
  apps: [
    {
      name: "ReviveUserService",
      namespace: "revive-user-service",
      script: "./src/index.js",
      watch: ["./src", "./src/*.js"],
      output: "./logs/out.log",
      error: "./logs/error.log",
    },
  ],
};
