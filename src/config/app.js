const env = {
  dev: {
    portal: "http://localhost:3001",
    databaseService: "http://revive-database-service:8801",
    userService: "http://revive-user-service:8801",
    ticketService: "http://revive-ticket-service:8802",
    branchService: "http://revive-branch-service:8803",
    loggerService: "http://revive-logger-service:8804",
  },
  uat: {
    portal: "http://localhost:3001",
    userService: "http://revive-user-service:8801",
    ticketService: "http://revive-ticket-service:8802",
    branchService: "http://revive-branch-service:8803",
    loggerService: "http://revive-logger-service:8804",
  },
};

export const url = env[process.env.APP_ENV];
