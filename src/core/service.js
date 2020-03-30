/*
 * This represents the base of every node.
 * A node will create a tcp server with a listener on specified port.
 * Receiving any message it will try to parse it as defined by the µHome protocol
 */
import net from 'net';
import {
  parseMicroHomeMessage,
  microHomeMessage,
  createPayload,
  LATEST_VERSION,
} from './protocol';
import log from '../utils/logger';

const defaultLogger = log.child({ service: 'µHomeBaseService' });

const defaultListeners = [
  {
    event: 'data',
    handler: (socket, source, version, logger) => dataBuffer => {
      try {
        const { status, payload } = parseMicroHomeMessage(dataBuffer);
        logger.info('Received Data', { status, payload });
        if (status !== 1) {
          throw new Error('Error in Message');
        }

        // Do Something with Data

        socket.write(
          microHomeMessage(
            createPayload({ source, type: 'µHome.response' }),
            1,
            version,
            logger,
          ),
        );
      } catch (err) {
        socket.write(
          microHomeMessage(
            createPayload({ source, type: 'µHome.error', error: err.message }),
            2,
            version,
            logger,
          ),
        );
      }
    },
  },
];

// eslint-disable-next-line import/prefer-default-export
export const initTcpServer = (
  port = 5100,
  source,
  logger = defaultLogger,
  dataListeners = defaultListeners,
  version = LATEST_VERSION,
) => {
  const server = net.createServer(s => {
    dataListeners.forEach(({ event, handler }) => {
      s.on(event, handler(s, source, version, logger));
    });
  });
  server.listen(port);
  return server;
};
