import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // 📄 Log errors to file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    // 📄 Log everything to combined file
    new winston.transports.File({
      filename: "logs/combined.log",
    }),

    // 🖥️ Console output
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

export default logger;
