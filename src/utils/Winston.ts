import winston from 'winston'

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'white',
}

winston.addColors(colors)

export const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

export const logger = winston.createLogger({
  level: 'debug',
  format: format,
  defaultMeta: { service: 'server' },
})
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({}))
}
