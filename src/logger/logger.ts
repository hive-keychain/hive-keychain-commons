/* eslint-disable */
/* istanbul ignore file */

import * as winston from 'winston';
import { LoggerTransports } from './transports';

let winstonLogger: winston.Logger;
let environment: string;

interface LoggerLevel {
  [level: string]: number;
}

interface LoggerConfig {
  levels: LoggerLevel;
  folder: string;
  file: string;
}

const initLogger = (config: LoggerConfig, env: string) => {
  environment = env;
  winstonLogger = winston.createLogger({
    levels: config.levels,
    level: 'DEBUG',
    transports: [
      LoggerTransports.fileRotationTransport,
      LoggerTransports.consoleTransport,
    ],
  }) as winston.Logger &
    Record<keyof typeof config['levels'], winston.LeveledLogMethod>;
};

const info = (message: string) => {
  if (environment === 'TEST') return;
  winstonLogger.log('INFO', message);
};

const debug = (message: string) => {
  if (environment === 'TEST') return;
  if (environment === 'DEBUG') {
    winstonLogger.log('DEBUG', message);
  }
};

const operation = (message: string) => {
  if (environment === 'TEST') return;
  winstonLogger.log('OPERATION', message);
};

const warn = (message: string) => {
  if (environment === 'TEST') return;
  winstonLogger.log('WARN', message);
};

const technical = (message: string) => {
  if (environment === 'TEST') return;
  winstonLogger.log('TECHNICAL', message);
};

const error = (message: any, stacktrace?: Error) => {
  if (environment === 'TEST') return;
  winstonLogger.log('ERROR', `${message}`);
  if (stacktrace)
    winstonLogger.log('ERROR', stacktrace.message + '\r\n' + stacktrace.stack);
};

const Logger = { info, warn, error, technical, operation, debug, initLogger };

export default Logger;
