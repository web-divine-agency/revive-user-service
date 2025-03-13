const env = {
  dev: {
    databaseService: "http://revive-database-service:8801",
    userService: "http://revive-user-service:8802",
    ticketService: "http://revive-ticket-service:8803",
    branchService: "http://revive-branch-service:8804",
    loggerService: "http://revive-logger-service:8805",
    resourceService: "http://revive-resource-service:8806",
  },
  uat: {
    databaseService: "https://nadescrib.com:4401",
    userService: "https://nadescrib.com:4402",
    ticketService: "https://nadescrib.com:4403",
    branchService: "https://nadescrib.com:4404",
    loggerService: "https://nadescrib.com:4405",
    resourceService: "https://nadescrib.com:4406",
  },
};

export const url = env[process.env.APP_ENV];
