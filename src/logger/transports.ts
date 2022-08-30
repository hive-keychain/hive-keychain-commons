/* istanbul ignore file */

import * as winston from 'winston';
import { LoggerFormats } from './formats';
import { LoggerConfig } from './logger';
import DailyRotateFile = require('winston-daily-rotate-file');
import path = require('path');

let fileRotationTransport: DailyRotateFile;
let consoleTransport: any;

const initTransport = (config: LoggerConfig) => {
  fileRotationTransport = new DailyRotateFile({
    filename: path.join(config.folder, config.file),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7',
    format: winston.format.combine(
      LoggerFormats.timestampFormat,
      LoggerFormats.logFormat,
    ),
  });

  consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
      LoggerFormats.timestampFormat,
      LoggerFormats.colorFormat,
      LoggerFormats.logFormat,
    ),
  });
};

const getConsoleTransport = () => {
  return consoleTransport;
};

const getFileRotationTransport = () => {
  return fileRotationTransport;
};

export const LoggerTransports = {
  getConsoleTransport,
  getFileRotationTransport,
  initTransport,
};
