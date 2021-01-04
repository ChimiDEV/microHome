import pino from 'pino';

const { LOG_LEVEL } = process.env;

export const create = (name: string): pino.Logger =>
  pino({ level: LOG_LEVEL || 'debug', name });

export default pino({ level: LOG_LEVEL || 'debug' });
