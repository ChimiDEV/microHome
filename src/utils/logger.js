/*
 * This one may be later on a own microservice.
 */

import winston, { format, transports } from 'winston';

const executionTime = new Date().toISOString().substring(0, 10);

const logger = winston.createLogger({
  level: process.LOG_LEVEL || 'debug',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: `logs/${executionTime}.error.log`,
      level: 'error',
    }),
    new transports.File({ filename: `logs/${executionTime}.log` }),
    ...[
      process.env.NODE_ENV !== 'production' &&
        new transports.Console({
          format: winston.format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(
              ({ service = 'NOT SET', timestamp, level, message, ...rest }) =>
                `${timestamp} [\u001B[36m${service}\u001B[0m | ${level}]: ${message}${
                  Object.keys(rest).length
                    ? `\n${JSON.stringify(rest, null, 2)}`
                    : ''
                }`,
            ),
          ),
        }),
    ],
  ],
});

export default logger;
