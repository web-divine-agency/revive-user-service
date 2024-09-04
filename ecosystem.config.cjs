module.exports = {
  apps: [
    {
      name: "01-UserService",
      namespace: "skhillz-user-service",
      script: "./src/index.js",
      watch: ["./src", "./src/*.js"],
      output: "./logs/out.log",
      error: "./logs/error.log",
    },
  ],
};
