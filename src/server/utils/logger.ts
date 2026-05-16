import pino from "pino";

export const logger = pino({
  transport: { target: "pino-pretty" },
  level: process.env.NODE_ENV === "production" ? "info" : "trace",
  base: {
    pid: false,
    hostname: false,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  serializers: {
    err(err) {
      return {
        type: err.type,
        message: err.message,
        stack: err.stack,
      };
    },
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    bindings(bindings) {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
      };
    },
  },
});
