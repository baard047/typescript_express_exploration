import pino from "pino";

export const logger = pino({
  level: "info",
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        levelFirst: true,
      },
    },
  }),
});
