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
    databaseService: "http://nadescrib.com:8801",
    userService: "http://nadescrib.com:8802",
    ticketService: "http://nadescrib.com:8803",
    branchService: "http://nadescrib.com:8804",
    loggerService: "http://nadescrib.com:8805",
    resourceService: "http://nadescrib.com:8806",
  },
};

export const url = env[process.env.APP_ENV];
